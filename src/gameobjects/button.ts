import type { Anchor, Color } from 'kaplay'

import { COLOR, SOUND } from '../constants'
import { getSpriteById, playSound } from '../utils'
import { addTooltip } from './tooltip'

const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 50
const HORIZONTAL_PADDING = 24
const SHADOW_OFFSET = 4

const OFFSCREEN = -99999

export type Button = ReturnType<typeof addButton>

interface AddButtonOptions {
  buttonColor?: Color
  height?: number
  icon?: string
  label: string
  onClick: () => void
  shadowColor?: Color
  tooltip?: string
  tooltipAnchor?: Anchor
  width?: number
  x: number
  y: number
}

export function addButton({
  label,
  x,
  y,
  onClick,
  tooltip,
  tooltipAnchor,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  icon,
  buttonColor = COLOR.GREEN,
  shadowColor = COLOR.DARK_GREEN,
}: AddButtonOptions) {
  const ICON_SIZE = 24
  const iconWidth = icon ? ICON_SIZE + HORIZONTAL_PADDING / 2 : 0

  function calcWidth(value: string) {
    return Math.max(
      width,
      formatText({ size: 24, text: value }).width +
        HORIZONTAL_PADDING * 2 +
        iconWidth,
    )
  }

  const container = add([pos(x, y)])

  const shadow = container.add([
    rect(calcWidth(label), height),
    pos(SHADOW_OFFSET, SHADOW_OFFSET),
    anchor('center'),
    color(shadowColor),
    scale(),
    opacity(),
  ])

  const button = container.add([
    rect(calcWidth(label), height),
    pos(),
    anchor('center'),
    color(buttonColor),
    area(),
    scale(),
    opacity(),
  ])

  const buttonLabel = button.add([
    text(label, { size: 24 }),
    pos(iconWidth / 2, 0),
    anchor('center'),
    color(COLOR.WHITE),
  ])

  if (icon) {
    const spriteData = getSpriteById(icon)
    const iconHeight = ICON_SIZE
    const renderedIconWidth = Math.round(
      (spriteData.width / spriteData.height) * iconHeight,
    )
    button.add([
      sprite(icon, { width: renderedIconWidth, height: iconHeight }),
      pos(
        -button.width / 2 + renderedIconWidth / 2 + HORIZONTAL_PADDING / 2,
        0,
      ),
      anchor('center'),
      color(COLOR.WHITE),
    ])
  }

  let enabled = true
  let hovered = false

  const buttonTooltip =
    tooltip != null
      ? addTooltip({
          anchor: tooltipAnchor,
          target: container,
          text: tooltip,
        })
      : null

  function updateOpacity() {
    button.opacity = enabled ? 1 : 0.5
    shadow.opacity = enabled ? 1 : 0.5
  }

  function setButtonScale(value: number) {
    button.scale = vec2(value)
    shadow.scale = vec2(value)
  }

  button.onClick(() => {
    if (enabled) {
      playSound(SOUND.BUTTON_CLICK.id)
      onClick()
    } else {
      playSound(SOUND.INVALID_ACTION.id)
    }
  })

  button.onHover(() => {
    hovered = true

    if (!enabled) {
      setCursor('not-allowed')
      return
    }

    setCursor('pointer')
    playSound(SOUND.BUTTON_HOVER.id)
    setButtonScale(1.1)
    buttonTooltip?.show()
  })

  button.onHoverEnd(() => {
    hovered = false
    buttonTooltip?.hide()

    if (!enabled) {
      setCursor('default')
      return
    }

    setCursor('default')
    setButtonScale(1)
  })

  return {
    destroy() {
      container.destroy()
    },
    disable() {
      enabled = false
      updateOpacity()

      if (hovered) {
        setCursor('not-allowed')
        setButtonScale(1)
        buttonTooltip?.hide()
      }
    },
    enable() {
      enabled = true
      updateOpacity()
    },
    setLabel(value: string) {
      buttonLabel.text = value
      const newWidth = calcWidth(value)
      button.width = newWidth
      shadow.width = newWidth
    },
    setTooltip(value: string) {
      buttonTooltip?.setText(value)
    },
    hide() {
      container.hidden = true
      container.pos = vec2(OFFSCREEN)
    },
    show() {
      container.hidden = false
      container.pos = vec2(x, y)
      updateOpacity()
    },
  }
}
