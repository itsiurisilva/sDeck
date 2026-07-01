---
title: Actions & Widgets
description: Every widget type and action type available on an sDeck button — OBS commands, macros, soundboard, webhooks, and more.
---

# Button Actions & Widgets

Every pad on an sDeck profile can be one of three **widget types**:

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

## Profiles & Favorites

sDeck supports unlimited profiles, each with its own independently configurable grid size (up to 10×8). A pinned **Favorites** bar stays visible across profile switches for your most-used buttons, and full profiles can be exported/imported as JSON — see [Configuration](/guide/configuration).

## Icons

Each button can use a custom uploaded image or an icon picked from a searchable built-in icon library, with independently configurable background, icon, text, and glow colors.
