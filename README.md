# Doomscroll Punisher

Small Chromium/Brave extension that hard-locks scrolling on Instagram, LinkedIn, and Facebook and throws a loud visual/audio warning when you try anyway.

## Current rules

- Scroll is blocked immediately on every matched site.
- No grace period, no timing budget, no page exceptions.
- The extension keeps locking newly created feed/message containers as the page changes.
- A short visual/audio warning appears when you try to scroll.

The warning uses local bundled assets only, so it works offline and stays identical across Windows and Linux.

## Install in Brave or Chromium

1. Open `brave://extensions` or `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `doomscroll-watcher`.

## Keep it in git

If this folder is not already a repo:

```powershell
git init
git add .
git commit -m "Initial doomscroll punisher extension"
```

On another machine:

```powershell
git clone <your-repo-url>
```

After updates:

```powershell
git pull
```

Then refresh the extension card in `brave://extensions`.

## Share with friends

The simplest unpublished flow is:

- Put this repo on GitHub, GitLab, or a private git remote.
- Friends clone it or download the ZIP.
- They use **Load unpacked** in Brave/Chromium.

If you ever want one-click installs from the browser store, that becomes a separate packaging/publishing step.

## Customize the personality

- Replace [assets/warning.gif](/S:/PROJECTS/doomscroll-watcher/assets/warning.gif) with your own GIF.
- Replace [Underground Resistance - Electronic Warfare ( Vocal ).mp3](/S:/PROJECTS/doomscroll-watcher/assets/Underground%20Resistance%20-%20Electronic%20Warfare%20(%20Vocal%20).mp3) with your own sound.
- Edit [shame-data.js](/S:/PROJECTS/doomscroll-watcher/shame-data.js) to add, remove, or rewrite facts without touching the UI/blocker logic.
- Tweak the warning timings near the top of [content.js](/S:/PROJECTS/doomscroll-watcher/content.js).
