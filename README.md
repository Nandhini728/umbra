# UMBRA

UMBRA is a browser-based light-and-shadow puzzle platformer built with HTML5 Canvas, CSS, and vanilla JavaScript. Move with WASD or the arrow keys; aim the lamp with the mouse. Light makes the player Solid, while shadow makes the player Phantom. Seven rooms introduce and combine hazards, pushable blocks, pressure plates, gates, and a moving lamp.

## Run locally

No install or build step is required. From this directory, start any static file server, for example:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Serving the files is required for JavaScript ES modules in browsers that restrict `file://` imports. The optional Space Grotesk font falls back to a system sans-serif when offline.

## GitHub Pages

Live site: <https://nandhini728.github.io/umbra/>.

GitHub Pages publishes the `main` branch from the repository root. The project is served as static files directly; no build action or dependencies are needed.
