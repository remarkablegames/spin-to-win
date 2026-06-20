import type { GameObj, PosComp, Vec2 } from 'kaplay'

import { COLOR } from '../constants'

const PADDING_X = 12
const PADDING_Y = 8
const TEXT_SIZE = 18
const OFFSET_Y = 12
const OFFSCREEN = -99999

export interface Tooltip {
  destroy(): void
  hide(): void
  setTarget(target: GameObj<PosComp> | Vec2): void
  setText(text: string): void
  show(text?: string): void
}

interface AddTooltipOptions {
  offset?: Vec2
  position?: 'above' | 'below'
  target?: GameObj<PosComp> | Vec2
  text?: string
}

export function addTooltip(options: AddTooltipOptions = {}): Tooltip {
  let currentText = options.text ?? ''
  let currentTarget = options.target
  let isVisible = false

  const background = add([
    rect(1, 1, { radius: 4 }),
    pos(OFFSCREEN, OFFSCREEN),
    anchor('center'),
    color(COLOR.BLACK),
    opacity(0),
    z(100),
  ])

  const label = background.add([
    text('', { size: TEXT_SIZE }),
    pos(),
    anchor('center'),
    color(COLOR.WHITE),
  ])

  function updateSize() {
    const formatted = formatText({ size: TEXT_SIZE, text: currentText })
    background.width = formatted.width + PADDING_X * 2
    background.height = formatted.height + PADDING_Y * 2
    label.text = currentText
  }

  function getTargetPosition() {
    if (!currentTarget) {
      return vec2(width() / 2, height() / 2)
    }

    if ('pos' in currentTarget) {
      return currentTarget.pos
    }

    return currentTarget
  }

  function updatePosition() {
    const targetPos = getTargetPosition()
    const offset = options.offset ?? vec2(0, -OFFSET_Y)
    const direction = options.position === 'below' ? 1 : -1

    background.pos = vec2(
      targetPos.x + offset.x,
      targetPos.y + offset.y + (background.height / 2 + OFFSET_Y) * direction,
    )
  }

  function show(text?: string) {
    if (text !== undefined) {
      currentText = text
      updateSize()
    }

    isVisible = true
    background.opacity = 1
    updatePosition()
  }

  function hide() {
    isVisible = false
    background.opacity = 0
    background.pos = vec2(OFFSCREEN, OFFSCREEN)
  }

  function setText(text: string) {
    currentText = text
    updateSize()

    if (isVisible) {
      updatePosition()
    }
  }

  function setTarget(target: GameObj<PosComp> | Vec2) {
    currentTarget = target

    if (isVisible) {
      updatePosition()
    }
  }

  function destroy() {
    background.destroy()
  }

  updateSize()

  return {
    destroy,
    hide,
    setTarget,
    setText,
    show,
  }
}
