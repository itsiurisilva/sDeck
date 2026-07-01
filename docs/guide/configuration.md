---
title: Configuration
description: Reference for sDeck's local config files — .env, config/settings.json, and config/profiles.json.
---

# Configuration

On first launch, sDeck generates three local config files:

| File | Purpose |
|:-----|:--------|
| `.env` | Server port + overlay social handles |
| `config/settings.json` | OBS, Twitch & Spotify credentials |
| `config/profiles.json` | Button layouts, labels, actions & grid sizes |

All three are gitignored and specific to your machine — safe to edit freely, and never committed if you fork the repo.

## `.env`

Set your server port and social handles (used by the [stream overlays](/guide/overlays)):

```sh
PORT=3000
TWITCH_USERNAME=your_twitch_channel
TWITTER_HANDLE=@your_twitter
INSTAGRAM_HANDLE=@your_instagram
TIKTOK_HANDLE=@your_tiktok
YOUTUBE_HANDLE=@your_youtube
```

If a handle is left empty, overlays fall back to a default placeholder.

## `config/settings.json`

Holds your OBS WebSocket, Spotify, Twitch, and Streamlabs credentials. You normally don't need to hand-edit this file — the **Config** panel in the dashboard walks you through each integration. See [Integrations](/guide/integrations) for the setup steps for each service.

## `config/profiles.json`

Stores every profile: grid size (up to 10×8), button labels, icons/colors, and each button's action. Profiles can be exported/imported as JSON from the dashboard, which makes it easy to back up a layout or share it with someone else running sDeck.
