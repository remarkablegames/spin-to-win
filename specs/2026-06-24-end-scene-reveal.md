# End Scene Score Reveal

Animate the score progress bar filling up when the player submits their score, then reveal pass/fail.

## Flow

1. End scene loads — header shows final score (e.g. `120/100`), header bar pre-filled, center bar at 0
2. A **"Submit Score"** button is shown below the center bar
3. Player clicks → button hides, both animations run in sync over ~1.5s:
   - **Header score** counts down: `120 → 20` (score minus target, floored at 0)
   - **Header progress bar** shrinks from filled → 0 (or to overflow ratio if score > target)
   - **Center progress bar** fills from 0 → final ratio (capped at 1.0)
4. On complete → result label + next action button appear

## Sound design

- Add `SCORE_FILL` sound constant → `glass_005.mp3`
- Load it in `preload.ts` (auto-handled via `Object.values(SOUND)`)
- During fill animation: play `SCORE_FILL` repeatedly on a short interval (e.g. every 100ms)
- Add `LEVEL_COMPLETE` sound constant → `confirmation_002.mp3`
- Add `LEVEL_FAILED` sound constant → `error_006.mp3`
- On animation complete: play `LEVEL_COMPLETE` (win) or `LEVEL_FAILED` (loss); stop the tick interval

## Sync strategy

Both animations use the same tween duration. `animateScore` on the header accepts a `duration` param and drives the score label via `Math.round(tween value)` on each frame. The center bar `animateTo` uses the same duration.

## Changes

### `src/gameobjects/progressBar.ts` _(new)_

`addProgressBar({ x, y, width, height, color })` returns:

- `setRatio(ratio)` — instantly sets fill width (0–1)
- `animateTo(ratio, duration, onComplete?)` — tweens fill from current to target, calls `onComplete` when done

### `src/gameobjects/header.ts`

- Replace inline rect/fill logic with `addProgressBar(...)` at the existing position/size
- `setScore()` calls `progressBar.setRatio(...)` and stores `current`/`target` for use in animation
- Add `animateScore(duration, onComplete?)` — simultaneously tweens header score label downward (`current → Math.max(0, current - target)`) and header bar (`current ratio → Math.max(0, current - target) / target`)

### `src/gameobjects/index.ts`

- Export `addProgressBar` from the barrel

### `src/scenes/end.ts`

- Call `header.setScore(state.levelScore, level.targetScore)` (bar pre-filled, score shown as-is)
- Add a larger standalone `addProgressBar(...)` in the center of the scene at ratio `0`
- Add **"Submit Score"** button below the center bar
- On click:
  1. Hide the button
  2. Call `header.animateScore(DURATION)` and `centerBar.animateTo(finalRatio, DURATION, onComplete)` in parallel
  3. `onComplete`: add result label + next action button (win → "Next Level" → `SCENE.GAME`; last level win → "Main Menu" → `SCENE.TITLE`; lose → "Restart" → `SCENE.TITLE`)
- When advancing to next level, pass `levelScore: Math.max(0, state.levelScore - level.targetScore)` instead of raw `state.levelScore`

### `src/scenes/game.ts`

- Update `carryOver` to use `initialState.levelScore` (currently hardcoded `0`) so `startLevel` picks it up correctly — this is already wired, just needs `carryOver` to be set from state
