# Doomscroll Punisher

Small desktop Chromium extension that blocks scrolling on a short list of high-risk routes and interrupts the attempt with a full-screen warning.

## What it targets

- `instagram.com`: all routes
- `facebook.com`: all routes
- `linkedin.com`: all routes
- `youtube.com/shorts/*`: only Shorts, not the rest of YouTube

## How it behaves

- Scrolling is hard-blocked on active targets.
- A `60s` modal appears on the first blocked attempt.
- The modal shows a rotating fact from a local fact bank in [shame-data.js](/S:/PROJECTS/doomscroll-watcher/shame-data.js).
- The source line is clickable.
- Audio is bundled locally and starts from `0:43` in [Underground Resistance - Electronic Warfare ( Vocal ).mp3](/S:/PROJECTS/doomscroll-watcher/assets/Underground%20Resistance%20-%20Electronic%20Warfare%20(%20Vocal%20).mp3).
- Route-aware sites keep working as SPAs. For example, YouTube is only blocked on `/shorts`, and normal YouTube should unlock again when you leave Shorts.

Everything is local to the extension. There is no backend, no account, and no remote fetch for facts or media.

## Repo layout

- [manifest.json](/S:/PROJECTS/doomscroll-watcher/manifest.json): extension entrypoint and site matching
- [content.js](/S:/PROJECTS/doomscroll-watcher/content.js): blocker, modal, audio, route handling
- [shame-data.js](/S:/PROJECTS/doomscroll-watcher/shame-data.js): fact bank
- [assets](/S:/PROJECTS/doomscroll-watcher/assets): image, audio, icons, fallbacks

## Install

1. Open `brave://extensions` or `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this folder: `doomscroll-watcher`.

## Update on another machine

```powershell
git clone <your-repo-url>
```

After later changes:

```powershell
git pull
```

Then refresh the extension card in the browser extensions page.

## Customize

- Edit [shame-data.js](/S:/PROJECTS/doomscroll-watcher/shame-data.js) to change or expand the fact bank.
- Replace [UR.jpeg](/S:/PROJECTS/doomscroll-watcher/assets/UR.jpeg) if you want different modal art.
- Replace [Underground Resistance - Electronic Warfare ( Vocal ).mp3](/S:/PROJECTS/doomscroll-watcher/assets/Underground%20Resistance%20-%20Electronic%20Warfare%20(%20Vocal%20).mp3) if you want different audio.
- If the audio start point changes, update `AUDIO_START_SECONDS` in [content.js](/S:/PROJECTS/doomscroll-watcher/content.js).
- If you want to change timing, edit the constants near the top of [content.js](/S:/PROJECTS/doomscroll-watcher/content.js).

## Notes

- This is built for desktop Chromium browsers such as Brave, Chrome, Edge, Opera, and Vivaldi.
- Mobile support is not the target.
- On some signed-out or login pages, browsers can still restrict autoplay until the page has seen a real click, tap, or key press. The extension already tries to unlock audio on those interactions.
