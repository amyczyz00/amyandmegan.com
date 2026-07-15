# Amy & Megan — wedding website

A static site, ready to push straight to GitHub Pages.

## What's inside
- `index.html` — the main scrolling page (story, weekend, travel, stay, things to do, packing, FAQ, registry)
- `rsvp.html` — a standalone RSVP page, linked from the top nav on every page
- `css/style.css` — all styling
- `js/main.js` — nav, FAQ + schedule accordions, dual audio players, scroll effects
- `assets/images/` — your real photos, already sized for web
- `assets/video/` — drop a `hero-loop.mp4` here to power a video hero background (see below)
- `assets/audio/` — put `amy-version.mp3` and `megan-version.mp3` here to power the two "Our story" players

## The hero video
The hero currently shows your aerial boat photo with a slow zoom, plus a small animated boat gliding across the water — a lightweight stand-in for real footage, inspired by how Villa Porta's own site uses a looping background video.

To upgrade to a real video (recommended for the most "upscale" feel):
1. Get a short clip — a drone shot of the villa, or footage from a boat approaching/leaving the dock, 10–20 seconds, looped seamlessly if possible.
2. Export it as `hero-loop.mp4`, ideally under ~8MB (compress with Handbrake or similar — 1920x1080, no audio track needed since it plays muted).
3. Drop it into `assets/video/hero-loop.mp4`.
4. That's it — the site automatically detects the video and switches from the photo animation to the real video the moment it's present. No code changes needed.

## To deploy on GitHub Pages
1. Create a new repository (e.g. `amy-and-megan-wedding`).
2. Upload everything in this folder to the repo, keeping the same structure.
3. In the repo, go to **Settings → Pages**, set the source branch to `main` (or `master`) and folder to `/root`.
4. GitHub will give you a URL like `https://yourusername.github.io/amy-and-megan-wedding/`.
5. To use your own domain: in **Settings → Pages → Custom domain**, enter your domain, then add the DNS records your registrar tells you (usually a CNAME record pointing at `yourusername.github.io`).

## Things to swap in before launch
- **RSVP page** (`rsvp.html`) — replace the placeholder button with your RSVP platform's URL or embed code once you've chosen one.
- **Registry button** (`#registry` section in `index.html`) — same, once you've picked a registry.
- **Audio** — drop `amy-version.mp3` and `megan-version.mp3` into `assets/audio/`.
- **Contact email** — currently `hello@amyandmegan.com` in the footer, update to your real address.
- **Concierge email** — currently `eventsconcierge@villaporta.style` in the Travel and Stay sections.
- **Accommodation details** in the Stay section, once room blocks are confirmed.
- Search the files for the word "editable" and "placeholder" — those mark spots written as examples for you to personalize.

## Editing copy
Everything is plain text inside `index.html` and `rsvp.html` — no build step, no dependencies. Open either file in any text editor, find the section you want (they're commented, e.g. `<!-- ============ STORY ============ -->`), and change the words directly.
