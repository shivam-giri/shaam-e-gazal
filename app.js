/* ============================================================
   SHAAM-E-GAZAL — app.js
   YouTube IFrame API player + tracklist + diya particles
   ============================================================ */

// ── Tracklist ──────────────────────────────────────────────
const TRACKS = [
  { id: "n_P41YQ3l24", title: "Hoshwalon Ko Khabar Kya",      artist: "Jagjit Singh" },
  { id: "Ju6kNKaBOQ8", title: "Tum Itna Jo Muskura Rahe Ho",  artist: "Jagjit Singh" },
  { id: "lO0Zz1QeSgM", title: "Woh Kagaz Ki Kashti",          artist: "Jagjit Singh" },
  { id: "gq0Q3J8Gg90", title: "Chitthi Na Koi Sandesh",       artist: "Jagjit Singh" },
  { id: "G0wK2X-45Wc", title: "Baat Niklegi To Phir Door Talak", artist: "Jagjit Singh" },
  { id: "k5yqG3m9s3c", title: "Kal Chaudhvin Ki Raat Thi",    artist: "Jagjit Singh" },
  { id: "g2bHwa2qc9E", title: "Afreen Afreen",                artist: "Nusrat Fateh Ali Khan" },
  { id: "sD4b3_w4P4Q", title: "Yeh Dil Yeh Pagal Dil Mera",  artist: "Ghulam Ali" },
  { id: "Qj78GpU46Vc", title: "Na Kajre Ki Dhar",             artist: "Pankaj Udhas" },
  { id: "kY3jXhR8hQ8", title: "Aahista Aahista",              artist: "Pankaj Udhas" },
  { id: "y2_eM9n05b4", title: "Ae Mohabbat Tere Anjam Pe",    artist: "Begum Akhtar" },
  { id: "F07T80cM50w", title: "Phir Chhidi Raat",             artist: "Lata Mangeshkar & Talat Aziz" },
  { id: "n_P41YQ3l24", title: "Hoshwalon Ko Khabar Kya (Live)", artist: "Jagjit Singh" },
  { id: "gq0Q3J8Gg90", title: "Dil Dhundta Hai (Mausam)",     artist: "Bhupinder Singh & Lata" },
  { id: "Ju6kNKaBOQ8", title: "Arth Medley",                  artist: "Jagjit Singh & Chitra Singh" },
  { id: "g2bHwa2qc9E", title: "Afreen Afreen (Instrumental)", artist: "Nusrat Fateh Ali Khan" },
  { id: "kY3jXhR8hQ8", title: "Ye Na Thi Hamari Qismat",      artist: "Pankaj Udhas" },
  { id: "sD4b3_w4P4Q", title: "Hungama Hai Kyon Barpa",       artist: "Ghulam Ali" },
  { id: "F07T80cM50w", title: "In Aankhon Ki Masti",          artist: "Asha Bhosle" },
  { id: "k5yqG3m9s3c", title: "Zindagi Jab Bhi",              artist: "Talat Aziz" },
  { id: "y2_eM9n05b4", title: "Hamari Atariya Pe Aao",        artist: "Begum Akhtar" },
  { id: "G0wK2X-45Wc", title: "Tum Ko Dekha To Yeh Khayal",  artist: "Jagjit Singh & Chitra Singh" },
  { id: "lO0Zz1QeSgM", title: "Aaj Jaane Ki Zid Na Karo",    artist: "Farida Khanum" },
  { id: "Qj78GpU46Vc", title: "Chandi Jaisa Rang Hai Tera",   artist: "Pankaj Udhas" },
  { id: "n_P41YQ3l24", title: "Koi Fariyaad",                 artist: "Jagjit Singh" },
  { id: "g2bHwa2qc9E", title: "Sanu Ek Pal Chain Na Aave",    artist: "Nusrat Fateh Ali Khan" },
  { id: "sD4b3_w4P4Q", title: "Do Ghadi Woh Jo Baithe",       artist: "Ghulam Ali" },
  { id: "Ju6kNKaBOQ8", title: "Har Taraf Ab Yahi Afsane Hai", artist: "Hariharan" },
  { id: "k5yqG3m9s3c", title: "Woh Baat Sari Ho Gayi",        artist: "Jagjit Singh" },
  { id: "F07T80cM50w", title: "Ranjish Hi Sahi",              artist: "Mehdi Hassan" },
];

// ── State ──────────────────────────────────────────────────
let player = null;
let currentIndex = 0;
let isPlaying = false;
let seekInterval = null;
let tracklistOpen = false;

// ── DOM refs ───────────────────────────────────────────────
const vinyl       = document.getElementById('vinyl');
const albumArt    = document.getElementById('albumArt');
const trackName   = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
const seekFill    = document.getElementById('seekFill');
const seekThumb   = document.getElementById('seekThumb');
const seekBar     = document.getElementById('seekBar');
const currentTime = document.getElementById('currentTime');
const totalTime   = document.getElementById('totalTime');
const playBtn     = document.getElementById('playBtn');
const playIcon    = document.getElementById('playIcon');
const pauseIcon   = document.getElementById('pauseIcon');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const listBtn     = document.getElementById('listBtn');
const tracklistEl = document.getElementById('tracklist');
const tracklistPanel = document.getElementById('tracklistPanel');
const trackBadge  = document.getElementById('trackBadge');
const tracklistCount = document.getElementById('tracklistCount');

// ── YouTube API Callback ───────────────────────────────────
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('ytPlayer', {
    height: '1',
    width: '1',
    videoId: TRACKS[currentIndex].id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline: 1,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady() {
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
  albumArt.src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;

  // Reset seek
  seekFill.style.width  = '0%';
  seekThumb.style.left  = '0%';
  currentTime.textContent = '0:00';
  totalTime.textContent   = '0:00';
  seekBar.setAttribute('aria-valuenow', 0);

  // Highlight active in tracklist
  document.querySelectorAll('.tracklist li button').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
    const bars = btn.querySelector('.tl-bars');
    const num  = btn.querySelector('.tl-num');
    if (bars && num) {
      bars.style.display = i === index ? 'flex' : 'none';
      num.style.display  = i === index ? 'none' : 'block';
    }
  });

  // Load in YouTube player
  if (player && player.loadVideoById) {
    if (autoplay) {
      player.loadVideoById(track.id);
    } else {
      player.cueVideoById(track.id);
      setPlaying(false);
    }
  }
}

// ── Play / Pause ──────────────────────────────────────────
function togglePlay() {
  if (!player) return;
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function setPlaying(val) {
  isPlaying = val;
  vinyl.classList.toggle('playing', val);
  playBtn.setAttribute('aria-pressed', val);
  playIcon.style.display  = val ? 'none' : 'block';
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
  if (!player || !player.getDuration) return;
  const dur = player.getDuration() || 0;
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
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function seekTo(e) {
  if (!player || !player.getDuration) return;
  const rect = seekBar.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const pct = Math.max(0, Math.min(1, x / rect.width));
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
  loadTrack((currentIndex - 1 + TRACKS.length) % TRACKS.length, true);
}

// ── Tracklist ─────────────────────────────────────────────
function buildTracklist() {
  trackBadge.textContent = `${TRACKS.length} ग़ज़लें · non-stop`;
  tracklistCount.textContent = `${TRACKS.length} tracks`;
  tracklistEl.innerHTML = '';
  TRACKS.forEach((track, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <button type="button" role="option" aria-selected="${i === currentIndex}" data-index="${i}">
        <span class="tl-num">${i + 1}</span>
        <span class="tl-bars" style="display:none">
          <span class="tl-bar" style="height:6px"></span>
          <span class="tl-bar" style="height:10px"></span>
          <span class="tl-bar" style="height:7px"></span>
        </span>
        <img class="tl-thumb" src="https://i.ytimg.com/vi/${track.id}/default.jpg" alt="" loading="lazy" decoding="async" />
        <span class="tl-info">
          <span class="tl-name">${track.title}</span>
          <span class="tl-artist">${track.artist}</span>
        </span>
      </button>`;
    li.querySelector('button').addEventListener('click', () => {
      loadTrack(i, true);
    });
    tracklistEl.appendChild(li);
  });
}

function toggleTracklist() {
  tracklistOpen = !tracklistOpen;
  tracklistPanel.classList.toggle('open', tracklistOpen);
  tracklistPanel.setAttribute('aria-hidden', !tracklistOpen);
  listBtn.setAttribute('aria-expanded', tracklistOpen);
  if (tracklistOpen) {
    // Scroll active item into view
    const active = tracklistEl.querySelector('button.active');
    if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ── Diya Particle System ──────────────────────────────────
function initDiyas() {
  const canvas = document.getElementById('diyas');
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Diya {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = 1.5 + Math.random() * 2.5;
      this.vy = -(0.2 + Math.random() * 0.35);
      this.vx = (Math.random() - 0.5) * 0.18;
      this.alpha = 0;
      this.maxAlpha = 0.25 + Math.random() * 0.35;
      this.flicker = 0;
      this.flickerSpeed = 0.04 + Math.random() * 0.08;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.flicker += this.flickerSpeed;
      const flickerVal = Math.sin(this.flicker) * 0.18;
      this.alpha = Math.min(this.maxAlpha, this.alpha + 0.008) + flickerVal;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
      grad.addColorStop(0, '#ffd87a');
      grad.addColorStop(0.4, 'rgba(224,104,32,0.7)');
      grad.addColorStop(1, 'rgba(200,60,10,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 38; i++) particles.push(new Diya());

  function frame() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }
  frame();
}

// ── Equalizer bars animation in tracklist ─────────────────
function animateBars() {
  document.querySelectorAll('.tl-bars').forEach(bars => {
    const bEls = bars.querySelectorAll('.tl-bar');
    bEls.forEach(b => {
      if (isPlaying) {
        const h = 4 + Math.random() * 10;
        b.style.height = h + 'px';
      } else {
        b.style.height = '4px';
      }
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
seekBar.addEventListener('touchstart', e => { e.preventDefault(); seekTo(e); }, { passive: false });

seekBar.addEventListener('keydown', e => {
  if (!player || !player.getDuration) return;
  const dur = player.getDuration() || 0;
  if (e.key === 'ArrowRight') player.seekTo(Math.min(dur, player.getCurrentTime() + 5), true);
  if (e.key === 'ArrowLeft')  player.seekTo(Math.max(0, player.getCurrentTime() - 5), true);
});

// Close tracklist when clicking outside
document.addEventListener('click', e => {
  if (tracklistOpen && !tracklistPanel.contains(e.target) && e.target !== listBtn) {
    toggleTracklist();
  }
});

// ── Init ──────────────────────────────────────────────────
buildTracklist();
initDiyas();
animateBars();

// Set initial track display before player loads
trackName.textContent   = TRACKS[0].title;
trackArtist.textContent = TRACKS[0].artist;
albumArt.src = `https://i.ytimg.com/vi/${TRACKS[0].id}/hqdefault.jpg`;
