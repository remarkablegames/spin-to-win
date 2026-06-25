# Cover Scene Plan

Create a hidden `cover` scene that renders only the wheel on a 1024×1024 transparent canvas, reachable via `?scene=cover` so it can be right-clicked and saved as a PNG.

## Changes

1. **Add `SCENE.COVER`** to `src/constants/scene.ts`.
2. **Create `src/scenes/cover.ts`**:
   - Register `scene(SCENE.COVER, () => { ... })`.
   - Add a static wheel at the center, scaled so it fills the canvas (e.g., scale ~2× or radius ~500).
   - Add the pointer at the top, matching the title scene layout but scaled.
   - Do not add grid, title text, tagline, buttons, or mute button.
3. **Register the scene** in `src/scenes/start.ts` by importing `./cover`.
4. **Route to it from querystring** in `src/scenes/preload.ts`:
   - Add a `case SCENE.COVER:` that calls `go(SCENE.COVER)`.
5. **Configure canvas for cover mode** in `src/main.ts`:
   - Read `location.search` before initializing KAPLAY.
   - If `scene === 'cover'`, set `width: 1024`, `height: 1024`, and a transparent background.
   - Otherwise keep the existing default behavior (`background: [176, 146, 126]`).
6. **Verify transparency export**:
   - Confirm KAPLAY's `background` option supports transparent clearing (e.g., `null` or `[0,0,0,0]`).
   - Ensure the page body/canvas has no opaque CSS background that would show through the saved image.
