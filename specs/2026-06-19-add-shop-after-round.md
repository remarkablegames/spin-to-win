# Add Shop After Each Round

Add a separate money currency, give money from wheel segments and passive income, and open a shop after every round where players can buy bonus spins and better wheel segments.

## Approach

- Extend `WheelSegment` to provide both `score` and `money` (e.g., `+10/+5`, `+25/+8`, `-25/-5`).
- Track `money` alongside `levelScore` in `game.ts`.
- Add a passive income value (base +3 money per round) that can be upgraded in the shop.
- Update the header to show current money.
- Create a separate `SHOP` scene that renders the shop UI without the wheel.
- After each round, replace the "Next Round" button with a "Shop" button that navigates to the `SHOP` scene.
- In the shop scene, show three upgrades as clickable buttons:
  - **Extra Spin** — adds +1 spin to the next round only (consumable, can be bought multiple times). Cost shown on or next to the button.
  - **Upgrade Wheel** — picks a random positive segment and increases its score and money value by a fixed amount. Cost shown on or next to the button.
  - **Add Segment** — free. Adds a random segment to the wheel: 70% chance positive, 30% chance negative.
- Extra Spin cost scales per shop visit: first $2, second $4, third $6, etc.
- Upgrade Wheel has a fixed cost in money (tuneable).
- The shop is optional: a "Continue" button proceeds to the next round without buying anything.
- Clicking "Continue" in the shop returns to the game scene and starts the next round.
- Pass the current level/round/money/state to the shop scene and back.

## Files to Modify

- `src/gameobjects/wheel.ts` — add `money` to `WheelSegment`, update `SEGMENTS`, and add an upgrade method to mutate segment values.
- `src/gameobjects/header.ts` — add `setMoney(current)` to display money.
- `src/gameobjects/button.ts` — no changes needed (already supports labels, colors, enable/disable).
- `src/scenes/game.ts` — add money state, passive income, shop integration, and wire up the shop between rounds.

## Files to Create

- `src/constants/shop.ts` — define upgrade costs, passive income base, and scaling rules.
- `src/scenes/shop.ts` — create the `SHOP` scene.
- `src/gameobjects/shop.ts` — create `addShop()` UI with upgrade buttons and a continue button.
- `src/constants/scene.ts` — add `SHOP` scene constant.
