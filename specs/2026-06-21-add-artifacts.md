# Add Artifacts

Introduce a persistent artifact system that gives players both active consumables and passive relics, acquired from the shop and rare wheel drops, lasting for the entire run.

## Scope

- **Active artifacts**: one-time or limited-use items the player triggers during a spin (e.g., double the next segment's effects).
- **Passive artifacts**: persistent relics that apply a run-wide bonus (e.g., converting unused spins to money, adding +2 spins per round, growing segment scores). No special wheel segments are part of this plan.
- **Acquisition**: bought from a new shop pool offer and/or granted by a rare "Artifact" wheel segment.
- **Persistence**: active artifacts go into an inventory; passive relics apply immediately and last until the run ends.
- **Inventory limit**: Active artifact inventory is limited to 3 slots.
- **Selling**: Active artifacts and passive relics can be sold back to the shop in the shop scene. Selling a passive relic reverts its effect.
- **Shop offers**: Each shop visit shows 2 random artifact offers weighted by hidden rarity tiers. Rarity is not displayed in the UI; it only affects selection probabilities.
- **Hidden rarity tiers**:
  - **Common**: Extend Spin, Boost Next Score, Boost Next Money
  - **Uncommon**: Blank Next Segment, Boost Next Multiplier, Skip Next Negative
  - **Rare**: Double Next Segment, Lucky Coin, Extra Round Spin, Score Growth

## Proposed First Artifacts

1. **Double Next Segment** (active, single use)
   - Doubles the score and money of the next spin, including negative effects (e.g., -25 becomes -50, -$3 becomes -$6).
   - Triggered by clicking the artifact slot before or during a spin.
2. **Boost Next Score** (active, single use)
   - The next spin gives +50% score.
   - Triggered by clicking the artifact slot before or during a spin.
3. **Boost Next Money** (active, single use)
   - The next spin gives +50% money.
   - Triggered by clicking the artifact slot before or during a spin.
4. **Boost Next Multiplier** (active, single use)
   - If the next spin lands on a multiplier segment, the multiplier value is increased by +0.25 for that spin.
   - Triggered by clicking the artifact slot before or during a spin.
5. **Extend Spin** (active, single use)
   - During a spin, adds one extra segment worth of rotation to the target angle so the wheel lands on the next segment.
   - Can be used multiple times on the same spin if the player has multiple copies.
6. **Skip Next Negative** (active, single use)
   - If the next spin lands on a segment with a negative effect (negative score or negative money), that effect is ignored and the spin is consumed.
   - Triggered by clicking the artifact slot before or during a spin.
7. **Blank Next Segment** (active, single use)
   - Before the next spin, the player selects one wheel segment. That segment is treated as blank for the next spin (no score, money, or multiplier effect).
   - The segment is restored after the spin.
   - Triggered by clicking the artifact slot before a spin.
8. **Lucky Coin** (passive relic)
   - At the end of each round, each unused spin gives +$1.
   - Shown in a small relic panel.
9. **Extra Round Spin** (passive relic)
   - Adds +2 extra spins to the total spins available each round.
   - Shown in a small relic panel.
10. **Score Growth** (passive relic)

- Each time the wheel lands on a segment with a score value, that segment's score is permanently increased by +5 (including negative segments, making them more negative).
- Shown in a small relic panel.

## UI Placement

- **Active artifacts**: Rendered in a horizontal inventory bar at the bottom of the screen with 3 fixed slots, above or beside the spin/skip buttons.
- **Container**: A rectangular background similar to the header, colored with the existing `COLOR.LIGHT_BROWN` (`rgb(220, 185, 160)`), sized to fit the slot icons.
- **Slots**: Each artifact is shown as an icon with a number badge (for charges). Slots are clickable buttons; the number `1`, `2`, etc. is a visual hint only, and number-key shortcuts are optional. Hovering a slot shows a tooltip with the artifact's name and description.
- **Passive relics**: Shown in a small panel in the shop scene, and optionally as tiny icons in the top-right during gameplay.

## Work Breakdown

1. **Data model**
   - Add `src/constants/artifacts.ts` with artifact definitions, effects, and a type union (`ArtifactId`, `Artifact`, `ActiveArtifact`, `PassiveArtifact`).
   - Track artifacts in `GameState` (`activeArtifacts` array limited to 3 slots, `passiveArtifacts` relic list) and thread them through the shop → game → shop loop.
2. **Passive relics**
   - Apply relic effects to round/state calculations (e.g., converting unused spins to money, adding +2 spins per round, growing segment scores, score multiplier).
   - Draw a small relic panel in the shop and game scenes.
3. **Active artifacts**
   - Add an inventory bar (e.g., key icons at screen bottom) during the game scene.
   - Listen for input to consume the active artifact before/during the spin.
   - Modify the spin result in `scenes/game.ts` when an active artifact is queued.
   - For "Extend Spin", allow the wheel's tween target angle to be increased by one segment angle while the wheel is spinning.
   - For "Skip Next Negative", check if the winning segment has negative score or money and ignore it when queued.
   - For "Blank Next Segment", let the player select one segment before the next spin; treat it as blank for that spin.
   - For "Boost Next Score", increase the next spin's score by 50%.
   - For "Boost Next Money", increase the next spin's money by 50%.
   - For "Boost Next Multiplier", increase the next spin's multiplier value by +0.25.
4. **Acquisition**
   - Add a new artifact shop offer in `src/constants/shop.ts` and `src/gameobjects/shop.ts`. Each shop visit shows 2 random artifact offers for purchase, weighted by rarity.
   - Add a rare "Artifact" wheel segment in `src/gameobjects/wheel.ts` or as a fill template that grants a random artifact.
   - Implement weighted random selection for both artifact drops and the shop offer.
5. **Save/load**
   - Extend `GameState` so active and passive artifacts carry over between shop and game scenes.
   - Keep the run-scoped persistence: reset on new game.
6. **Selling artifacts**
   - In the shop scene, add a sell action to active artifact slots and passive relic slots (e.g., right-click or a small sell button on hover).
   - Refund a fixed amount of money (e.g., 50% of the artifact's base cost) and remove the artifact from inventory.
   - Selling a passive relic reverts its applied effect (e.g., selling Lucky Coin stops converting unused spins to money).
7. **Polish**
   - Tooltips and toast messages for each artifact.
   - Icons for each artifact using existing public sprites (e.g., icons in `public/icons/` and `public/sprites/`).
   - Ensure active artifacts cannot be used when no spins remain.

## Open Decisions

- Exact icons and sprite names for artifacts.
- Balance: cost, drop chance, and maximum copies per artifact.
- Whether active artifacts should also be purchasable in the shop or only dropped from the wheel.

## Files to Touch

- `src/constants/artifacts.ts` (new)
- `src/constants/shop.ts` (artifact pool constants)
- `src/gameobjects/shop.ts` (artifact button/offer)
- `src/gameobjects/wheel.ts` (artifact segment, if any)
- `src/scenes/game.ts` (inventory UI, active artifact consumption, passive effects)
- `src/scenes/shop.ts` (artifact offer handler, relic panel, state carry-over)
- `src/gameobjects/index.ts` (export any new artifact UI helpers)
