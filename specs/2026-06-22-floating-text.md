# Floating Text on Wheel Land

Add a floating text effect that rises from the wheel center and fades out when the wheel lands on a segment.

## Approach

Create `addFloatingText(options)` in `src/gameobjects/floatingText.ts`:

- Spawns a `text()` object at a given `pos`
- Uses `lifespan(1, { fade: 0.5 })` for auto-destroy + fade out
- Tweens `pos.y` upward by ~80px over ~1s for the float effect

## Text content

Based on the segment result:

- Score: `+50` or `-15` (segment color)
- Money: `+$3` or `-$3` (green / red)
- Multiplier: `+25%` or `-25%` (matching wheel label, `COLOR.LIGHT_BLUE` / `COLOR.PURPLE`)
- Blank/skipped: no float

## Integration

In `src/scenes/game.ts`, call `addFloatingText` inside the `wheel.spin` callback (after `applyArtifactEffects`), spawning at `vec2(center().x, center().y - WHEEL_OFFSET)`.

## Files

- **New:** `src/gameobjects/floatingText.ts`
- **Edit:** `src/gameobjects/index.ts` — export `addFloatingText`
- **Edit:** `src/scenes/game.ts` — call `addFloatingText` in spin callback
