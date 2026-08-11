/* ============================================================
   SHAAM-E-GAZAL — app.js
   Dynamic YouTube Playlist Sync & Player UI
   ============================================================ */

// ── ▼▼▼ SET YOUR YOUTUBE PLAYLIST ID HERE ▼▼▼ ───────────
var PLAYLIST_ID = 'PLRvvhiNg2sHs';
// ── ▲▲▲ REPLACE WITH YOUR PLAYLIST ID ▲▲▲ ───────────────

// ── State ──────────────────────────────────────────────────
var player        = null;
var playerReady   = false;
var currentIndex  = 0;
var isPlaying     = false;
var seekInterval  = null;
var tracklistOpen = false;
var playlistTrackData = {}; // Cache metadata per index: { 0: { title, artist, id } }

// ── DOM refs ───────────────────────────────────────────────
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

// ── Helper: Parse YouTube video titles nicely ──────────────
function parseVideoMetadata(title, author) {
  if (!title) return { title: 'Ghazal', artist: author || 'Shaam-e-Gazal' };

  // Remove common YouTube clutter words
  var clean = title
    .replace(/[\(\[\{].*?[\)\]\}]/g, '')
    .replace(/\|\s*(Saregama|Tips|T-Series|Venus|Official|YRF|Sony).*$/i, '')
    .replace(/full song/gi, '')
    .replace(/lyrical video/gi, '')
    .replace(/lyrical/gi, '')
    .replace(/audio jukebox/gi, '')
    .replace(/official video/gi, '')
    .replace(/hd video/gi, '')
    .trim();

  // Split by hyphens or pipes if present: "Artist - Song" or "Song - Artist"
  var parts = clean.split(/[-|–—]/);
  if (parts.length >= 2) {
    var p1 = parts[0].trim();
    var p2 = parts[1].trim();

    var known = ['jagjit', 'chitra', 'pankaj', 'begum', 'nusrat', 'ghulam', 'talat', 'hariharan', 'mehdi', 'lata', 'asha', 'bhupinder', 'farida'];
    var p1Low = p1.toLowerCase();
    var p2Low = p2.toLowerCase();

    var p1IsArtist = known.some(function(k) { return p1Low.includes(k); });
    var p2IsArtist = known.some(function(k) { return p2Low.includes(k); });

    if (p1IsArtist && !p2IsArtist) {
      return { title: p2, artist: p1 };
    } else if (p2IsArtist && !p1IsArtist) {
      return { title: p1, artist: p2 };
    } else if (p1.length > 0 && p2.length > 0) {
      return { title: p2, artist: p1 };
    }
  }

  return { title: clean || 'Ghazal', artist: author || 'Shaam-e-Gazal' };
}

// ── YouTube API Callback ───────────────────────────────────
window.onYouTubeIframeAPIReady = function () {
  console.log('[SEG] YouTube API Ready. Initializing player...');
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
  console.log('[SEG] Player Ready! Syncing with YouTube Playlist...');
  playerReady = true;

  // Build initial tracklist UI from YouTube's loaded playlist
  buildTracklistFromPlaylist();

  // Sync UI with current video
  syncUIWithLivePlayer();
}

function onPlayerStateChange(event) {
  var states = {'-1':'UNSTARTED','0':'ENDED','1':'PLAYING','2':'PAUSED','3':'BUFFERING','5':'CUED'};
  console.log('[SEG] State change:', states[event.data] || event.data);

  if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.CUED) {
    syncUIWithLivePlayer();
  }

  if (event.data === YT.PlayerState.PLAYING) {
    setPlaying(true);
  }
  if (event.data === YT.PlayerState.PAUSED) {
    setPlaying(false);
  }
  if (event.data === YT.PlayerState.ENDED) {
    player.nextVideo();
  }
}

function onPlayerError(event) {
  console.warn('[SEG] Error on video, skipping to next:', event.data);
  setTimeout(function() {
    if (playerReady && player.nextVideo) player.nextVideo();
  }, 1000);
}

// ── Live Sync UI from YouTube Player ──────────────────────
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

    // Cache metadata for tracklist updating
    playlistTrackData[idx] = {
      title: parsed.title,
      artist: parsed.artist,
      id: data.video_id
    };

    updateTracklistItem(idx, parsed.title, parsed.artist, data.video_id);
  }

  highlightTracklist(currentIndex);
}

// ── Tracklist UI Helpers ──────────────────────────────────
function buildTracklistFromPlaylist() {
  var playlist = player.getPlaylist ? player.getPlaylist() : [];
  var total = playlist ? playlist.length : 0;

  if (total > 0) {
    trackBadge.textContent     = total + ' \u0917\u093c\u091c\u093c\u0932\u0947\u0902 \u00b7 non-stop';
    tracklistCount.textContent = total + ' tracks';
  }

  tracklistEl.innerHTML = '';

  for (var i = 0; i < (total || 30); i++) {
    var videoId = playlist ? playlist[i] : null;
    var cached  = playlistTrackData[i] || { title: 'Ghazal #' + (i + 1), artist: 'Shaam-e-Gazal' };

    var li  = document.createElement('li');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', i === 0);
    btn.setAttribute('id', 'tl-btn-' + i);

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
    tracklistEl.appendChild(li);
  }
}

function updateTracklistItem(index, title, artist, videoId) {
  var btn = document.getElementById('tl-btn-' + index);
  if (!btn) return;

  var nameEl   = btn.querySelector('.tl-name');
  var artistEl = btn.querySelector('.tl-artist');
  var imgEl    = btn.querySelector('.tl-thumb');

  if (nameEl)   nameEl.textContent   = title;
  if (artistEl) artistEl.textContent = artist;

  if (videoId && !imgEl) {
    var newImg = document.createElement('img');
    newImg.className = 'tl-thumb';
    newImg.src = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
    var bars = btn.querySelector('.tl-bars');
    if (bars) bars.after(newImg);
  } else if (videoId && imgEl) {
    imgEl.src = 'https://i.ytimg.com/vi/' + videoId + '/mqdefault.jpg';
  }
}

function highlightTracklist(index) {
  document.querySelectorAll('.tracklist li button').forEach(function(btn, i) {
    var isActive = (i === index);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
    var bars = btn.querySelector('.tl-bars');
    var num  = btn.querySelector('.tl-num');
    if (bars && num) {
      bars.style.display = isActive ? 'flex' : 'none';
      num.style.display  = isActive ? 'none' : 'block';
    }
  });
}

// ── Play / Pause ──────────────────────────────────────────
function togglePlay() {
  if (!playerReady) {
    alert('Player still loading — please wait a moment.');
    return;
  }
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function setPlaying(val) {
  isPlaying = val;
  vinyl.classList.toggle('playing', val);
  playBtn.setAttribute('aria-pressed', String(val));
  playIcon.style.display  = val ? 'none'  : 'block';
  pauseIcon.style.display = val ? 'block' : 'none';
  if (val) {
    clearInterval(seekInterval);
    seekInterval = setInterval(updateSeek, 500);
  } else {
    clearInterval(seekInterval);
  }
}

// ── Seek ──────────────────────────────────────────────────
function updateSeek() {
  if (!playerReady) return;
  var dur = player.getDuration()    || 0;
  var cur = player.getCurrentTime() || 0;
  if (dur <= 0) return;
  var pct = (cur / dur) * 100;
  seekFill.style.width  = pct + '%';
  seekThumb.style.left  = pct + '%';
  seekBar.setAttribute('aria-valuenow', Math.round(pct));
  currentTimeEl.textContent = fmtTime(cur);
  totalTimeEl.textContent   = fmtTime(dur);
}

function fmtTime(s) {
  var m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return m + ':' + (sec < 10 ? '0' : '') + sec;
}

function seekTo(e) {
  if (!playerReady) return;
  var rect    = seekBar.getBoundingClientRect();
  var clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
  var pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  player.seekTo(pct * (player.getDuration() || 0), true);
  seekFill.style.width = (pct * 100) + '%';
  seekThumb.style.left = (pct * 100) + '%';
}

// ── Next / Prev ───────────────────────────────────────────
function playNext() {
  if (!playerReady) return;
  player.nextVideo();
}
function playPrev() {
  if (!playerReady) return;
  if (player.getCurrentTime() > 3) { player.seekTo(0, true); }
  else                              { player.previousVideo(); }
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

// ── Diya Particle System ──────────────────────────────────
function initDiyas() {
  var canvas = document.getElementById('diyas');
  var ctx    = canvas.getContext('2d');
  var W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function Diya(init) { this.reset(init); }
  Diya.prototype.reset = function(init) {
    this.x = Math.random() * W; this.y = init ? Math.random() * H : H + 10;
    this.r = 1.5 + Math.random() * 2.5; this.vy = -(0.18 + Math.random() * 0.3);
    this.vx = (Math.random() - 0.5) * 0.15; this.alpha = 0;
    this.maxAlpha = 0.22 + Math.random() * 0.32;
    this.flicker = Math.random() * Math.PI * 2; this.flickerSpeed = 0.04 + Math.random() * 0.07;
  };
  Diya.prototype.update = function() {
    this.x += this.vx; this.y += this.vy; this.flicker += this.flickerSpeed;
    this.alpha = Math.min(this.maxAlpha, this.alpha + 0.007) + Math.sin(this.flicker) * 0.15;
    if (this.y < -10) this.reset(false);
  };
  Diya.prototype.draw = function() {
    ctx.save(); ctx.globalAlpha = Math.max(0, this.alpha);
    var g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
    g.addColorStop(0, '#ffe680'); g.addColorStop(0.4, 'rgba(224,104,32,0.65)');
    g.addColorStop(1, 'rgba(180,50,10,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  var particles = [];
  for (var i = 0; i < 40; i++) particles.push(new Diya(true));
  (function frame() { ctx.clearRect(0,0,W,H); particles.forEach(function(p){p.update();p.draw();}); requestAnimationFrame(frame); })();
}

// ── Equalizer bars ────────────────────────────────────────
function animateBars() {
  document.querySelectorAll('.tl-bars').forEach(function(bars) {
    bars.querySelectorAll('.tl-bar').forEach(function(b) {
      b.style.height = isPlaying ? (4 + Math.random() * 10) + 'px' : '4px';
    });
  });
  setTimeout(animateBars, 200);
}

// ── Events ────────────────────────────────────────────────
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);
listBtn.addEventListener('click', toggleTracklist);
seekBar.addEventListener('click', seekTo);
seekBar.addEventListener('touchstart', function(e) { e.preventDefault(); seekTo(e); }, { passive: false });
seekBar.addEventListener('keydown', function(e) {
  if (!playerReady) return;
  var dur = player.getDuration() || 0;
  if (e.key === 'ArrowRight') player.seekTo(Math.min(dur, player.getCurrentTime() + 5), true);
  if (e.key === 'ArrowLeft')  player.seekTo(Math.max(0, player.getCurrentTime() - 5), true);
});
document.addEventListener('click', function(e) {
  if (tracklistOpen && !tracklistPanel.contains(e.target) && e.target !== listBtn) toggleTracklist();
});

// ── Init ──────────────────────────────────────────────────
initDiyas();
animateBars();

console.log('[SEG] app.js initialized with Live Sync.');
