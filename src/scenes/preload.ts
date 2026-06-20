import { SCENE, SPRITE } from '../constants'

scene(SCENE.PRELOAD, () => {
  loadFont('RobotoMono', '/fonts/RobotoMono.ttf')
  loadSprite(SPRITE.COIN, '/sprites/coin.png')
  loadSprite(SPRITE.POINTER, '/icons/play.png')
  go(SCENE.GAME)
})
