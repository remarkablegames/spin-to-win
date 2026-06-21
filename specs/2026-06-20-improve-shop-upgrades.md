# Improve Shop Upgrades

Redesign the shop with a hybrid fixed+random upgrade system, an inline interactive wheel, typed segment upgrades, blank segments, and new upgrade types (passive income, multiplier segments, permanent base spin, fill blank, delete segment).

## Shop Layout

Split screen:

- **Left** — wheel rendered at `vec2(width() * 0.28, center().y)`, non-spinning, always visible
- **Right** — upgrade buttons at `~width() * 0.72`

## Upgrade Structure

### Fixed upgrades (always shown)

| Upgrade     | Cost                          | Notes                                                 |
| ----------- | ----------------------------- | ----------------------------------------------------- |
| Extra Spin  | $2 (scales +$2 each purchase) | Consumable; buy multiple times                        |
| Add Segment | Free                          | Adds a **blank** segment to the wheel; once per visit |
| Continue    | —                             | Always available                                      |

### Random offer pool (2 drawn per visit, both buyable)

| Upgrade                | Weight | Cost                           | Effect                                            | Cap / Guard                      |
| ---------------------- | ------ | ------------------------------ | ------------------------------------------------- | -------------------------------- |
| Upgrade Score Segment  | 25     | $5 (scales +$2 each purchase)  | Click a score segment to add +5 score             | Disabled if no score segments    |
| Upgrade Money Segment  | 25     | $5 (scales +$2 each purchase)  | Click a money segment to add +$2 money            | Disabled if no money segments    |
| Fill Blank             | 20     | $4                             | Click a blank → pick from 3 random fill templates | Disabled if no blanks            |
| Add Multiplier Segment | 20     | $8                             | Adds `×1.25` (70%) or `×0.75` (30%) to wheel      | None                             |
| Permanent Base Spin    | 15     | $10 (scales +$5 each purchase) | +1 spin permanently every round                   | None                             |
| Delete Segment         | 8      | $15 (scales +$5 each purchase) | Click any segment to permanently remove it        | Disabled if ≤5 segments on wheel |
| Upgrade Passive Income | 10     | $8 (scales +$4 each purchase)  | +1 money per round permanently                    | Max 3 upgrades total             |

Raw weights sum to 123; weighted draw normalizes. 2 unique offers drawn per visit at scene load.

## Blank Segment Mechanics

- `WheelSegment` gets `blank?: true` field
- Blank segments: `score = 0`, `money = 0`, no multiplier — landing does nothing
- Visual: grey segment with a `?` icon
- "Add Segment" (fixed) adds one blank per visit

## Fill Blank Interaction

1. Player clicks "Fill Blank" offer (disabled if no blanks)
2. Wheel enters **fill mode** — only blank segments are hoverable/clickable
3. Player clicks a blank → 3 randomly drawn fill templates shown as overlay buttons
4. Player picks one → blank replaced with that segment; fill mode exits

Fill templates drawn from `FILL_TEMPLATES` pool in `src/constants/shop.ts`.

## Delete Segment Interaction

1. Player clicks "Delete Segment" offer (disabled if wheel has ≤5 segments)
2. Wheel enters **delete mode** — all segments hoverable; tooltip shows `"Click to delete"`
3. Player clicks a segment → it is removed from `wheel.segments`; delete mode exits
4. Offer can be bought again if another draw shows it (cost scales per purchase)

## Upgrade Wheel Interaction (typed)

`setUpgradeMode(type: 'score' | 'money', amount, onSelect)` on wheel:

- **Score mode**: only segments with `score !== 0` hoverable; tooltip `"+10 → +15 · click"`
- **Money mode**: only segments with `money !== 0` hoverable; tooltip `"+$1 → +$3 · click"`
- Click to confirm, exits upgrade mode

## Multiplier Segment Mechanics

- New `WheelSegment` field: `multiplier?: number` (e.g. `1.25` or `0.75`)
- When landed on: `levelScore = Math.round(levelScore * segment.multiplier)` in `game.ts`
- Label: `×1.25` or `×0.75`; icon: existing star sprite; `score`/`money` stay `0`

## Permanent Base Spin Mechanics

- Thread `bonusBaseSpins` through `GameState` ↔ `ShopState`
- `startRound`: `totalSpinsForRound = level.baseSpinsPerRound + LEVEL.BONUS_SPINS + extraSpins + bonusBaseSpins`
- `extraSpins` resets each round; `bonusBaseSpins` persists

## Balance

- Passive income capped at 3 total; offer disabled at cap
- Delete Segment disabled if ≤5 segments; rare (weight 8, ~6.5% of draws) and costly ($15+)
- Fill Blank disabled if no blanks; Upgrade Score/Money disabled if no valid targets

## Files to Modify

- `src/constants/shop.ts` — weighted pool definitions, fill templates, all upgrade constants
- `src/gameobjects/wheel.ts` — add `blank?`/`multiplier?` to `WheelSegment`; `setUpgradeMode(type, amount, onSelect)`; `setFillMode(onSelect)`; `setDeleteMode(onSelect)`; position param in `addWheel`
- `src/gameobjects/shop.ts` — fixed+random layout; dynamic 2-offer render; fill template sub-buttons; right-side repositioning
- `src/scenes/shop.ts` — inline wheel, weighted pool draw, all callbacks, state threading
- `src/scenes/game.ts` — `multiplier`/`blank` segment handling; `passiveIncome` + `bonusBaseSpins` threading

## Execution Order

1. `src/constants/shop.ts` — all constants, pool definitions, fill templates
2. `src/gameobjects/wheel.ts` — `blank`/`multiplier` fields + all interaction modes + position param
3. `src/gameobjects/shop.ts` — fixed+random layout + fill template sub-buttons
4. `src/scenes/shop.ts` — inline wheel + all interactions
5. `src/scenes/game.ts` — new segment type handling + state threading
