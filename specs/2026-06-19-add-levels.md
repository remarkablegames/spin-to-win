# Add Levels with Rounds to Spin-the-Wheel

Add a level system where each level contains multiple rounds of fixed spins, the target score is checked only after the last round, and excess score carries over to the next level to set up a future shop between levels.

## Approach

- Keep the current wheel and button visuals intact.
- Add a `LevelConfig` data structure with `targetScore`, `baseSpinsPerRound`, and `roundsPerLevel`.
- Add a global `bonusSpins` placeholder (default 0) that the shop will later upgrade. Actual spins per round = `baseSpinsPerRound + bonusSpins`. Start with `baseSpinsPerRound = 1`.
- Track per-round state (`roundScore` resets every round) and per-level state (`levelScore = carryOver + sum of round scores`).
- After each round's last spin, show a "Next Round" summary and advance to the next round.
- After the last round of the level, check if `levelScore >= targetScore`:
  - If yes: show a "Next Level" button. Excess (`levelScore - targetScore`) becomes the next level's `carryOver`.
  - If no: show a "Retry Level" button that resets the current level with `carryOver = 0`.
- Leave a hook for the future shop between levels (e.g., a `shop` flag or pause before the next level starts).
- Add UI in this format, visible during play:
  ```
  Level 1
  Round 1/6
  Spin 1/3
  0/100
  ```
  where the last line is `levelScore / targetScore`.

## Files to Modify

- `src/gameobjects/wheel.ts` — add a `reset()` method to clear the wheel angle and `isSpinning` flag.
- `src/scenes/game.ts` — add round/level tracking, win/loss checks, and round/level-end UI.
- `src/gameobjects/button.ts` — add an `enabled` flag so the spin button can be disabled during transitions.
- `src/constants/scene.ts` — optional `LEVEL_SUMMARY` scene if we want a separate screen between rounds/levels (plan assumes inline UI for now).

## Files to Create

- `src/constants/level.ts` — define `LevelConfig` and the `LEVELS` array.
- `src/gameobjects/levelSummary.ts` — optional reusable overlay for round/level transitions.

## Open Questions

- Should the wheel segments stay the same for all levels, or change per level? (Plan assumes same wheel for now; easy to extend later.)
- Should the "Next Round" screen show only a button, or also display round score and level total?
