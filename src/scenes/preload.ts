import { SCENE, SPRITE } from '../constants'

scene(SCENE.PRELOAD, () => {
  const font = loadFont('RobotoMono', '/fonts/RobotoMono.ttf')

  loadSprite(SPRITE.ARROW, '/icons/arrow.png')
  loadSprite(SPRITE.ART, '/icons/art.png')
  loadSprite(SPRITE.COIN, '/sprites/coin.png')
  loadSprite(SPRITE.CROSS_MARK, '/icons/cross_mark.png')
  loadSprite(SPRITE.GRAPE, '/sprites/grape.png')
  loadSprite(SPRITE.HEART, '/sprites/heart.png')
  loadSprite(SPRITE.MONEY_BAG, '/sprites/money_bag.png')
  loadSprite(SPRITE.PLUS, '/icons/plus.png')
  loadSprite(SPRITE.POINTER, '/icons/play.png')
  loadSprite(SPRITE.QUESTION_MARK, '/icons/question_mark.png')
  loadSprite(SPRITE.SKULLER, '/sprites/skuller.png')
  loadSprite(SPRITE.SPARK, '/sprites/spark.png')
  loadSprite(SPRITE.STAR, '/sprites/star.png')
  loadSprite(SPRITE.TRASH, '/icons/trash.png')

  font.then(() => {
    go(SCENE.GAME)
  })
})
