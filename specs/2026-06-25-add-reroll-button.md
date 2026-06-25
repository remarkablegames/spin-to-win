# Add Reroll Button to Shop

Add a green "Reroll ($2)" button above the "Continue" button in the shop that regenerates ALL shop buttons and increases in cost by $2 each use, resetting to $2 on each shop visit.

## Implementation Plan

### 1. Add Reroll Constants

- Add `REROLL_BASE_COST = 2` and `REROLL_COST_INCREMENT = 2` to `/src/constants/shop.ts`

### 2. Update Shop GameObject

- Add reroll button creation in `addShop()` function in `/src/gameobjects/shop.ts`
- Position it above the Continue button using existing button layout calculations
- Use GREEN/DARK_GREEN colors for the button
- Add reroll callback to ShopCallbacks interface
- Add methods to update reroll button cost and enabled state
- Add methods to regenerate all shop buttons (extra spin, add segment, fill blank, pool upgrades, artifact offers)

### 3. Implement Reroll Logic in Shop Scene

- Add reroll state tracking (cost, usage count) - resets to base cost on shop entry
- Implement `onReroll` callback that:
  - Deducts reroll cost from money
  - Destroys existing shop buttons
  - Regenerates ALL shop buttons with new offers:
    - New pool upgrade offers using `drawPoolOffers()`
    - New artifact offers using `getRandomArtifacts()`
    - Reset extra spin cost to base
    - Reset add segment/fill blank availability
  - **Yes - buttons that were hidden (like "Add Blank Segment") will reappear after reroll**
  - Increases reroll cost by $2
  - Updates button states and UI
  - Plays appropriate sounds and shows toast message

### 4. Button Positioning and Spacing

- Calculate reroll button Y position to be directly above Continue button
- Use existing `BUTTON_START_Y + BUTTON_Y_SPACING * (...)` pattern
- **Adjust overall button spacing to ensure all buttons fit on screen comfortably.**
- Consider reducing `BUTTON_Y_SPACING` from 80 to a smaller value (e.g., 65-70) to accommodate the additional button

### 5. State Management

- Track reroll cost locally in shop scene (resets to $2 on each shop visit)
- Update button enabled states based on money availability
- Ensure complete shop regeneration works correctly
