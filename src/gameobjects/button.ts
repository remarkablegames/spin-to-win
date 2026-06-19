const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 50
const SHADOW_OFFSET = 4

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
  const shadow = add([
    rect(width, height),
    pos(x + SHADOW_OFFSET, y + SHADOW_OFFSET),
    anchor('center'),
    color(DARK_GREEN),
    scale(),
  ])

  const button = add([
    rect(width, height),
    pos(x, y),
    anchor('center'),
    color(GREEN),
    area(),
    scale(),
  ])

  button.add([
    text(label, { size: 24 }),
    anchor('center'),
    color(255, 255, 255),
  ])

  button.onClick(onClick)

  button.onHover(() => {
    setCursor('pointer')
    button.scale = vec2(1.1)
    shadow.scale = vec2(1.1)
  })

  button.onHoverEnd(() => {
    setCursor('default')
    button.scale = vec2(1)
    shadow.scale = vec2(1)
  })

  return button
}
