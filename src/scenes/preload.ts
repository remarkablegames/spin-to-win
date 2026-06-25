import { MUSIC, SCENE, SOUND, SPRITE } from '../constants'

scene(SCENE.PRELOAD, () => {
  const font = loadFont('RobotoMono', '/fonts/RobotoMono.ttf')

  Object.values(SPRITE).forEach(
    (sprite) => void loadSprite(sprite.id, sprite.src),
  )

  Object.values(SOUND).forEach((sound) => void loadSound(sound.id, sound.src))

  Object.values(MUSIC).forEach((music) => void loadSound(music.id, music.src))

  void font.then(() => {
    go(SCENE.TITLE)
  })
})
