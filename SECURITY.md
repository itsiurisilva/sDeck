# Security Policy

## Supported Versions

sDeck is a small, actively developed self-hosted project. Only the latest code on the `main` branch (and the latest tagged [release](https://github.com/itsiurisilva/sDeck/releases)) is supported — please update before reporting an issue.

## Reporting a Vulnerability

If you find a security issue, **please don't open a public GitHub issue for it**. Instead, email **iurisilvaparticular@gmail.com** with:

- A description of the issue and its potential impact
- Steps to reproduce (or a proof of concept)
- The version/commit you tested against

You should get a response within a few days. Once a fix is available, a security advisory will be published and you'll be credited unless you'd rather stay anonymous.

## Scope & Design Notes

sDeck runs on a machine you control and is meant to be used on a **trusted local network** — it is not designed to be exposed to the public internet.

- **Pairing PIN**: the host machine itself is always trusted; any other device must present a PIN (`Config → Device Pairing`) before it can call the API or connect over WebSocket. Rotate the PIN from that same panel if you think it's been shared with someone it shouldn't have.
- **System / PowerShell actions**: buttons can execute arbitrary shell commands on the host. This is a deliberate feature (it's what makes custom macros possible), not a bug — but it means anyone who can control the deck can run code on your PC. Only pair devices and share profiles you trust.
- **Credentials**: OBS, Spotify, Twitch, and Streamlabs tokens live in `config/settings.json`, which is git-ignored by default and never sent to connected clients (only a redacted copy of settings is broadcast — see `clientSafeSettings()` in `server.js`).
- If you do put sDeck on a network you don't fully trust, put it behind your own reverse proxy/VPN — the built-in PIN is meant to stop casual/accidental access on a home Wi-Fi, not to withstand a determined attacker on a hostile network.

Reports about any of the above (PIN bypass, credential leakage, command injection beyond the intended System action, etc.) are welcome and taken seriously.
