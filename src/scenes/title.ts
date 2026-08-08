import { COLOR, SCENE, SPRITE } from '../constants'
import {
  addButton,
  addGrid,
  addMuteButton,
  addShadowText,
  addWheel,
} from '../gameobjects'
import { computeWheelLayout, isDesktop } from '../utils'

const TITLE_Y = () => (isDesktop() ? 90 : 60)
const TAGLINE_Y = () => (isDesktop() ? 140 : 105)

// Where the wheel/button block starts, right below the title text.
const CONTENT_TOP = () => TAGLINE_Y() + (isDesktop() ? -40 : height() * 0.01)
const DEFAULT_WHEEL_RADIUS = 230
const MIN_WHEEL_RADIUS = 90
const MAX_WHEEL_RADIUS = 320

// Gap above the wheel (room for the pointer).
const POINTER_CLEARANCE = 42

// Distance from the wheel edge to the play button's center.
const GAP_WHEEL_TO_PLAY_BUTTON = 45
const BUTTON_HALF_HEIGHT = 25
const BOTTOM_MARGIN = 20
const POINTER_OFFSET = 14
const WHEEL_ROTATION_SPEED = 8

function getWheelLayout() {
  return computeWheelLayout({
    bottomReserved:
      GAP_WHEEL_TO_PLAY_BUTTON + BUTTON_HALF_HEIGHT + BOTTOM_MARGIN,
    contentTop: CONTENT_TOP(),
    defaultRadius: DEFAULT_WHEEL_RADIUS,
    maxRadius: MAX_WHEEL_RADIUS,
    minRadius: MIN_WHEEL_RADIUS,
    topReserved: POINTER_CLEARANCE,
  })
}

scene(SCENE.TITLE, () => {
  addMuteButton()
  addGrid()

  const { radius, wheelCenterY } = getWheelLayout()

  addShadowText({
    color: COLOR.GOLD,
    pos: { x: center().x, y: TITLE_Y() },
    size: 56,
    text: 'Spin to Win',
  })

  addShadowText({
    color: COLOR.LIGHT_BROWN,
    pos: { x: center().x, y: TAGLINE_Y() },
    shadowColor: COLOR.DARK_BROWN,
    shadowOpacity: 0.8,
    size: 24,
    text: 'Spin. Score. Repeat.',
  })

  const wheelPos = vec2(center().x, wheelCenterY)
  const wheel = addWheel({
    pos: wheelPos,
    radius,
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
    y: wheelCenterY + wheel.radius + GAP_WHEEL_TO_PLAY_BUTTON,
  })
})
