---
title: Integrations
description: How to connect sDeck to OBS Studio, Spotify, Twitch IRC, and Streamlabs.
---

# Integrations

## OBS Studio (WebSocket v5.x)

1. In OBS, go to **Tools → WebSocket Server Settings**.
2. Enable the server (default port: `4455`).
3. Set a server password.
4. Enter the port + password in sDeck's **Config** panel.

## Spotify API (optional)

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app**.
2. Set the Redirect URI to `http://127.0.0.1:3000/callback`.
3. Copy your **Client ID** and **Client Secret** into sDeck's Spotify settings wizard.

::: warning
Spotify bans `localhost` redirect URLs. You **must** use `http://127.0.0.1` — and the port must match `PORT` in your `.env`.
:::

## Twitch IRC (optional)

1. Generate a token at the [Twitchapps TMI Generator](https://twitchapps.com/tmi/).
2. Paste the token (starting with `oauth:`) and your Twitch username into sDeck's Twitch settings.

## Streamlabs Alerts (optional)

1. Go to [Streamlabs API Settings → API Tokens](https://streamlabs.com/dashboard#/settings/api-settings).
2. Copy the **Socket API Token** (starts with `eyJ...`).
3. Paste it into sDeck's Streamlabs settings.

Once connected, Streamlabs events can trigger the [alert overlays](/guide/overlays) in OBS.
