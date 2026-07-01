---
title: Stream Overlays
description: Browser source URLs and sizes for every sDeck OBS overlay — top bar, socials ticker, now playing, alerts, and more.
---

# Stream Overlays

Add these as **Browser Sources** in OBS Studio while sDeck is running:

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

::: tip
Alert/badge overlays are full-canvas — their graphics are positioned within the 1920×1080 frame, so add the Browser Source at that size with a transparent background rather than cropping it.
:::

Social handles shown on the Top Info Bar and Socials Ticker come from your [`.env` file](/guide/configuration#env).
