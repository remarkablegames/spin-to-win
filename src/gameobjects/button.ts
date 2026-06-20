const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 50
const HORIZONTAL_PADDING = 24
const SHADOW_OFFSET = 4

const OFFSCREEN = -99999

const GREEN = rgb(50, 150, 50)
const DARK_GREEN = rgb(30, 90, 30)

export type Button = ReturnType<typeof addButton>

export function addButton(
  label: string,
  x: number,
  y: number,
  onClick: () => void,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
) {
  const textWidth = formatText({ size: 24, text: label }).width
  const buttonWidth = Math.max(width, textWidth + HORIZONTAL_PADDING * 2)

  const shadow = add([
    rect(buttonWidth, height),
    pos(x + SHADOW_OFFSET, y + SHADOW_OFFSET),
    anchor('center'),
    color(DARK_GREEN),
    scale(),
    opacity(),
  ])

  const button = add([
    rect(buttonWidth, height),
    pos(x, y),
    anchor('center'),
    color(GREEN),
    area(),
    scale(),
    opacity(),
  ])

  button.add([
    text(label, { size: 24 }),
    anchor('center'),
    color(255, 255, 255),
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
      button.destroy()
      shadow.destroy()
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
    hide() {
      button.hidden = true
      shadow.hidden = true
      button.pos = vec2(OFFSCREEN)
      shadow.pos = vec2(OFFSCREEN)
    },
    show() {
      button.hidden = false
      shadow.hidden = false
      button.pos = vec2(x, y)
      shadow.pos = vec2(x + SHADOW_OFFSET, y + SHADOW_OFFSET)
      updateOpacity()
    },
  }
}
