import { SCENE } from '../constants'
import { addWheel } from '../gameobjects'

const BUTTON_WIDTH = 120
const BUTTON_HEIGHT = 50
const BUTTON_OFFSET = 220

const GREEN = rgb(50, 150, 50)

scene(SCENE.GAME, () => {
  let score = 0

  const scoreLabel = add([
    text(`Score: ${String(score)}`, { size: 24 }),
    pos(12, 12),
  ])

  const wheel = addWheel()

  const spinButton = add([
    rect(BUTTON_WIDTH, BUTTON_HEIGHT),
    pos(center().x, center().y + BUTTON_OFFSET),
    anchor('center'),
    color(GREEN),
    area(),
  ])

  spinButton.add([
    text('Spin', { size: 24 }),
    anchor('center'),
    color(255, 255, 255),
  ])

  function spin() {
    wheel.spin((segment) => {
      score += segment.value
      scoreLabel.text = `Score: ${String(score)}`
    })
  }

  spinButton.onClick(spin)
  onKeyPress('space', spin)
})
