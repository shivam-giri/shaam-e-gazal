/* ============================================================
   SHAAM-E-GAZAL — app.js
   Dynamic YouTube Sync, Canvas Particles & Responsive Controls
   ============================================================ */

// ── Default YouTube Playlist ID ────────────────────────────
var PLAYLIST_ID = 'PLRvvhiNg2sHs';

// ── State ──────────────────────────────────────────────────
var player            = null;
var playerReady       = false;
var currentIndex      = 0;
var isPlaying         = false;
var seekInterval      = null;
var tracklistOpen     = false;
var isDraggingSeek    = false;
var playlistTrackData = {};

// ── DOM Element Cache ──────────────────────────────────────
var vinyl          = document.getElementById('vinyl');
var albumArt       = document.getElementById('albumArt');
var trackName      = document.getElementById('trackName');
var trackArtist    = document.getElementById('trackArtist');
var seekFill       = document.getElementById('seekFill');
var seekThumb      = document.getElementById('seekThumb');
var seekBar        = document.getElementById('seekBar');
var currentTimeEl  = document.getElementById('currentTime');
var totalTimeEl    = document.getElementById('totalTime');
var playBtn        = document.getElementById('playBtn');
var playIcon       = document.getElementById('playIcon');
var pauseIcon      = document.getElementById('pauseIcon');
var prevBtn        = document.getElementById('prevBtn');
var nextBtn        = document.getElementById('nextBtn');
var listBtn        = document.getElementById('listBtn');
var tracklistEl    = document.getElementById('tracklist');
var tracklistPanel = document.getElementById('tracklistPanel');
var trackBadge     = document.getElementById('trackBadge');
var tracklistCount = document.getElementById('tracklistCount');
var liveCountEl    = document.getElementById('liveCount');

// ── Title / Artist Parser ──────────────────────────────────
var KNOWN_ARTISTS = [
  'jagjit', 'chitra', 'pankaj', 'begum', 'nusrat', 'ghulam',
  'talat', 'hariharan', 'mehdi', 'lata', 'asha', 'bhupinder', 'farida'
];

function parseVideoMetadata(title, author) {
  if (!title) return { title: 'Ghazal', artist: author || 'Shaam-e-Gazal' };

  var clean = title
    .replace(/[\(\[\{].*?[\)\]\}]/g, '')
    .replace(/\|\s*(Saregama|Tips|T-Series|Venus|Official|YRF|Sony).*$/i, '')
    .replace(/full song|lyrical video|lyrical|audio jukebox|official video|hd video/gi, '')
    .trim();

  var parts = clean.split(/[-|–—]/);
  if (parts.length >= 2) {
    var p1 = parts[0].trim();
    var p2 = parts[1].trim();

    var p1Low = p1.toLowerCase();
    var p2Low = p2.toLowerCase();

    var p1IsArtist = KNOWN_ARTISTS.some(function(k) { return p1Low.includes(k); });
    var p2IsArtist = KNOWN_ARTISTS.some(function(k) { return p2Low.includes(k); });

    if (p1IsArtist && !p2IsArtist) return { title: p2, artist: p1 };
    if (p2IsArtist && !p1IsArtist) return { title: p1, artist: p2 };
    if (p1.length > 0 && p2.length > 0) return { title: p2, artist: p1 };
  }

  return { title: clean || 'Ghazal', artist: author || 'Shaam-e-Gazal' };
}

// ── YouTube API Handlers ───────────────────────────────────
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('ytPlayer', {
    height: '112',
    width:  '200',
    playerVars: {
      listType:       'playlist',
      list:           PLAYLIST_ID,
      autoplay:       0,
      controls:       0,
      disablekb:      1,
      fs:             0,
      rel:            0,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline:    1,
      origin:         window.location.origin,
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError:       onPlayerError,
    },
  });
};

function onPlayerReady() {
  playerReady = true;
  buildTracklistFromPlaylist();
  syncUIWithLivePlayer();
}

function onPlayerStateChange(event) {
  var state = event.data;
  if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING || state === YT.PlayerState.CUED) {
    syncUIWithLivePlayer();
  }
  if (state === YT.PlayerState.PLAYING) setPlaying(true);
  if (state === YT.PlayerState.PAUSED)  setPlaying(false);
  if (state === YT.PlayerState.ENDED)   player.nextVideo();
}

function onPlayerError() {
  setTimeout(function() {
    if (playerReady && player.nextVideo) player.nextVideo();
  }, 1000);
}

// ── Live Player Sync ───────────────────────────────────────
function syncUIWithLivePlayer() {
  if (!playerReady || !player.getVideoData) return;

  var data = player.getVideoData();
  var idx  = player.getPlaylistIndex ? player.getPlaylistIndex() : 0;
  if (idx < 0) idx = 0;
  currentIndex = idx;

  if (data && data.title) {
    var parsed = parseVideoMetadata(data.title, data.author);
    trackName.textContent   = parsed.title;
    trackArtist.textContent = parsed.artist;

    if (data.video_id) {
      albumArt.src = 'https://i.ytimg.com/vi/' + data.video_id + '/mqdefault.jpg';
    }

    playlistTrackData[idx] = { title: parsed.title, artist: parsed.artist, id: data.video_id };
    updateTracklistItem(idx, parsed.title, parsed.artist, data.video_id);
  }

  highlightTracklist(currentIndex);
}

// ── Tracklist UI Helpers ──────────────────────────────────
function buildTracklistFromPlaylist() {
  var playlist = player.getPlaylist ? player.getPlaylist() : [];
  var total = playlist ? playlist.length : 0;

  if (total > 0) {
    trackBadge.textContent     = total + ' ग़ज़लें · non-stop';
    tracklistCount.textContent = total + ' tracks';
  }

  tracklistEl.innerHTML = '';
  var fragment = document.createDocumentFragment();

  for (var i = 0; i < (total || 30); i++) {
    var videoId = playlist ? playlist[i] : null;
    var cached  = playlistTrackData[i] || { title: 'Ghazal #' + (i + 1), artist: 'Shaam-e-Gazal' };

    var li  = document.createElement('li');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', String(i === 0));
    btn.id = 'tl-btn-' + i;

    var imgHtml = videoId
      ? '<img class="tl-thumb" src="https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg" alt="" loading="lazy" />'
      : '';

    btn.innerHTML =
      '<span class="tl-num">' + (i + 1) + '</span>' +
      '<span class="tl-bars" style="display:none">' +
        '<span class="tl-bar" style="height:6px"></span>' +
        '<span class="tl-bar" style="height:10px"></span>' +
        '<span class="tl-bar" style="height:7px"></span>' +
      '</span>' +
      imgHtml +
      '<span class="tl-info">' +
        '<span class="tl-name">'   + cached.title  + '</span>' +
        '<span class="tl-artist">' + cached.artist + '</span>' +
      '</span>';

    btn.addEventListener('click', (function(index) {
      return function() {
        if (!playerReady) return;
        player.playVideoAt(index);
        currentIndex = index;
        highlightTracklist(index);
      };
    })(i));

    li.appendChild(btn);
    fragment.appendChild(li);
  }

  tracklistEl.appendChild(fragment);
}

function updateTracklistItem(index, title, artist, videoId) {
  var btn = document.getElementById('tl-btn-' + index);
  if (!btn) return;

  var nameEl   = btn.querySelector('.tl-name');
  var artistEl = btn.querySelector('.tl-artist');
  var imgEl    = btn.querySelector('.tl-thumb');

  if (nameEl)   nameEl.textContent   = title;
  if (artistEl) artistEl.textContent = artist;

  if (videoId) {
    if (!imgEl) {
      var newImg = document.createElement('img');
      newImg.className = 'tl-thumb';
      newImg.src = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
      var bars = btn.querySelector('.tl-bars');
      if (bars) bars.after(newImg);
    } else {
      imgEl.src = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
    }
  }
}

function highlightTracklist(index) {
  var buttons = tracklistEl.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    var isActive = (i === index);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
    var bars = btn.querySelector('.tl-bars');
    var num  = btn.querySelector('.tl-num');
    if (bars && num) {
      bars.style.display = isActive ? 'flex' : 'none';
      num.style.display  = isActive ? 'none' : 'block';
    }
  }
}

// ── Play / Pause ──────────────────────────────────────────
function togglePlay() {
  if (!playerReady) return;
  if (isPlaying) { player.pauseVideo(); }
  else           { player.playVideo();  }
}

function setPlaying(val) {
  isPlaying = val;
  vinyl.classList.toggle('playing', val);
  playBtn.setAttribute('aria-pressed', String(val));
  playIcon.style.display  = val ? 'none'  : 'block';
  pauseIcon.style.display = val ? 'block' : 'none';

  clearInterval(seekInterval);
  if (val) seekInterval = setInterval(updateSeek, 500);
}

// ── Seek & Touch Dragging ──────────────────────────────────
function fmtTime(s) {
  var m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function updateSeek() {
  if (!playerReady || isDraggingSeek) return;
  var dur = player.getDuration()    || 0;
  var cur = player.getCurrentTime() || 0;
  if (dur <= 0) return;
  var pct = (cur / dur) * 100;
  seekFill.style.width = pct + '%';
  seekThumb.style.left = pct + '%';
  seekBar.setAttribute('aria-valuenow', Math.round(pct));
  currentTimeEl.textContent = fmtTime(cur);
  totalTimeEl.textContent   = fmtTime(dur);
}

function getPctFromEvent(e) {
  var rect    = seekBar.getBoundingClientRect();
  var clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
}

function seekTo(e) {
  if (!playerReady) return;
  var pct = getPctFromEvent(e);
  player.seekTo(pct * (player.getDuration() || 0), true);
  seekFill.style.width = (pct * 100) + '%';
  seekThumb.style.left = (pct * 100) + '%';
}

function onSeekDrag(e) {
  if (!playerReady) return;
  var pct = getPctFromEvent(e);
  seekFill.style.width = (pct * 100) + '%';
  seekThumb.style.left = (pct * 100) + '%';
}

// ── Track Navigation ──────────────────────────────────────
function playNext() {
  if (playerReady) player.nextVideo();
}
function playPrev() {
  if (!playerReady) return;
  if (player.getCurrentTime() > 3) player.seekTo(0, true);
  else                             player.previousVideo();
}

function toggleTracklist() {
  tracklistOpen = !tracklistOpen;
  tracklistPanel.classList.toggle('open', tracklistOpen);
  tracklistPanel.setAttribute('aria-hidden', String(!tracklistOpen));
  listBtn.setAttribute('aria-expanded', String(tracklistOpen));
  if (tracklistOpen) {
    var active = tracklistEl.querySelector('button.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ── Optimized Diya Particle Engine ────────────────────────
function initDiyas() {
  var canvas = document.getElementById('diyas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function Diya(init) { this.reset(init); }
  Diya.prototype.reset = function(init) {
    this.x            = Math.random() * W;
    this.y            = init ? Math.random() * H : H + 10;
    this.r            = 1.5 + Math.random() * 2.5;
    this.vy           = -(0.18 + Math.random() * 0.3);
    this.vx           = (Math.random() - 0.5) * 0.15;
    this.alpha        = 0;
    this.maxAlpha     = 0.22 + Math.random() * 0.32;
    this.flicker      = Math.random() * Math.PI * 2;
    this.flickerSpeed = 0.04 + Math.random() * 0.07;
  };

  Diya.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.flicker += this.flickerSpeed;
    this.alpha = Math.min(this.maxAlpha, this.alpha + 0.007) + Math.sin(this.flicker) * 0.15;
    if (this.y < -10) this.reset(false);
  };

  Diya.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
    g.addColorStop(0,   '#ffe680');
    g.addColorStop(0.4, 'rgba(224,104,32,0.65)');
    g.addColorStop(1,   'rgba(180,50,10,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  var particles = [];
  for (var i = 0; i < 35; i++) particles.push(new Diya(true));

  // Battery / CPU Saver: pause particles when page is hidden
  function renderLoop() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < particles.length; j++) {
        particles[j].update();
        particles[j].draw();
      }
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);
}

// ── Equalizer Bars ────────────────────────────────────────
function animateBars() {
  if (isPlaying && tracklistOpen) {
    var barsList = tracklistEl.querySelectorAll('.tl-bars');
    for (var i = 0; i < barsList.length; i++) {
      var bars = barsList[i].querySelectorAll('.tl-bar');
      for (var k = 0; k < bars.length; k++) {
        bars[k].style.height = (4 + Math.random() * 10) + 'px';
      }
    }
  }
  setTimeout(animateBars, 200);
}

// ── Live Presence Engine ──────────────────────────────────
function initLiveCounter() {
  if (!liveCountEl) return;
  var baseCount = 1, tabOffset = 0;

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      var channel = new BroadcastChannel('shaam_e_gazal_presence');
      channel.postMessage({ type: 'ping' });
      channel.onmessage = function(e) {
        if (e.data && (e.data.type === 'ping' || e.data.type === 'pong')) {
          if (e.data.type === 'ping') channel.postMessage({ type: 'pong' });
          tabOffset++;
          updateDisplay();
        }
      };
    } catch (err) { /* silent fallback */ }
  }

  function calculateCount() {
    var hour = new Date().getHours();
    var mehfilBoost = (hour >= 18 || hour <= 2) ? 4 : 2;
    return Math.max(1, baseCount + tabOffset + mehfilBoost + Math.floor(Math.random() * 3));
  }

  function updateDisplay() {
    liveCountEl.textContent = calculateCount() + ' in mehfil';
  }

  updateDisplay();
  setInterval(updateDisplay, 16000);
}

// ── Event Listeners ───────────────────────────────────────
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);
listBtn.addEventListener('click', toggleTracklist);

seekBar.addEventListener('click', seekTo);
seekBar.addEventListener('touchstart', function(e) { isDraggingSeek = true; seekTo(e); }, { passive: true });
seekBar.addEventListener('touchmove', function(e) { if (isDraggingSeek) onSeekDrag(e); }, { passive: true });
seekBar.addEventListener('touchend', function(e) {
  if (isDraggingSeek) { isDraggingSeek = false; seekTo(e); }
}, { passive: true });

seekBar.addEventListener('keydown', function(e) {
  if (!playerReady) return;
  var dur = player.getDuration() || 0;
  if (e.key === 'ArrowRight') player.seekTo(Math.min(dur, player.getCurrentTime() + 5), true);
  if (e.key === 'ArrowLeft')  player.seekTo(Math.max(0, player.getCurrentTime() - 5), true);
});

document.addEventListener('click', function(e) {
  if (tracklistOpen && !tracklistPanel.contains(e.target) && e.target !== listBtn) toggleTracklist();
});

// ── Init App ──────────────────────────────────────────────
initDiyas();
animateBars();
initLiveCounter();