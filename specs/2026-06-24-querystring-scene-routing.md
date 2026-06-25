# Querystring Scene Routing

Parse `?scene=<name>` (and optional state params) from the URL on load and jump directly to that scene, bypassing `SCENE.PRELOAD → SCENE.TITLE`.

## Approach

All logic lives in `src/scenes/start.ts` — the `start()` function already controls initial navigation, so it's the right place to intercept the querystring before calling `go(SCENE.PRELOAD)`.

The preload scene must still run first (assets need to load), so the flow becomes:

```
PRELOAD → (font loaded) → parse querystring → go(target scene with parsed state) OR go(SCENE.TITLE)
```

## Changes

### `src/scenes/start.ts`

1. Read `window.location.search` with `URLSearchParams`.
2. If `?scene=<name>` matches a valid `SCENE` value, after preload completes, call `go(sceneName, parsedState)` instead of `go(SCENE.TITLE)`.
3. Parse additional numeric/boolean state params from the URL for the matching scene.

### `src/scenes/preload.ts`

Change the `font.then` callback to call a configurable `onReady` hook (passed from `start.ts`) instead of hardcoding `go(SCENE.TITLE)`, so scene routing can be injected.

## Supported query params per scene

| Scene   | Params (all optional)                                                          |
| ------- | ------------------------------------------------------------------------------ |
| `title` | _(none)_                                                                       |
| `game`  | `level`, `round`, `score`, `money`, `baseSpins`, `extraSpins`, `passiveIncome` |
| `shop`  | `level`, `round`, `score`, `money`, `passiveIncome`, `baseSpins`               |
| `end`   | `level`, `score`, `money`, `baseSpins`, `extraSpins`, `passiveIncome`          |

All numeric params default to `0` if absent. URL params map to internal state: `level` → `levelIndex`, `round` → `roundIndex`, `score` → `levelScore`. Complex params (`segments`, `artifacts`, `wheelAngle`) are intentionally omitted — they'll use defaults set within each scene.

## Example URLs

```
?scene=title
?scene=game
?scene=game&level=1&money=50
?scene=end&level=0&score=200&money=30
?scene=shop&level=0&round=1&score=100&money=50&passiveIncome=5
```
