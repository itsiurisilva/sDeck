<div align="center">

<img src="Gallery/Icon/sdeck-wordmark.png" alt="sDeck" width="380"/>

<br/><br/>

[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D%2018.0.0-22c55e?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![OBS WebSocket](https://img.shields.io/badge/OBS%20WebSocket-v5.x-ef4444?style=flat-square&logo=obs-studio&logoColor=white)](https://obsproject.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-8b5cf6?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-f97316?style=flat-square)](https://makeapullrequest.com)
[![Self Hosted](https://img.shields.io/badge/Self--Hosted-No%20Cloud%20Required-3b82f6?style=flat-square)](https://github.com/itsiurisilva/sDeck)

**Host sDeck on your main computer and control OBS, Spotify, Twitch, and your PC from any device on your Wi-Fi network — no specialized hardware required.**

[**Quick Start**](#-quick-start) · [**Features**](#-features) · [**Actions & Widgets**](#-button-actions--widgets) · [**Screenshots**](#-screenshots) · [**Configuration**](#️-configuration) · [**Integrations**](#-integrations) · [**Overlays**](#-stream-overlays)

<br/>

<img src="Gallery/stream_deck.png" alt="sDeck Stream Deck Interface" width="92%"/>

</div>

<br/>

---

## ✨ Features

| | |
|---|---|
| 🖥️ **Fully Self-Hosted** | Runs entirely on your local machine — no cloud, no subscription, no external server. |
| 📱 **Any Device, Instant Access** | Fully touch-optimized UI — open the deck on any phone, tablet, or secondary screen on your Wi-Fi and it's just as usable as on the host PC. |
| 🔒 **Secure Pairing** | The host PC never needs a password; every other device must enter a PIN once before it can control your deck. |
| 🎮 **OBS Studio Control** | Switch scenes, toggle sources, control streams & recording via WebSocket v5. |
| 🎵 **Spotify Integration** | Real-time now playing, play/pause, skip tracks, and volume control (including a drag-to-adjust knob). |
| 💬 **Twitch Chat & Moderation** | Chat macros plus a full moderation panel — clear chat, sub-only/emote-only, slow mode, followers-only, timeouts, bans, and raids. |
| 🔔 **Streamlabs Alerts** | Trigger alert screens and sounds from live events in real time. |
| 🎛️ **10 Action Types** | OBS commands, system/PowerShell, profile switching, soundboard, multi-step macros, clipboard, Twitch chat, Spotify volume, open URL, and webhooks — see [Button Actions & Widgets](#-button-actions--widgets). |
| 🖼️ **Custom Icons or Images** | Pick from a searchable icon library or upload your own image per button, with independent background/icon/text/glow colors. |
| 📐 **Multiple Profiles & Favorites** | Unlimited profiles with independently configurable grid size (up to 10×8), a pinned Favorites bar, and JSON import/export. |
| 🎙️ **Soundboard** | Upload your own clips or use built-in synth effects, with per-sound volume. |
| **Reason** | This deck was initially developed for https://www.twitch.tv/samuca2835 my favorite Streamer/Friend ❤️ |

---

## 🎛️ Button Actions & Widgets

Every pad can be one of three **widget types**:

| Widget | Behavior |
|:-------|:---------|
| **Button** | Standard press-to-trigger pad. |
| **Switch** | ON/OFF toggle — fires one action when turned on, a different one when turned off. |
| **Knob** | Drag up/down to set a live value (volume-type actions only). |

...and its **action** can be any of:

| Action | What it does |
|:-------|:-------------|
| **OBS Command** | Switch scenes, toggle mute, toggle stream/recording, toggle source visibility, set input volume, or send a custom OBS WebSocket request. |
| **System** | Run a shell command, PowerShell script, or launch an app on the host PC. |
| **Switch Profile** | Jump to a different deck layout. |
| **Play Sound** | Trigger a soundboard clip. |
| **Macro** | Chain multiple actions together, each with its own delay. |
| **Copy to Clipboard** | Copies text to the host PC's clipboard. |
| **Send to Twitch Chat** | Posts a message to chat, optionally on a repeating timer. |
| **Spotify Volume** | Set — or, on a Knob, drag — Spotify's playback volume. |
| **Open URL** | Opens a link in the host's default browser. |
| **Webhook** | Fires a GET/POST HTTP request (e.g. a Discord webhook) with an optional JSON body. |

---

## 🚀 Quick Start

> **Requires** [Node.js](https://nodejs.org/) v18 or higher.

**1 — Clone the repository**
```bash
git clone https://github.com/itsiurisilva/sDeck.git
cd sDeck
```

**2 — Launch**

| OS | How |
|:---|:----|
| **Windows** | Double-click `INICIAR.bat` |
| **macOS / Linux** | `chmod +x start.sh && ./start.sh` |

**3 — Open the dashboard**
```
http://localhost:3000
```

> The launcher automatically installs dependencies, generates config templates, and opens your dashboard on first run.

**4 — Pair your phone or another device**

The host PC never needs a PIN, but any other device joining over Wi-Fi does. On the host, open **Config → Device Pairing** to see the PIN, then enter `http://<your-pc-ip>:3000` (also printed in the terminal on launch) on the other device and type it in when prompted. You can regenerate the PIN at any time from the same panel.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><b>Stream Deck</b></td>
    <td align="center"><b>Chat & Moderation</b></td>
  </tr>
  <tr>
    <td><img src="Gallery/stream_deck.png" alt="Stream Deck" width="100%"/></td>
    <td><img src="Gallery/chat_moderation.png" alt="Chat & Moderation" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Soundboard</b></td>
    <td align="center"><b>Credentials & Config</b></td>
  </tr>
  <tr>
    <td><img src="Gallery/soundboard.png" alt="Soundboard" width="100%"/></td>
    <td><img src="Gallery/configuration.png" alt="Configuration" width="100%"/></td>
  </tr>
</table>

---

## ⚙️ Configuration

On first launch, sDeck generates three local config files:

| File | Purpose |
|:-----|:--------|
| `.env` | Server port + overlay social handles |
| `config/settings.json` | OBS, Twitch & Spotify credentials |
| `config/profiles.json` | Button layouts, labels, actions & grid sizes |

**Set your social handles in `.env`:**
```env
PORT=3000
TWITCH_USERNAME=your_twitch_channel
TWITTER_HANDLE=@your_twitter
INSTAGRAM_HANDLE=@your_instagram
TIKTOK_HANDLE=@your_tiktok
YOUTUBE_HANDLE=@your_youtube
```

---

## 🔌 Integrations

<details>
<summary><b>🎬 OBS Studio (WebSocket v5.x)</b></summary>
<br/>

1. In OBS, go to **Tools → WebSocket Server Settings**
2. Enable the server (default port: `4455`)
3. Set a server password
4. Enter the port + password in sDeck's **Config** panel

</details>

<details>
<summary><b>🎵 Spotify API (Optional)</b></summary>
<br/>

1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app**
2. Set the Redirect URI to `http://127.0.0.1:3000/callback`
3. Copy your **Client ID** and **Client Secret** into sDeck's Spotify settings wizard

> [!WARNING]
> Spotify bans `localhost` redirect URLs. You **must** use `http://127.0.0.1` — and the port must match `PORT` in your `.env`.

</details>

<details>
<summary><b>💬 Twitch IRC (Optional)</b></summary>
<br/>

1. Generate a token at [Twitchapps TMI Generator](https://twitchapps.com/tmi/)
2. Paste the token (starting with `oauth:`) and your Twitch username into sDeck's Twitch settings

</details>

<details>
<summary><b>🔔 Streamlabs Alerts (Optional)</b></summary>
<br/>

1. Go to [Streamlabs API Settings → API Tokens](https://streamlabs.com/dashboard#/settings/api-settings)
2. Copy the **Socket API Token** (starts with `eyJ...`)
3. Paste it into sDeck's Streamlabs settings

</details>

---

## 📡 Stream Overlays

Add these as **Browser Sources** in OBS Studio:

| Overlay | URL | Size |
|:--------|:----|:-----|
| **Top Info Bar** | `http://localhost:3000/overlays/Top Bar.dc.html` | 1920 × 80 |
| **Socials Ticker** | `http://localhost:3000/overlays/Social Bar.dc.html` | 1920 × 66 |
| **Spotify Music Disc** | `http://localhost:3000/overlays/Now Playing - Disc.dc.html` | 350 × 100 |
| **Spotify Music Bars** | `http://localhost:3000/overlays/Now Playing - Bars.dc.html` | 380 × 120 |
| **Follower Alert** | `http://localhost:3000/overlays/Follower Alert.dc.html` | 1920 × 1080 |
| **Sub Alert** | `http://localhost:3000/overlays/Sub Alert.dc.html` | 1920 × 1080 |
| **Donation Alert** | `http://localhost:3000/overlays/Donation Alert.dc.html` | 1920 × 1080 |
| **Camera Frame** | `http://localhost:3000/overlays/Camera Frame.dc.html` | 1920 × 1080 |
| **Live Badge** | `http://localhost:3000/overlays/Live Badge.dc.html` | 1920 × 1080 |
| **Viewer Count** | `http://localhost:3000/overlays/Viewer Count.dc.html` | 1920 × 1080 |

> Alert/badge overlays are full-canvas — their graphics are positioned within the 1920×1080 frame, so add the Browser Source at that size with a transparent background rather than cropping it.

---

## 🔧 Troubleshooting

<details>
<summary><b>Spotify: <code>INVALID_CLIENT</code> or <code>redirect_uri_mismatch</code></b></summary>
<br/>

Verify the Redirect URI in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) is **exactly** `http://127.0.0.1:3000/callback`. Do not use `localhost`. The port must match the value of `PORT` in your `.env`.

</details>

<details>
<summary><b>Port already in use (<code>EADDRINUSE</code>)</b></summary>
<br/>

Change `PORT=3000` to a free port in `.env` (e.g. `PORT=4000`). If using Spotify, update its Developer Dashboard Redirect URI to match the new port.

</details>

<details>
<summary><b>OBS shows as disconnected</b></summary>
<br/>

Confirm OBS Studio is open, WebSocket Server is enabled under **Tools → WebSocket Server Settings**, and the port + password match exactly what you entered in sDeck's Config panel.

</details>

---

<div align="center">
<sub>Made with ❤️ &nbsp;·&nbsp; MIT License &nbsp;·&nbsp; <a href="https://github.com/itsiurisilva/sDeck">github.com/itsiurisilva/sDeck</a></sub>
</div>
