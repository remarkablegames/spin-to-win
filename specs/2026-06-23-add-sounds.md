# Add Sounds

Add sound effects to the game using Kaplay `loadSound` and `play`.

## Sound palette

- Button/UI click: `click_002.mp3`
- Button hover: `drop_003.mp3`
- Wheel tick: `tick_001.mp3`
- Positive reward: `confirmation_001.mp3`
- Negative reward: `error_008.mp3`
- Invalid/blocked action: `error_006.mp3`
- Artifact gained/used: `drop_004.mp3`
- Shop purchase: `kaching.mp3`

## Approach

Create sound constants and playback helpers:

- `src/types/sound.ts` defines the shared `Sound` interface.
- `src/constants/sound.ts` maps each sound ID to `/sounds/*.mp3` and default volume.
- `src/utils/sound.ts` exposes `playSound`, `playWheelTick`, and `playRewardSound`.
- `src/scenes/preload.ts` loads every sound from `Object.values(SOUND)` before entering the game.

## Wheel ticks

Tick sound should be synced to actual wheel segment crossings, not a fixed timer:

- Store the current winning segment index when a spin starts.
- During the spin tween update, compare `getWinningSegmentIndex()` with the previous index.
- Play `tick_001.mp3` only when the index changes.
- This makes ticks fast at the beginning of the spin and slower as the wheel eases out.

## Integration

- `addButton` plays hover, click, and invalid-action sounds.
- `addWheel` accepts an `onSpinTick` callback.
- `src/scenes/game.ts` wires wheel ticks, reward sounds, artifact sounds, and invalid action sounds.
- `src/scenes/shop.ts` wires purchase sounds and invalid action sounds.
