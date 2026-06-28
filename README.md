# 🌟 sDECK — Streamer Companion Control Panel & Overlays

sDeck is a unified, web-based companion control panel and alert system for OBS Studio, Spotify, Twitch, and Streamlabs. Designed to run locally on your system, it acts as a customizable DIY Stream Deck that you can access from your PC, tablet, or smartphone, while providing pixel-art overlays for your stream.

---

## 🚀 Quick Start

Setting up sDeck is fully automated and designed to work out of the box on Windows, macOS, and Linux.

### Prerequisites
* **Node.js** (LTS version recommended). [Download Node.js](https://nodejs.org/).

### Running the App
1. **Windows**: Double-click `INICIAR.bat`.
2. **macOS / Linux**: Open your terminal, navigate to the folder, and run:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

*The launcher will automatically verify Node.js, create your configuration files, install dependencies, open the dashboard in your default browser at `http://localhost:3000`, and start the companion server.*

---

## ⚙️ Configuration & Environment

The project is structured to keep your personal configurations and tokens secure.

### Local Configs (Automatically generated)
* `.env` — Contains your local port configuration and social media handles for overlays. Created from `.env.example`.
* `config/settings.json` — Stores dashboard settings (OBS port, Spotify client details, Twitch channel details, Streamlabs sockets). Created from `config/settings.json.example`.
* `config/profiles.json` — Stores your button layouts and page grids. Created from `config/profiles.json.example`.
* `config/state.json` — Holds live stats (latest follower, latest sub, live status).

> [!IMPORTANT]
> All local configuration files (`.env`, `config/*.json`) contain private info/credentials and are ignored by git to protect your stream. When copying or moving this project to another computer, simply run the launcher again to generate a new set of clean templates.

### Customizing Overlays via `.env`
Open the `.env` file in a text editor to customize the social media handles displayed on your stream overlays:
```env
PORT=3000
TWITCH_USERNAME=your_twitch_channel
TWITTER_HANDLE=@your_twitter
INSTAGRAM_HANDLE=@your_instagram
TIKTOK_HANDLE=@your_tiktok
YOUTUBE_HANDLE=@your_youtube
```

---

## 🔗 Component Integration Guides

### 1. OBS Studio connection (WebSockets)
1. In OBS Studio, go to **Tools** -> **WebSocket Server Settings**.
2. Enable WebSocket server (default port is `4455`).
3. Set an **Server Password** (strongly recommended).
4. In the sDeck Dashboard, navigate to **Settings** -> **OBS Connection** and enter your Port and Password to connect.

### 2. Spotify Control Integration
To enable Spotify play/pause/skip and overlay track display, you must register a developer application:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create app**:
   * App name: `sDeck Control`
   * Redirect URI: `http://localhost:3000/callback` (or your custom domain/port followed by `/callback`)
3. Save the app and copy your **Client ID** and **Client Secret**.
4. In the sDeck Dashboard under Spotify Settings, paste these credentials and click **Connect**.
5. Approve the app permissions in the popup browser window.

### 3. Twitch Chat & IRC (Optional)
To send messages automatically to your Twitch chat via buttons on your Stream Deck:
1. Generate an OAuth chat token using the [Twitch Chat OAuth Password Generator](https://twitchapps.com/tmi/).
2. Paste the username and the token (starting with `oauth:`) into sDeck settings.

### 4. Streamlabs Alerts (Optional)
To receive alerts for follower, donation, or sub events:
1. Go to [Streamlabs API Settings](https://streamlabs.com/dashboard#/settings/api-settings).
2. Select **API Tokens** and copy your **Socket API Token** (starts with `eyJ...`).
3. Paste the token into sDeck settings.

---

## 🎨 Stream Overlays

Overlays can be added as **Browser Sources** in OBS Studio:
* **Top Bar Info Overlay**: `http://localhost:3000/overlays/Top Bar.dc.html` (Width: `1920`, Height: `80`)
* **Social Handles Ticker**: `http://localhost:3000/overlays/Social Bar.dc.html` (Width: `1920`, Height: `66`)
* **Spotify "Now Playing" Disc**: `http://localhost:3000/overlays/Now Playing - Disc.dc.html` (Width: `350`, Height: `100`)
* **Spotify "Now Playing" Bars**: `http://localhost:3000/overlays/Now Playing - Bars.dc.html` (Width: `380`, Height: `120`)

---

## 🛠️ Troubleshooting

### ❌ Spotify `redirect_uri_mismatch` Error
* **Cause**: The Redirect URI registered in the Spotify Developer Dashboard does not match the one sDeck is using.
* **Fix**: Ensure your Spotify App Redirect URI is set exactly to `http://localhost:3000/callback` (or `http://127.0.0.1:3000/callback` if using the loopback IP). Check the dashboard settings page to verify the exact URL to register.

### ❌ Port is Already in Use (`EADDRINUSE`)
* **Cause**: Another application is using port `3000`.
* **Fix**: Open `.env` and change the `PORT` variable to another number (e.g., `PORT=4000`). Remember to update your Spotify app's redirect URI in the developer dashboard to `http://localhost:4000/callback` if you change the port.

### ❌ OBS Fails to Connect
* **Cause**: OBS WebSockets is disabled, or using the wrong port/password, or OBS is not running.
* **Fix**: Double-check WebSocket Server Settings under Tools in OBS. Ensure "Enable WebSocket Server" is checked, the port matches, and the password entered is correct.
