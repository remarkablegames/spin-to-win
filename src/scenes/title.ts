import { COLOR, SCENE, SPRITE } from '../constants'
import { addButton, addGrid, addMuteButton, addWheel } from '../gameobjects'

const TITLE_Y = 130
const TAGLINE_Y = 180
const WHEEL_RADIUS = 230
const WHEEL_Y_OFFSET = 0
const PLAY_BUTTON_Y_OFFSET = 285
const POINTER_OFFSET = 14
const TAGLINE_SHADOW_OFFSET = 2
const WHEEL_ROTATION_SPEED = 8

scene(SCENE.TITLE, () => {
  addMuteButton()
  addGrid()

  add([
    text('Spin to Win', { size: 56 }),
    pos(center().x, TITLE_Y),
    anchor('center'),
    color(COLOR.GOLD),
  ])

  add([
    text('Spin. Score. Repeat.', { size: 24 }),
    pos(center().x + TAGLINE_SHADOW_OFFSET, TAGLINE_Y + TAGLINE_SHADOW_OFFSET),
    anchor('center'),
    color(COLOR.DARK_BROWN),
    opacity(0.8),
  ])

  add([
    text('Spin. Score. Repeat.', { size: 24 }),
    pos(center().x, TAGLINE_Y),
    anchor('center'),
    color(COLOR.LIGHT_BROWN),
  ])

  const wheelPos = vec2(center().x, center().y + WHEEL_Y_OFFSET)
  const wheel = addWheel({
    pos: wheelPos,
    radius: WHEEL_RADIUS,
  })

  wheel.onUpdate(() => {
    wheel.angle += WHEEL_ROTATION_SPEED * dt()
  })

  add([
    sprite(SPRITE.POINTER.id, {
      width: SPRITE.POINTER.width,
      height: SPRITE.POINTER.height,
    }),
    pos(wheelPos.x, wheelPos.y - wheel.radius - POINTER_OFFSET),
    anchor('center'),
    rotate(90),
    color(COLOR.WHITE),
  ])

  addButton({
    icon: SPRITE.POINTER.id,
    label: 'Play',
    onClick: () => {
      go(SCENE.GAME)
    },
    tooltip: 'Start a new run',
    tooltipAnchor: 'bot',
    x: center().x,
    y: center().y + PLAY_BUTTON_Y_OFFSET,
  })
})
