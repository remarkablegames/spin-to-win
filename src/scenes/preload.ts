import { SCENE, SOUND, SPRITE } from '../constants'

scene(SCENE.PRELOAD, () => {
  const font = loadFont('RobotoMono', '/fonts/RobotoMono.ttf')
  const sounds = Object.values(SOUND).map((sound) =>
    loadSound(sound.id, sound.src),
  )

  loadSprite(SPRITE.APPLE.id, '/sprites/apple.png')
  loadSprite(SPRITE.ARROW.id, '/icons/arrow.png')
  loadSprite(SPRITE.ART.id, '/icons/art.png')
  loadSprite(SPRITE.COIN.id, '/sprites/coin.png')
  loadSprite(SPRITE.COPY.id, '/icons/copy.png')
  loadSprite(SPRITE.CROSS_MARK.id, '/icons/cross_mark.png')
  loadSprite(SPRITE.FIRE.id, '/sprites/fire.png')
  loadSprite(SPRITE.GRAPE.id, '/sprites/grape.png')
  loadSprite(SPRITE.HEART.id, '/sprites/heart.png')
  loadSprite(SPRITE.MONEY_BAG.id, '/sprites/money_bag.png')
  loadSprite(SPRITE.PLUS.id, '/icons/plus.png')
  loadSprite(SPRITE.POINTER.id, '/icons/play.png')
  loadSprite(SPRITE.QUESTION_MARK.id, '/icons/question_mark.png')
  loadSprite(SPRITE.SKULLER.id, '/sprites/skuller.png')
  loadSprite(SPRITE.SPIDER_WEB.id, '/sprites/spider_web.png')
  loadSprite(SPRITE.SPARK.id, '/sprites/spark.png')
  loadSprite(SPRITE.SPARKLES.id, '/sprites/sparkles.png')
  loadSprite(SPRITE.STAR.id, '/sprites/star.png')
  loadSprite(SPRITE.TRASH.id, '/icons/trash.png')

  void Promise.all([font, ...sounds]).then(() => {
    go(SCENE.TITLE)
  })
})
