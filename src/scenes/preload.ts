import { MUSIC, SCENE, SOUND, SPRITE } from '../constants'

function parseIntParam(params: URLSearchParams, key: string): number {
  const value = params.get(key)
  return value !== null ? parseInt(value, 10) : 0
}

function getScene(params: URLSearchParams): () => void {
  const scene = params.get('scene')

  const baseState = {
    levelIndex: parseIntParam(params, 'level'),
    levelScore: parseIntParam(params, 'score'),
    money: parseIntParam(params, 'money'),
    baseSpins: parseIntParam(params, 'baseSpins') || undefined,
    passiveIncome: parseIntParam(params, 'passiveIncome') || undefined,
  }

  switch (scene) {
    case SCENE.GAME:
      return () => {
        go(SCENE.GAME, {
          ...baseState,
          roundIndex: parseIntParam(params, 'round'),
          extraSpins: parseIntParam(params, 'extraSpins') || undefined,
        })
      }

    case SCENE.SHOP:
      return () => {
        go(SCENE.SHOP, {
          ...baseState,
          passiveIncome: parseIntParam(params, 'passiveIncome'),
          roundIndex: parseIntParam(params, 'round'),
          artifacts: [],
          segments: [],
        })
      }

    case SCENE.END:
      return () => {
        go(SCENE.END, {
          ...baseState,
          extraSpins: parseIntParam(params, 'extraSpins') || undefined,
        })
      }

    default:
      return () => {
        go(SCENE.TITLE)
      }
  }
}

scene(SCENE.PRELOAD, () => {
  const font = loadFont('RobotoMono', '/fonts/RobotoMono.ttf')

  Object.values(SPRITE).forEach(
    (sprite) => void loadSprite(sprite.id, sprite.src),
  )

  Object.values(SOUND).forEach((sound) => void loadSound(sound.id, sound.src))

  Object.values(MUSIC).forEach((music) => void loadSound(music.id, music.src))

  void font.then(() => {
    getScene(new URLSearchParams(location.search))()
  })
})
