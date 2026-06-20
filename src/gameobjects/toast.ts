import { COLOR } from '../constants'

const PADDING_X = 24
const PADDING_Y = 12
const TEXT_SIZE = 24
const TOAST_DURATION = 1.5
const TOAST_FADE = 0.5
const TOAST_Y = 64

export function addToast(message: string) {
  const formatted = formatText({ size: TEXT_SIZE, text: message })
  const backgroundWidth = formatted.width + PADDING_X * 2
  const backgroundHeight = formatted.height + PADDING_Y * 2

  const background = add([
    rect(backgroundWidth, backgroundHeight, { radius: 8 }),
    pos(center().x, TOAST_Y),
    anchor('top'),
    color(COLOR.BLACK),
    opacity(),
    scale(),
    lifespan(TOAST_DURATION, { fade: TOAST_FADE }),
  ])

  background.add([
    text(message, { size: TEXT_SIZE }),
    pos(0, backgroundHeight / 2),
    anchor('center'),
    color(COLOR.WHITE),
    opacity(),
    lifespan(TOAST_DURATION, { fade: TOAST_FADE }),
  ])

  background.scale = vec2(1.5)
  tween(
    background.scale.x,
    1,
    0.5,
    (value) => {
      background.scale = vec2(value)
    },
    easings.easeOutBack,
  )

  return background
}
