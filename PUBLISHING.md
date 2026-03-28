# Chrome Web Store Publish Notes

This repo is prepared for a first Chrome Web Store submission, but the final upload must be done from your own Google developer account.

## What To Upload

Zip the extension with `manifest.json` at the archive root.

Prepared assets in this repo:

- [manifest.json](/S:/PROJECTS/doomscroll-watcher/manifest.json)
- [assets/icons/icon16.png](/S:/PROJECTS/doomscroll-watcher/assets/icons/icon16.png)
- [assets/icons/icon32.png](/S:/PROJECTS/doomscroll-watcher/assets/icons/icon32.png)
- [assets/icons/icon48.png](/S:/PROJECTS/doomscroll-watcher/assets/icons/icon48.png)
- [assets/icons/icon128.png](/S:/PROJECTS/doomscroll-watcher/assets/icons/icon128.png)

## Suggested Listing Copy

### Name

`Doomscroll Punisher`

### Summary / short description

`Blocks scrolling on Instagram, LinkedIn, and Facebook and interrupts doomscrolling with a timed warning modal.`

### Detailed description

`Doomscroll Punisher is a small browser extension that blocks scrolling on Instagram, LinkedIn, and Facebook. When you try to scroll, it interrupts the session with a full-screen timed modal, a source-linked citation, and an audio cue.`

`Everything is bundled locally inside the extension. There are no background requests, no accounts, no sync, and no data sent to any server.`

`Current behavior:`

- `Hard blocks scroll attempts on matched sites`
- `Shows a 60-second interruption modal`
- `Displays rotating citation data from a local bundled fact bank`
- `Uses only local media assets`

### Category

`Productivity`

## Suggested Privacy Answers

### Single purpose

`Block scrolling on a short list of social media sites and interrupt the user with a local warning modal.`

### Permissions justification

`The extension runs only on Instagram, LinkedIn, and Facebook because it must detect and block scrolling on those pages. It does not request host access beyond those sites and does not use background networking, storage sync, or remote code.`

### User data / privacy

Suggested answers if the behavior stays as-is:

- `Not sold to third parties`
- `Not used or transferred for purposes unrelated to the item's core functionality`
- `Not used or transferred to determine creditworthiness or for lending purposes`

The extension currently keeps all logic and assets local. It does not intentionally collect, transmit, or store personal user data outside the page session.

## Manual Review Risks

Before submitting, sanity-check these:

1. Some citation text references sexual violence, genocide, racism, and child-safety issues. That is not automatically disallowed, but it may trigger closer content review.
2. Your screenshots and store description should clearly describe the extension as a scroll blocker, not as an official tool for Instagram, Facebook, LinkedIn, Meta, Microsoft, or Chrome.

## Store Submission Flow

1. Create/sign in to your Chrome Web Store developer account.
2. Open the Developer Dashboard.
3. Click `Add new item`.
4. Upload the zip file.
5. Fill out `Store listing`, `Privacy practices`, and any pricing/distribution settings.
6. Submit for review.
