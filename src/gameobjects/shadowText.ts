import type { Anchor, Color, TextAlign } from 'kaplay'

import { COLOR } from '../constants'

const SHADOW_OFFSET = 2
const SHADOW_OPACITY = 0.5

interface AddShadowTextOptions {
  align?: TextAlign
  anchor?: Anchor
  color?: Color
  pos: { x: number; y: number }
  shadowColor?: Color
  shadowOpacity?: number
  size?: number
  text: string
}

export function addShadowText(options: AddShadowTextOptions) {
  const shadow = add([
    text(options.text, { align: options.align, size: options.size }),
    pos(options.pos.x + SHADOW_OFFSET, options.pos.y + SHADOW_OFFSET),
    anchor(options.anchor ?? 'center'),
    color(options.shadowColor ?? COLOR.BLACK),
    opacity(options.shadowOpacity ?? SHADOW_OPACITY),
  ])

  const textObj = add([
    text(options.text, { align: options.align, size: options.size }),
    pos(options.pos.x, options.pos.y),
    anchor(options.anchor ?? 'center'),
    color(options.color ?? COLOR.WHITE),
  ])

  return { shadow, text: textObj }
}
