import { LEVEL, SCENE } from '../constants'
import { addButton, addGrid, addWheel } from '../gameobjects'

const BUTTON_OFFSET = 320

const UI_TEXT_SIZE = 20
const UI_LINE_SPACING = 4

scene(SCENE.GAME, () => {
  addGrid()

  let levelIndex = 0
  let roundIndex = 0
  let levelScore = 0
  let carryOver = 0
  let spinsRemaining = 0
  let isSpinning = false
  let continueButton: ReturnType<typeof addButton> | null = null

  const infoLabel = add([
    text('', { lineSpacing: UI_LINE_SPACING, size: UI_TEXT_SIZE }),
    pos(12, 12),
  ])

  const wheel = addWheel()

  const POINTER_SIZE = 20

  add([
    polygon([
      vec2(),
      vec2(-POINTER_SIZE / 2, -POINTER_SIZE),
      vec2(POINTER_SIZE / 2, -POINTER_SIZE),
    ]),
    pos(center().x, center().y - wheel.radius - 8),
    anchor('bot'),
    color(255, 255, 255),
  ])

  function updateUI() {
    const level = LEVEL.LEVELS[levelIndex]
    const totalSpins = level.baseSpinsPerRound + LEVEL.BONUS_SPINS
    const currentSpin = totalSpins - spinsRemaining + 1

    infoLabel.text = [
      `Level ${String(levelIndex + 1)}`,
      `Round ${String(roundIndex + 1)}/${String(level.roundsPerLevel)}`,
      `Spin ${String(currentSpin)}/${String(totalSpins)}`,
      `${String(levelScore)}/${String(level.targetScore)}`,
    ].join('\n')
  }

  function endRound() {
    spinButton.disable()
    spinButton.hide()

    if (roundIndex < LEVEL.LEVELS[levelIndex].roundsPerLevel - 1) {
      continueButton = addButton(
        'Next Round',
        center().x,
        center().y + BUTTON_OFFSET,
        () => {
          continueButton?.destroy()
          continueButton = null
          roundIndex++
          wheel.reset()
          startRound()
        },
      )
    } else {
      endLevel()
    }
  }

  function endLevel() {
    const level = LEVEL.LEVELS[levelIndex]

    if (levelScore >= level.targetScore) {
      carryOver = levelScore - level.targetScore

      if (levelIndex < LEVEL.LEVELS.length - 1) {
        continueButton = addButton(
          'Next Level',
          center().x,
          center().y + BUTTON_OFFSET,
          () => {
            continueButton?.destroy()
            continueButton = null
            startLevel(levelIndex + 1)
          },
        )
      } else {
        continueButton = addButton(
          'Play Again',
          center().x,
          center().y + BUTTON_OFFSET,
          () => {
            continueButton?.destroy()
            continueButton = null
            carryOver = 0
            startLevel(0)
          },
        )
      }
    } else {
      continueButton = addButton(
        'Retry Level',
        center().x,
        center().y + BUTTON_OFFSET,
        () => {
          continueButton?.destroy()
          continueButton = null
          carryOver = 0
          startLevel(levelIndex)
        },
      )
    }
  }

  function spin() {
    if (isSpinning || spinsRemaining <= 0) {
      return
    }

    isSpinning = true
    spinButton.disable()
    wheel.spin((segment) => {
      levelScore += segment.value
      spinsRemaining--
      updateUI()
      isSpinning = false

      if (spinsRemaining > 0) {
        spinButton.enable()
      } else {
        endRound()
      }
    })
  }

  const spinButton = addButton(
    'Spin',
    center().x,
    center().y + BUTTON_OFFSET,
    spin,
  )

  function startRound() {
    const level = LEVEL.LEVELS[levelIndex]
    spinsRemaining = level.baseSpinsPerRound + LEVEL.BONUS_SPINS
    updateUI()
    spinButton.show()
    spinButton.enable()
  }

  function startLevel(index: number) {
    levelIndex = index
    roundIndex = 0
    levelScore = carryOver
    wheel.reset()
    startRound()
  }

  onKeyPress('space', () => {
    spin()
  })

  startLevel(0)
})
