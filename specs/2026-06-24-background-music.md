# Background Music

Add looping background music (`second_dealing.mp3`) that starts when the game begins and persists across scenes, with a mute toggle button in the top-right corner of every scene.

## Approach

Kaplay's `play()` returns an `AudioPlay` instance. We'll store a module-level reference so it can be started once and never restarted on re-entry to the game scene (e.g. returning from shop or advancing levels).

## Steps

### 1. Add `MUSIC` constant to `src/constants/sound.ts`

Add a new exported `MUSIC` object (separate from `SOUND`) with the music file path and a base volume.

```ts
export const MUSIC = {
  id: 'music',
  src: '/music/second_dealing.mp3',
  volume: 0.4,
}
```

### 2. Load music in `src/scenes/preload.ts`

Use `loadSound` to preload the music file alongside the existing sounds. Add `MUSIC` to the `Promise.all` wait list so the scene doesn't advance until it's ready.

### 3. Add `playMusic` helper in `src/utils/sound.ts`

Use a module-level `AudioPlay | null` variable to track the instance.

```ts
let bgMusic: AudioPlay | null = null

export function playMusic() {
  if (bgMusic) return // already playing
  bgMusic = play(MUSIC.id, { volume: MUSIC.volume, loop: true })
}
```

### 4. Start music in `src/scenes/game.ts` — on scene entry (re-entry guard)

Call `playMusic()` at the top of the `scene(SCENE.GAME, ...)` callback. The re-entry guard in `playMusic` ensures it won't restart if already playing (e.g. when returning from shop or advancing levels). This covers all entry paths: title → game, end → game, shop → game.

### 5. Add `SOUNDS` and `SOUNDS_MUTED` sprite constants in `src/constants/sprite.ts`

Add two sprite entries (both 32×32):

- `SOUNDS` → `sounds.png` (filled, unmuted state)
- `SOUNDS_MUTED` → `sounds-o.png` (outline, muted state)

### 6. Load both sprites in `src/scenes/preload.ts`

Add `loadSprite` calls for both `SPRITE.SOUNDS` and `SPRITE.SOUNDS_MUTED`.

### 7. Add `addMuteButton` gameobject in `src/gameobjects/muteButton.ts`

A small icon-only clickable sprite in the top-right corner. On click, toggles Kaplay's global `volume()` between 0 and 1 and swaps the sprite between `SPRITE.SOUNDS` (filled, unmuted) and `SPRITE.SOUNDS_MUTED` (outline, muted) using Kaplay's `use(sprite(...))`. Mute state is persisted to `localStorage` via `getData`/`setData` with the key `'org.remarkablegames.spin-to-win.muted'` (boolean) so it survives scene transitions and page reloads.

### 8. Export `addMuteButton` from `src/gameobjects/index.ts`

### 9. Call `addMuteButton()` in all scenes

Add to `title.ts`, `game.ts`, `shop.ts`, and `end.ts`.

## Files changed

- `src/constants/sound.ts` — add `MUSIC`
- `src/constants/sprite.ts` — add `SOUNDS` sprite
- `src/scenes/preload.ts` — load music asset + sounds sprite
- `src/utils/sound.ts` — add `playMusic`
- `src/scenes/game.ts` — call `playMusic()` + `addMuteButton()` on scene entry
- `src/gameobjects/muteButton.ts` — new file
- `src/gameobjects/index.ts` — export `addMuteButton`
- `src/scenes/title.ts`, `shop.ts`, `end.ts` — call `addMuteButton()`
