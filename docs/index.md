---
layout: home

title: sDeck
titleTemplate: Free, Self-Hosted Stream Deck Alternative

hero:
  name: sDeck
  text: A free, self-hosted Stream Deck
  tagline: Control OBS, Spotify, Twitch, and your PC from any phone, tablet, or laptop on your Wi-Fi network — no specialized hardware, no cloud, no subscription.
  image:
    src: /sdeck-icon-128.png
    alt: sDeck logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/itsiurisilva/sDeck

features:
  - icon: 🖥️
    title: Fully Self-Hosted
    details: Runs entirely on your local machine — no cloud, no subscription, no external server.
  - icon: 📱
    title: Any Device, Instant Access
    details: A fully touch-optimized UI — open the deck on any phone, tablet, or secondary screen on your Wi-Fi and it's just as usable as on the host PC.
  - icon: 🔒
    title: Secure Pairing
    details: The host PC never needs a password; every other device must enter a PIN once before it can control your deck.
  - icon: 🎮
    title: OBS Studio Control
    details: Switch scenes, toggle sources, control streams & recording via OBS WebSocket v5.
  - icon: 🎵
    title: Spotify Integration
    details: Real-time now playing, play/pause, skip tracks, and volume control — including a drag-to-adjust knob.
  - icon: 💬
    title: Twitch Chat & Moderation
    details: Chat macros plus a full moderation panel — clear chat, sub-only/emote-only, slow mode, followers-only, timeouts, bans, and raids.
  - icon: 🔔
    title: Streamlabs Alerts
    details: Trigger alert screens and sounds from live events in real time.
  - icon: 🎛️
    title: 10 Action Types
    details: OBS commands, system/PowerShell, profile switching, soundboard, multi-step macros, clipboard, Twitch chat, Spotify volume, open URL, and webhooks.
  - icon: 📐
    title: Multiple Profiles & Favorites
    details: Unlimited profiles with independently configurable grid size (up to 10×8), a pinned Favorites bar, and JSON import/export.
---

<div style="max-width: 960px; margin: 48px auto 0; padding: 0 24px;">

## What is sDeck?

sDeck is a free and open-source alternative to a hardware Stream Deck. Instead of buying dedicated buttons, you host sDeck on your streaming PC and control it from any device already on your Wi-Fi network — a phone propped up next to your keyboard, an old tablet, or a second monitor. It talks directly to OBS Studio, Spotify, Twitch, and Streamlabs, and can also run shell commands, PowerShell scripts, and webhooks on the host machine.

<img src="/stream_deck.png" alt="sDeck stream deck grid interface showing OBS scene buttons, soundboard, and profile switching" style="width:100%; border-radius: 12px; margin-top: 16px;" />

## Quick start

```bash
git clone https://github.com/itsiurisilva/sDeck.git
cd sDeck
```

Then launch it — double-click `INICIAR.bat` on Windows, or run `chmod +x start.sh && ./start.sh` on macOS/Linux — and open `http://localhost:3000`. The launcher installs dependencies and generates config templates on first run.

See the [Getting Started guide](/guide/getting-started) for pairing devices, and [Integrations](/guide/integrations) for connecting OBS, Spotify, Twitch, and Streamlabs.

</div>
