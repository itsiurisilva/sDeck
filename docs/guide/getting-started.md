---
title: Getting Started
description: Install sDeck, launch the local server, and pair your phone or tablet over Wi-Fi to start controlling OBS, Spotify, and Twitch from any device.
---

# Getting Started

sDeck is a free, self-hosted Stream Deck alternative — you run it on your streaming PC, then control it from any phone, tablet, or laptop on the same Wi-Fi network.

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- Windows, macOS, or Linux
- A device on the same Wi-Fi network as your host PC (for controlling sDeck remotely)

## 1 — Clone the repository

```bash
git clone https://github.com/itsiurisilva/sDeck.git
cd sDeck
```

## 2 — Launch

| OS | How |
|:---|:----|
| **Windows** | Double-click `INICIAR.bat` |
| **macOS / Linux** | `chmod +x start.sh && ./start.sh` |

The launcher automatically installs dependencies, generates config templates, and opens your dashboard on first run.

## 3 — Open the dashboard

```
http://localhost:3000
```

## 4 — Pair your phone or another device

The host PC never needs a PIN, but any other device joining over Wi-Fi does:

1. On the host, open **Config → Device Pairing** to see the PIN.
2. On the other device, browse to `http://<your-pc-ip>:3000` (this address is also printed in the terminal on launch).
3. Enter the PIN when prompted.

You can regenerate the PIN at any time from the same panel.

## Next steps

- [Configuration](/guide/configuration) — set up `.env`, credentials, and button profiles.
- [Integrations](/guide/integrations) — connect OBS, Spotify, Twitch, and Streamlabs.
- [Actions & Widgets](/guide/actions-widgets) — see everything a button can do.
