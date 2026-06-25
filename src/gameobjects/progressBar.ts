import type { Color } from 'kaplay'

import { COLOR } from '../constants'

const DEFAULT_HEIGHT = 10
const RADIUS = 4
const OUTLINE = 3

interface AddProgressBarOptions {
  color?: Color
  height?: number
  width: number
  x: number
  y: number
}

export type ProgressBar = ReturnType<typeof addProgressBar>

export function addProgressBar({
  x,
  y,
  width,
  height = DEFAULT_HEIGHT,
  color: fillColor = COLOR.GOLD,
}: AddProgressBarOptions) {
  add([
    rect(width + OUTLINE * 2, height + OUTLINE * 2, {
      radius: RADIUS + OUTLINE,
    }),
    pos(x - width / 2 - OUTLINE, y - OUTLINE),
    anchor('topleft'),
    color(COLOR.BLACK),
    opacity(0.5),
  ])

  add([
    rect(width, height, { radius: RADIUS }),
    pos(x - width / 2, y),
    anchor('topleft'),
    color(COLOR.DARK_BROWN),
  ])

  const fill = add([
    rect(0, height, { radius: RADIUS }),
    pos(x - width / 2, y),
    anchor('topleft'),
    color(fillColor),
  ])

  let currentRatio = 0

  return {
    setRatio(ratio: number) {
      currentRatio = Math.min(1, Math.max(0, ratio))
      fill.width = width * currentRatio
    },
    animateTo(
      ratio: number,
      duration: number,
      onComplete?: () => void,
      onUpdate?: (ratio: number) => void,
    ) {
      const targetRatio = Math.min(1, Math.max(0, ratio))
      const startRatio = currentRatio
      tween(
        startRatio,
        targetRatio,
        duration,
        (value) => {
          currentRatio = value
          fill.width = width * value
          onUpdate?.(value)
        },
        easings.easeOutCubic,
      ).onEnd(() => {
        currentRatio = targetRatio
        fill.width = width * targetRatio
        onComplete?.()
      })
    },
  }
}
