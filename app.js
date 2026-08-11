/* ============================================================
   SHAAM-E-GAZAL — app.js
   YouTube IFrame API player + tracklist + diya particles
   ============================================================ */

// ── Tracklist ──────────────────────────────────────────────
const TRACKS = [
  { id: "n_P41YQ3l24", title: "Hoshwalon Ko Khabar Kya",         artist: "Jagjit Singh" },
  { id: "Ju6kNKaBOQ8", title: "Tum Itna Jo Muskura Rahe Ho",     artist: "Jagjit Singh" },
  { id: "lO0Zz1QeSgM", title: "Woh Kagaz Ki Kashti",             artist: "Jagjit Singh" },
  { id: "gq0Q3J8Gg90", title: "Chitthi Na Koi Sandesh",          artist: "Jagjit Singh" },
  { id: "G0wK2X-45Wc", title: "Baat Niklegi To Phir Door Talak", artist: "Jagjit Singh" },
  { id: "k5yqG3m9s3c", title: "Kal Chaudhvin Ki Raat Thi",       artist: "Jagjit Singh" },
  { id: "g2bHwa2qc9E", title: "Afreen Afreen",                   artist: "Nusrat Fateh Ali Khan" },
  { id: "sD4b3_w4P4Q", title: "Yeh Dil Yeh Pagal Dil Mera",     artist: "Ghulam Ali" },
  { id: "Qj78GpU46Vc", title: "Na Kajre Ki Dhar",                artist: "Pankaj Udhas" },
  { id: "kY3jXhR8hQ8", title: "Aahista Aahista",                 artist: "Pankaj Udhas" },
  { id: "y2_eM9n05b4", title: "Ae Mohabbat Tere Anjam Pe",       artist: "Begum Akhtar" },
  { id: "F07T80cM50w", title: "Phir Chhidi Raat",                artist: "Lata Mangeshkar & Talat Aziz" },
  { id: "gq0Q3J8Gg90", title: "Dil Dhundta Hai",                 artist: "Bhupinder Singh & Lata Mangeshkar" },
  { id: "kY3jXhR8hQ8", title: "Ye Na Thi Hamari Qismat",         artist: "Pankaj Udhas" },
  { id: "sD4b3_w4P4Q", title: "Hungama Hai Kyon Barpa",          artist: "Ghulam Ali" },
  { id: "F07T80cM50w", title: "In Aankhon Ki Masti",             artist: "Asha Bhosle" },
  { id: "k5yqG3m9s3c", title: "Zindagi Jab Bhi Teri Bazm Mein", artist: "Talat Aziz" },
  { id: "y2_eM9n05b4", title: "Hamari Atariya Pe Aao",           artist: "Begum Akhtar" },
  { id: "G0wK2X-45Wc", title: "Tum Ko Dekha To Yeh Khayal Aaya",artist: "Jagjit Singh & Chitra Singh" },
  { id: "lO0Zz1QeSgM", title: "Aaj Jaane Ki Zid Na Karo",       artist: "Farida Khanum" },
  { id: "Qj78GpU46Vc", title: "Chandi Jaisa Rang Hai Tera",      artist: "Pankaj Udhas" },
  { id: "n_P41YQ3l24", title: "Koi Fariyaad",                    artist: "Jagjit Singh" },
  { id: "g2bHwa2qc9E", title: "Sanu Ek Pal Chain Na Aave",       artist: "Nusrat Fateh Ali Khan" },
  { id: "sD4b3_w4P4Q", title: "Do Ghadi Woh Jo Baithe",          artist: "Ghulam Ali" },
  { id: "Ju6kNKaBOQ8", title: "Har Taraf Aaj",                   artist: "Hariharan" },
  { id: "k5yqG3m9s3c", title: "Woh Baat Sari Ho Gayi",           artist: "Jagjit Singh" },
  { id: "F07T80cM50w", title: "Ranjish Hi Sahi",                 artist: "Mehdi Hassan" },
  { id: "G0wK2X-45Wc", title: "Dil Ki Baat",                     artist: "Hariharan" },
  { id: "lO0Zz1QeSgM", title: "Patta Patta Boota Boota",         artist: "Mehdi Hassan" },
  { id: "n_P41YQ3l24", title: "Tumko Dekha To",                   artist: "Jagjit Singh & Chitra Singh" },
];

// ── State ──────────────────────────────────────────────────
let player      = null;
let playerReady = false;   // ← KEY FIX: only true after onReady fires
let currentIndex = 0;
let isPlaying   = false;
let seekInterval = null;
let tracklistOpen = false;

// ── DOM refs ───────────────────────────────────────────────
const vinyl          = document.getElementById('vinyl');
const albumArt       = document.getElementById('albumArt');
const trackName      = document.getElementById('trackName');
const trackArtist    = document.getElementById('trackArtist');
const seekFill       = document.getElementById('seekFill');
const seekThumb      = document.getElementById('seekThumb');
const seekBar        = document.getElementById('seekBar');
const currentTime    = document.getElementById('currentTime');
const totalTime      = document.getElementById('totalTime');
const playBtn        = document.getElementById('playBtn');
const playIcon       = document.getElementById('playIcon');
const pauseIcon      = document.getElementById('pauseIcon');
const prevBtn        = document.getElementById('prevBtn');
const nextBtn        = document.getElementById('nextBtn');
const listBtn        = document.getElementById('listBtn');
const tracklistEl    = document.getElementById('tracklist');
const tracklistPanel = document.getElementById('tracklistPanel');
const trackBadge     = document.getElementById('trackBadge');
const tracklistCount = document.getElementById('tracklistCount');

// ── YouTube API Callback ───────────────────────────────────
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('ytPlayer', {
    height: '1',
    width:  '1',
    videoId: TRACKS[currentIndex].id,
    playerVars: {
      autoplay:        0,
      controls:        0,
      disablekb:       1,
      fs:              0,
      rel:             0,
      modestbranding:  1,
      iv_load_policy:  3,
      playsinline:     1,
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady() {
  playerReady = true;           // ← now safe to call playVideo / pauseVideo
  loadTrack(currentIndex, false);
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    setPlaying(true);
  } else if (event.data === YT.PlayerState.PAUSED) {
    setPlaying(false);
  } else if (event.data === YT.PlayerState.ENDED) {
    playNext();
  }
}

// ── Track Loading ─────────────────────────────────────────
function loadTrack(index, autoplay) {
  currentIndex = index;
  const track = TRACKS[index];

  trackName.textContent   = track.title;
  trackArtist.textContent = track.artist;
  albumArt.src = 'https://i.ytimg.com/vi/' + track.id + '/hqdefault.jpg';

  // Reset seek UI
  seekFill.style.width     = '0%';
  seekThumb.style.left     = '0%';
  currentTime.textContent  = '0:00';
  totalTime.textContent    = '0:00';
  seekBar.setAttribute('aria-valuenow', 0);

  // Highlight active row in tracklist
  document.querySelectorAll('.tracklist li button').forEach(function(btn, i) {
    btn.classList.toggle('active', i === index);
    btn.setAttribute('aria-selected', i === index);
    const bars = btn.querySelector('.tl-bars');
    const num  = btn.querySelector('.tl-num');
    if (bars && num) {
      bars.style.display = (i === index) ? 'flex' : 'none';
      num.style.display  = (i === index) ? 'none' : 'block';
    }
  });

  // Only call YouTube API methods when player is fully ready
  if (!playerReady) return;

  if (autoplay) {
    player.loadVideoById(track.id);
  } else {
    player.cueVideoById(track.id);
    setPlaying(false);
  }
}

// ── Play / Pause ──────────────────────────────────────────
function togglePlay() {
  if (!playerReady) return;   // ← guard: do nothing if not yet ready
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
  const dur = player.getDuration()    || 0;
  const cur = player.getCurrentTime() || 0;
  if (dur <= 0) return;
  const pct = (cur / dur) * 100;
  seekFill.style.width  = pct + '%';
  seekThumb.style.left  = pct + '%';
  seekBar.setAttribute('aria-valuenow', Math.round(pct));
  currentTime.textContent = fmtTime(cur);
  totalTime.textContent   = fmtTime(dur);
}

function fmtTime(s) {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

function seekTo(e) {
  if (!playerReady) return;
  const rect = seekBar.getBoundingClientRect();
  const clientX = e.clientX != null ? e.clientX
                : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const dur = player.getDuration() || 0;
  player.seekTo(pct * dur, true);
  seekFill.style.width = (pct * 100) + '%';
  seekThumb.style.left = (pct * 100) + '%';
}

// ── Next / Prev ───────────────────────────────────────────
function playNext() {
  loadTrack((currentIndex + 1) % TRACKS.length, true);
}
function playPrev() {
  // If more than 3 seconds in, restart; else go to previous
  if (playerReady && player.getCurrentTime() > 3) {
    player.seekTo(0, true);
  } else {
    loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length, true);
  }
}

// ── Tracklist ─────────────────────────────────────────────
function buildTracklist() {
  trackBadge.textContent   = TRACKS.length + ' \u0917\u093c\u091c\u093c\u0932\u0947\u0902 \u00b7 non-stop';
  tracklistCount.textContent = TRACKS.length + ' tracks';
  tracklistEl.innerHTML = '';

  TRACKS.forEach(function(track, i) {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', i === currentIndex);
    btn.setAttribute('data-index', i);
    btn.innerHTML =
      '<span class="tl-num">' + (i + 1) + '</span>' +
      '<span class="tl-bars" style="display:none">' +
        '<span class="tl-bar" style="height:6px"></span>' +
        '<span class="tl-bar" style="height:10px"></span>' +
        '<span class="tl-bar" style="height:7px"></span>' +
      '</span>' +
      '<img class="tl-thumb" src="https://i.ytimg.com/vi/' + track.id + '/default.jpg" alt="" loading="lazy" decoding="async" />' +
      '<span class="tl-info">' +
        '<span class="tl-name">'   + track.title  + '</span>' +
        '<span class="tl-artist">' + track.artist + '</span>' +
      '</span>';

    btn.addEventListener('click', function() { loadTrack(i, true); });
    li.appendChild(btn);
    tracklistEl.appendChild(li);
  });
}

function toggleTracklist() {
  tracklistOpen = !tracklistOpen;
  tracklistPanel.classList.toggle('open', tracklistOpen);
  tracklistPanel.setAttribute('aria-hidden', String(!tracklistOpen));
  listBtn.setAttribute('aria-expanded', String(tracklistOpen));
  if (tracklistOpen) {
    const active = tracklistEl.querySelector('button.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ── Diya Particle System ──────────────────────────────────
function initDiyas() {
  const canvas = document.getElementById('diyas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Diya(init) {
    this.reset(init);
  }
  Diya.prototype.reset = function(init) {
    this.x    = Math.random() * W;
    this.y    = init ? Math.random() * H : H + 10;
    this.r    = 1.5 + Math.random() * 2.5;
    this.vy   = -(0.18 + Math.random() * 0.3);
    this.vx   = (Math.random() - 0.5) * 0.15;
    this.alpha = 0;
    this.maxAlpha    = 0.22 + Math.random() * 0.32;
    this.flicker     = Math.random() * Math.PI * 2;
    this.flickerSpeed = 0.04 + Math.random() * 0.07;
  };
  Diya.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.flicker += this.flickerSpeed;
    const flicker = Math.sin(this.flicker) * 0.15;
    this.alpha = Math.min(this.maxAlpha, this.alpha + 0.007) + flicker;
    if (this.y < -10) this.reset(false);
  };
  Diya.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
    grad.addColorStop(0,   '#ffe680');
    grad.addColorStop(0.4, 'rgba(224,104,32,0.65)');
    grad.addColorStop(1,   'rgba(180,50,10,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const particles = [];
  for (let i = 0; i < 40; i++) particles.push(new Diya(true));

  (function frame() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function(p) { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  })();
}

// ── Equalizer bars animation ──────────────────────────────
function animateBars() {
  document.querySelectorAll('.tl-bars').forEach(function(bars) {
    bars.querySelectorAll('.tl-bar').forEach(function(b) {
      b.style.height = isPlaying ? (4 + Math.random() * 10) + 'px' : '4px';
    });
  });
  setTimeout(animateBars, 200);
}

// ── Event Listeners ───────────────────────────────────────
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);
listBtn.addEventListener('click', toggleTracklist);

seekBar.addEventListener('click', seekTo);
seekBar.addEventListener('touchstart', function(e) {
  e.preventDefault();
  seekTo(e);
}, { passive: false });

seekBar.addEventListener('keydown', function(e) {
  if (!playerReady) return;
  const dur = player.getDuration() || 0;
  if (e.key === 'ArrowRight') player.seekTo(Math.min(dur, player.getCurrentTime() + 5), true);
  if (e.key === 'ArrowLeft')  player.seekTo(Math.max(0,   player.getCurrentTime() - 5), true);
});

// Close tracklist on outside click
document.addEventListener('click', function(e) {
  if (tracklistOpen && !tracklistPanel.contains(e.target) && e.target !== listBtn) {
    toggleTracklist();
  }
});

// ── Init ──────────────────────────────────────────────────
buildTracklist();
initDiyas();
animateBars();

// Show first track info immediately (before YT loads)
trackName.textContent   = TRACKS[0].title;
trackArtist.textContent = TRACKS[0].artist;
albumArt.src = 'https://i.ytimg.com/vi/' + TRACKS[0].id + '/hqdefault.jpg';
