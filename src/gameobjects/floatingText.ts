import type { Color, Vec2 } from 'kaplay'

import { COLOR } from '../constants'

const TEXT_SIZE = 32
const FLOAT_DISTANCE = 80
const SHADOW_OFFSET = 2
export const FLOATING_TEXT_DURATION = 1
const FADE_DURATION = 0.5

interface AddFloatingTextOptions {
  color?: Color
  pos: Vec2
  text: string
}

export function addFloatingText(options: AddFloatingTextOptions) {
  const shadow = add([
    text(options.text, { size: TEXT_SIZE, align: 'center' }),
    pos(options.pos.x + SHADOW_OFFSET, options.pos.y + SHADOW_OFFSET),
    anchor('center'),
    color(COLOR.BLACK),
    opacity(),
    lifespan(FLOATING_TEXT_DURATION, { fade: FADE_DURATION }),
  ])

  const obj = add([
    text(options.text, { size: TEXT_SIZE, align: 'center' }),
    pos(options.pos),
    anchor('center'),
    color(options.color ?? COLOR.WHITE),
    opacity(),
    lifespan(FLOATING_TEXT_DURATION, { fade: FADE_DURATION }),
  ])

  tween(
    options.pos.y,
    options.pos.y - FLOAT_DISTANCE,
    FLOATING_TEXT_DURATION,
    (y: number) => {
      obj.pos.y = y
      shadow.pos.y = y + SHADOW_OFFSET
    },
    easings.easeOutCubic,
  )
}
