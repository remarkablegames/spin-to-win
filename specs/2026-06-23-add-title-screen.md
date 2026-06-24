# Add Title Screen

Add a title scene that gives the game a main-menu entry point before starting a new run.

## Flow

- Startup routes `start -> preload -> title -> game`.
- `preload` still owns loading the font, sprites, and sounds.
- The title scene appears only after assets are loaded so it can use the existing wheel, pointer sprite, button, font, and sounds.
- The Play button starts a fresh game with `go(SCENE.GAME)`.

## Title Scene

Create `src/scenes/title.ts` and register it from `src/scenes/start.ts`.

The scene should include:

- Grid background via `addGrid()`.
- Title text: `Spin to Win`.
- Tagline text: `Spin. Score. Repeat.`
- A subtle dark shadow behind the tagline.
- A wheel preview using `addWheel()`.
- A fixed pointer sprite above the wheel.
- A Play button using `addButton()`.

The wheel preview should rotate slowly while the title scene is active. The Play button should not idle-pulse; it should keep the standard button hover behavior.

## Scene Constants

Add a new scene constant:

- `TITLE = 'title'`

No save data, route parameters, localStorage behavior, or gameplay state shape changes are required.

## End Scene Routing

Update the end scene routing:

- If the player wins and another level exists, keep `Next Level -> SCENE.GAME`.
- If the player fails or has completed the final level, show `Main Menu` and route to `SCENE.TITLE`.

## Wheel Preview Sizing

`addWheel()` should support an optional `radius` parameter so the title screen can size the preview without changing the default gameplay wheel size.

Default behavior remains unchanged:

- Game and shop wheels use the existing default radius.
- Title screen passes its own preview radius.

## Test Plan

- Run `npm run lint:tsc`.
- Run `npm run lint`.
- Run `npm run build`.
- Manual playtest:
  - App starts at the title screen after preload.
  - Title, tagline, shadow, wheel preview, pointer, and Play button render without awkward spacing or overlap.
  - Wheel preview rotates slowly.
  - Play starts level 1, round 1.
  - Winning a non-final level advances directly to the next level.
  - Failing a level returns to the title screen.
  - Winning the final level returns to the title screen.
  - Spacebar spin behavior affects only the game scene.
