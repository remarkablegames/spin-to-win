import { COLOR } from '../constants'

const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 50
const HORIZONTAL_PADDING = 24
const SHADOW_OFFSET = 4

const OFFSCREEN = -99999

export type Button = ReturnType<typeof addButton>

export function addButton(
  label: string,
  x: number,
  y: number,
  onClick: () => void,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  buttonColor = COLOR.GREEN,
  shadowColor = COLOR.DARK_GREEN,
) {
  function calcWidth(value: string) {
    return Math.max(
      width,
      formatText({ size: 24, text: value }).width + HORIZONTAL_PADDING * 2,
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
    anchor('center'),
    color(COLOR.WHITE),
  ])

  let enabled = true
  let hovered = false

  function updateOpacity() {
    button.opacity = enabled ? 1 : 0.5
    shadow.opacity = enabled ? 1 : 0.5
  }

  button.onClick(() => {
    if (enabled) {
      onClick()
    }
  })

  button.onHover(() => {
    hovered = true

    if (!enabled) {
      setCursor('not-allowed')
      return
    }

    setCursor('pointer')
    button.scale = vec2(1.1)
    shadow.scale = vec2(1.1)
  })

  button.onHoverEnd(() => {
    hovered = false

    if (!enabled) {
      setCursor('default')
      return
    }

    setCursor('default')
    button.scale = vec2(1)
    shadow.scale = vec2(1)
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
        button.scale = vec2(1)
        shadow.scale = vec2(1)
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
