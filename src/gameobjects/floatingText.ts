import type { Color, Vec2 } from 'kaplay'

import { COLOR } from '../constants'

const TEXT_SIZE = 32
const FLOAT_DISTANCE = 80
const DURATION = 1
const FADE_DURATION = 0.5

interface AddFloatingTextOptions {
  color?: Color
  pos: Vec2
  text: string
}

export function addFloatingText(options: AddFloatingTextOptions) {
  const obj = add([
    text(options.text, { size: TEXT_SIZE, align: 'center' }),
    pos(options.pos),
    anchor('center'),
    color(options.color ?? COLOR.WHITE),
    opacity(1),
    lifespan(DURATION, { fade: FADE_DURATION }),
    z(200),
  ])

  tween(
    options.pos.y,
    options.pos.y - FLOAT_DISTANCE,
    DURATION,
    (y: number) => {
      obj.pos.y = y
    },
    easings.easeOutCubic,
  )
}
