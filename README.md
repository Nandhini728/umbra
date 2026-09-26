# UMBRA

UMBRA is a browser-based light-and-shadow puzzle platformer built with HTML5 Canvas, CSS, and vanilla JavaScript. Move with WASD or the arrow keys; aim the lamp with the mouse. Light makes the player Solid, while shadow makes the player Phantom. Seven rooms introduce and combine hazards, pushable blocks, pressure plates, gates, and a moving lamp.

## Run locally

No install or build step is required. From this directory, start any static file server, for example:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Serving the files is required for JavaScript ES modules in browsers that restrict `file://` imports. The optional Space Grotesk font falls back to a system sans-serif when offline.

## GitHub Pages

This project has not been deployed from this workspace. To publish it as its own GitHub Pages site, commit these files at the root of a GitHub repository, push the desired branch, then select **Settings → Pages → Deploy from a branch**, choose that branch and its `/ (root)` folder, and save. GitHub Pages serves the static files directly; no build action or dependencies are needed.
