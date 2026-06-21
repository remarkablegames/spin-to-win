import { SCENE, SPRITE } from '../constants'

scene(SCENE.PRELOAD, () => {
  loadFont('RobotoMono', '/fonts/RobotoMono.ttf')

  loadSprite(SPRITE.COIN, '/sprites/coin.png')
  loadSprite(SPRITE.GRAPE, '/sprites/grape.png')
  loadSprite(SPRITE.HEART, '/sprites/heart.png')
  loadSprite(SPRITE.MONEY_BAG, '/sprites/money_bag.png')
  loadSprite(SPRITE.POINTER, '/icons/play.png')
  loadSprite(SPRITE.QUESTION_MARK, '/icons/question_mark.png')
  loadSprite(SPRITE.SKULLER, '/sprites/skuller.png')
  loadSprite(SPRITE.STAR, '/sprites/star.png')
  loadSprite(SPRITE.TRASH, '/icons/trash.png')

  go(SCENE.GAME)
})
