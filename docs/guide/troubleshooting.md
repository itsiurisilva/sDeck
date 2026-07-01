---
title: Troubleshooting
description: Fixes for common sDeck issues — Spotify INVALID_CLIENT, port conflicts, OBS disconnected, pairing PIN problems, and soundboard upload errors.
---

# Troubleshooting

## Spotify: `INVALID_CLIENT` or `redirect_uri_mismatch`

Verify the Redirect URI in your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) is **exactly** `http://127.0.0.1:3000/callback`. Do not use `localhost`. The port must match the value of `PORT` in your `.env`.

## Port already in use (`EADDRINUSE`)

Change `PORT=3000` to a free port in `.env` (e.g. `PORT=4000`). If using Spotify, update its Developer Dashboard Redirect URI to match the new port.

## OBS shows as disconnected

Confirm OBS Studio is open, WebSocket Server is enabled under **Tools → WebSocket Server Settings**, and the port + password match exactly what you entered in sDeck's Config panel.

## A device on my Wi-Fi won't pair / says "Missing or invalid pairing PIN"

Any device other than the host PC itself must enter the current pairing PIN before it can load the dashboard or control sDeck. Find the PIN in the host's terminal output on launch, or in **Config → Device Pairing**. If it's been regenerated since the device last connected, re-enter the new one.

## Soundboard upload fails

Sound and button image uploads are capped at 10MB each. Compress or trim the file and try again.

## Still stuck?

Open an issue on [GitHub](https://github.com/itsiurisilva/sDeck/issues) with your OS, Node.js version, and the exact error message.
