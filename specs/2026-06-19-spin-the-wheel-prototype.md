# Spin-the-Wheel Prototype

Add a single-scene Kaplay prototype where the player clicks a "Spin" button to rotate a segmented wheel, and the winning segment's point value is added to a displayed score.

## Scope

- One scene: replace the current `game` scene's placeholder player/enemy demo with a wheel layout.
- No upgrades, no progression, no persistence for this prototype. Score resets when the scene starts.

## Wheel

- 6 segments with point values: `+10`, `+25`, `+50`, `+100`, `-25`, `+0`.
- Each segment gets a distinct color.
- Rendered at the center of the canvas using a custom `draw()` component so we can use Kaplay's shape drawing without needing external assets.
- A fixed pointer at the top of the wheel (12 o'clock) indicates the winning segment.

## Interaction

- "Spin" button below the wheel.
- Click/tap the button to start a spin.
- Keyboard: pressing `space` also triggers a spin.
- Only one spin at a time; ignore input while the wheel is already spinning.

## Spin Behavior

- Spin picks a random target angle plus several full rotations (e.g., 5–8 turns).
- Animate rotation with easing (e.g., `easings.easeOutCubic` or a custom ease-out) over ~3 seconds.
- When the animation ends, calculate which segment is under the pointer and add the value to the score.
- Show the result briefly (e.g., update score text and/or a temporary status label).

## Score Display

- Score text in the top-left, updated after each spin.
- Initial score of `0`.

## Files to Add/Change

- `src/scenes/game.ts` — replace demo content with wheel scene logic.
- `src/gameobjects/wheel.ts` — new wheel gameobject with drawing, segments, and spin method.
- `src/gameobjects/index.ts` — export `wheel.ts`.
- `src/types/gameobject.ts` — add `Wheel` type from `addWheel`.
- `src/events/cursors.ts` — delete or leave unused; the cursor-movement demo code will be removed.

## Implementation Notes

- Draw the wheel as a circle divided into wedge polygons using `drawPolygon()` or trigonometry in a custom `draw()` callback.
- Segment text can be rendered as small rotated text labels centered on each wedge.
- Use `onUpdate()` or `tween()` (via `lerp` manually or Kaplay's `tween` helper if available) to drive rotation. Since the project is on a recent Kaplay version, we should use whichever animation API the library exposes.
- Keep strict TypeScript typing; no `any`.

## Verification

- `npm run lint:tsc` passes.
- `npm run lint:fix` passes.
- `npm start` opens the game and the wheel spins, lands, and updates the score.
