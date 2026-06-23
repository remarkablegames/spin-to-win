import type { Anchor, GameObj, PosComp, Vec2 } from 'kaplay'

import { COLOR } from '../constants'

const PADDING_X = 12
const PADDING_Y = 8
const TEXT_SIZE = 20
const OFFSCREEN = -99999

export interface Tooltip {
  destroy(): void
  hide(): void
  setTarget(target: GameObj<PosComp> | Vec2): void
  setText(text: string): void
  show(text?: string): void
}

interface AddTooltipOptions {
  anchor?: Anchor
  offset?: Vec2
  target?: GameObj<PosComp> | Vec2
  text?: string
}

export function addTooltip(options: AddTooltipOptions = {}): Tooltip {
  const backgroundAnchor = options.anchor ?? 'bot'
  let currentText = options.text ?? ''
  let currentTarget = options.target
  let isVisible = false

  const background = add([
    rect(1, 1, { radius: 4 }),
    pos(OFFSCREEN, OFFSCREEN),
    anchor(backgroundAnchor),
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
    label.pos = getLabelOffset(backgroundAnchor)
  }

  function getLabelOffset(anchor: Anchor) {
    switch (anchor) {
      case 'top':
        return vec2(0, background.height / 2)

      case 'bot':
        return vec2(0, -background.height / 2)

      case 'left':
        return vec2(background.width / 2, 0)

      case 'right':
        return vec2(-background.width / 2, 0)

      case 'topleft':
        return vec2(background.width / 2, background.height / 2)

      case 'topright':
        return vec2(-background.width / 2, background.height / 2)

      case 'botleft':
        return vec2(background.width / 2, -background.height / 2)

      case 'botright':
        return vec2(-background.width / 2, -background.height / 2)

      case 'center':
      default:
        return vec2()
    }
  }

  function getTargetPosition() {
    if (!currentTarget) {
      return vec2(width() / 2, height() / 2)
    }

    if ('pos' in currentTarget) {
      if (
        'worldPos' in currentTarget &&
        typeof currentTarget.worldPos === 'function'
      ) {
        return currentTarget.worldPos() ?? currentTarget.pos
      }
      return currentTarget.pos
    }

    return currentTarget
  }

  function updatePosition() {
    const targetPos = getTargetPosition()
    const offset = options.offset ?? getDefaultOffset(backgroundAnchor)

    background.pos = targetPos.add(offset)
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

const OFFSET = 24

function getDefaultOffset(anchor: Anchor) {
  switch (anchor) {
    case 'top':
      return vec2(0, OFFSET)

    case 'bot':
      return vec2(0, -OFFSET)

    case 'left':
      return vec2(-OFFSET, 0)

    case 'right':
      return vec2(OFFSET, 0)

    case 'topleft':
      return vec2(-OFFSET, OFFSET)

    case 'topright':
      return vec2(OFFSET)

    case 'botleft':
      return vec2(-OFFSET)

    case 'botright':
      return vec2(OFFSET, -OFFSET)

    case 'center':
    default:
      return vec2(0, -OFFSET)
  }
}
