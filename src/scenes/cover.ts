import { COLOR, SCENE, SPRITE } from '../constants'
import { addWheel } from '../gameobjects'

const WHEEL_SCALE = 2
const POINTER_SCALE = 1.5
const POINTER_OFFSET = -15

scene(SCENE.COVER, () => {
  const wheel = addWheel({
    pos: center(),
  })
  wheel.use(scale(WHEEL_SCALE))

  add([
    sprite(SPRITE.POINTER.id, {
      height: SPRITE.POINTER.height * POINTER_SCALE,
      width: SPRITE.POINTER.width * POINTER_SCALE,
    }),
    pos(
      center().x,
      center().y - wheel.radius * WHEEL_SCALE - POINTER_OFFSET * WHEEL_SCALE,
    ),
    anchor('center'),
    rotate(90),
    color(COLOR.LIGHT_GREEN),
    scale(WHEEL_SCALE),
  ])
})
