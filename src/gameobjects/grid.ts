const GRID_SIZE = 40
const GRID_COLOR = rgb(255, 255, 255)
const GRID_OPACITY = 0.06

export function addGrid() {
  return add([
    {
      draw() {
        for (let x = 0; x <= width(); x += GRID_SIZE) {
          drawLine({
            p1: vec2(x, 0),
            p2: vec2(x, height()),
            width: 1,
            color: GRID_COLOR,
            opacity: GRID_OPACITY,
          })
        }
        for (let y = 0; y <= height(); y += GRID_SIZE) {
          drawLine({
            p1: vec2(0, y),
            p2: vec2(width(), y),
            width: 1,
            color: GRID_COLOR,
            opacity: GRID_OPACITY,
          })
        }
      },
    },
  ])
}
