import { SCENE, SPRITE } from '../constants'

scene(SCENE.PRELOAD, () => {
  loadFont('RobotoMono', '/fonts/RobotoMono.ttf')
  loadSprite(SPRITE.COIN, '/sprites/coin.png')
  go(SCENE.GAME)
})
