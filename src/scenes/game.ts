import { SCENE } from '../constants'
import { addButton, addWheel } from '../gameobjects'

const BUTTON_OFFSET = 320

scene(SCENE.GAME, () => {
  let score = 0

  const scoreLabel = add([
    text(`Score: ${String(score)}`, { size: 24 }),
    pos(12, 12),
  ])

  const wheel = addWheel()

  const POINTER_SIZE = 20

  add([
    polygon([
      vec2(0, 0),
      vec2(-POINTER_SIZE / 2, -POINTER_SIZE),
      vec2(POINTER_SIZE / 2, -POINTER_SIZE),
    ]),
    pos(center().x, center().y - wheel.radius - 8),
    anchor('bot'),
    color(255, 255, 255),
  ])

  function spin() {
    wheel.spin((segment) => {
      score += segment.value
      scoreLabel.text = `Score: ${String(score)}`
    })
  }

  addButton('Spin', center().x, center().y + BUTTON_OFFSET, spin)

  onKeyPress('space', spin)
})
