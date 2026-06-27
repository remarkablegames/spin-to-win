import { MUSIC, SCENE, SOUND, SPRITE } from '../constants'

function parseIntParam(params: URLSearchParams, key: string): number {
  const value = params.get(key)
  return value !== null ? parseInt(value, 10) : 0
}

function goScene(params: URLSearchParams): void {
  const scene = params.get('scene')

  const baseState = {
    levelIndex: parseIntParam(params, 'level'),
    levelScore: parseIntParam(params, 'score'),
    money: parseIntParam(params, 'money'),
    baseSpins: parseIntParam(params, 'baseSpins') || undefined,
    passiveIncome: parseIntParam(params, 'passiveIncome') || undefined,
  }

  switch (scene) {
    case SCENE.COVER:
      go(SCENE.COVER)
      break

    case SCENE.GAME:
      go(SCENE.GAME, {
        ...baseState,
        roundIndex: parseIntParam(params, 'round'),
        extraSpins: parseIntParam(params, 'extraSpins') || undefined,
      })
      break

    case SCENE.SHOP:
      go(SCENE.SHOP, {
        ...baseState,
        passiveIncome: parseIntParam(params, 'passiveIncome'),
        roundIndex: parseIntParam(params, 'round'),
        artifacts: [],
        segments: [],
      })
      break

    case SCENE.END:
      go(SCENE.END, {
        ...baseState,
        extraSpins: parseIntParam(params, 'extraSpins') || undefined,
      })
      break

    default:
      go(SCENE.TITLE)
      break
  }
}

scene(SCENE.PRELOAD, () => {
  const font = loadFont('RobotoMono', 'fonts/RobotoMono.ttf')

  Object.values(SPRITE).forEach(
    (sprite) => void loadSprite(sprite.id, sprite.src),
  )

  Object.values(SOUND).forEach((sound) => void loadSound(sound.id, sound.src))

  Object.values(MUSIC).forEach((music) => void loadSound(music.id, music.src))

  void font.then(() => {
    goScene(new URLSearchParams(location.search))
  })
})
