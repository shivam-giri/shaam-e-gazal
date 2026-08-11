# 🪔 शाम-ए-ग़ज़ल — Shaam-e-Gazal

> *ग़ज़लें जो रात को महफ़िल बना दें*
> Ghazals that turn the night into a mehfil.

A single-page immersive ghazal music player — inspired by [saloon.wtf](https://saloon.wtf), [busdriver.wtf](https://busdriver.wtf), and [hornokplease.xyz](https://hornokplease.xyz). Built for the golden era of Urdu & Hindi ghazals.

---

## ✨ Features

- 🎵 **30 ghazals** — streamed via YouTube IFrame API, no login required
- 💿 **Spinning vinyl** — rotates while playing, pauses when music pauses
- 📜 **Glassmorphic tracklist** — slides up with animated equalizer bars
- 🪔 **Diya particle system** — floating warm ember glows across the screen
- 🎞️ **Film grain overlay** — analog texture for that old-mehfil feel
- 🌅 **AI-generated mehfil background** — candlelit Mughal gathering at dusk
- 🎚️ **Seek bar** — click to seek, keyboard arrows skip ±5 seconds
- 📱 **Fully responsive** — works on mobile and desktop

---

## 🎤 Artists

| Artist | Known For |
|--------|-----------|
| **Jagjit Singh** | Hoshwalon Ko Khabar Kya, Woh Kagaz Ki Kashti |
| **Chitra Singh** | Tum Ko Dekha To Yeh Khayal Aaya |
| **Nusrat Fateh Ali Khan** | Afreen Afreen, Sanu Ek Pal Chain |
| **Ghulam Ali** | Yeh Dil Yeh Pagal Dil, Hungama Hai Kyon Barpa |
| **Pankaj Udhas** | Na Kajre Ki Dhar, Chandi Jaisa Rang |
| **Begum Akhtar** | Ae Mohabbat Tere Anjam Pe |
| **Talat Aziz** | Zindagi Jab Bhi Teri Bazm Mein |
| **Hariharan** | Har Taraf Aaj |
| **Mehdi Hassan** | Ranjish Hi Sahi, Patta Patta Boota Boota |
| **Farida Khanum** | Aaj Jaane Ki Zid Na Karo |
| **Lata Mangeshkar** | Phir Chhidi Raat, Dil Dhundta Hai |

---

## 🗂️ Project Structure

```
shaam-e-gazal/
├── index.html      # Main page — semantic HTML, SEO meta tags
├── style.css       # Full design system — dark theme, animations, glassmorphism
├── app.js          # YouTube IFrame player, tracklist, diya particle system
├── bg.jpg          # AI-generated candlelit mehfil background
├── vercel.json     # Vercel static deployment config
└── README.md       # You are here
```

---

## 🚀 Deploy to Vercel

### Option A — CLI

```bash
# Install Vercel CLI (use cmd.exe on Windows)
npm install -g vercel

# Deploy from project folder
cd "C:\Shivam Files\shaam-e-gazal"
vercel
```

Follow the prompts — your site goes live at `https://shaam-e-gazal.vercel.app`.

### Option B — Drag & Drop (No CLI)

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Choose **"Upload"** and drag the entire `shaam-e-gazal/` folder
3. Click **Deploy** — done in ~30 seconds ✅

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--dusk` | `#100806` | Background base |
| `--amber` | `#c8922a` | Active track, highlights |
| `--ember` | `#e06820` | Glow effects, diya particles |
| `--gold` | `#f0c96a` | Seek bar fill |
| `--parchment` | `rgba(245,230,200,0.9)` | Primary text |

**Fonts:** [Noto Serif Devanagari](https://fonts.google.com/noto/specimen/Noto+Serif+Devanagari) · [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) · [Inter](https://fonts.google.com/specimen/Inter)

---

## 🛠️ Tech Stack

- **Pure HTML + CSS + Vanilla JS** — zero dependencies, zero frameworks
- **YouTube IFrame API** — audio playback (free, no API key needed)
- **Canvas API** — diya flame particle system
- **SVG filter** — film grain overlay
- **Google Fonts** — Devanagari + Latin typography
- **Vercel** — static hosting

---

## 🔧 Known Gotchas

> **YouTube IFrame API** requires the player `<div>` to **not** have `display:none`.  
> Use `opacity:0` + off-screen positioning instead, or the player won't mount and `playVideo` will throw.

> **`playerReady` flag** — always check this before calling `player.playVideo()` / `player.pauseVideo()`.  
> The `YT.Player` object exists before `onReady` fires, but API methods are not available yet.

---

## 👤 Creator

Made with 🪔 by **[Shivam Giri](https://github.com/shivam-giri)**

---

## 📄 License

MIT — free to use, remix, and share. A mehfil is for everyone. 🪔

