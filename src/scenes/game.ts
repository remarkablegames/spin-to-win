import { COLOR, LEVEL, SCENE, SHOP } from '../constants'
import { addButton, addGrid, addHeader, addWheel } from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import { getDefaultSegments } from '../gameobjects/wheel'

const BUTTON_OFFSET = 320
const SKIP_BUTTON_OFFSET = BUTTON_OFFSET + 64

interface GameState {
  extraSpins?: number
  levelIndex?: number
  levelScore?: number
  money?: number
  roundIndex?: number
  segments?: WheelSegment[]
}

scene(SCENE.GAME, (initialState?: GameState) => {
  addGrid()

  let levelIndex = initialState?.levelIndex ?? 0
  let roundIndex = initialState?.roundIndex ?? 0
  let levelScore = initialState?.levelScore ?? 0
  let carryOver = 0
  let money = initialState?.money ?? 0
  let moneyDelta = 0
  let extraSpins = initialState?.extraSpins ?? 0
  let spinsRemaining = 0
  let totalSpinsForRound = 0
  let isSpinning = false
  let continueButton: ReturnType<typeof addButton> | null = null

  const header = addHeader()

  const wheelSegments = initialState?.segments ?? getDefaultSegments()
  const wheel = addWheel(wheelSegments)

  const POINTER_SIZE = 20

  add([
    polygon([
      vec2(),
      vec2(-POINTER_SIZE / 2, -POINTER_SIZE),
      vec2(POINTER_SIZE / 2, -POINTER_SIZE),
    ]),
    pos(center().x, center().y - wheel.radius - 2),
    anchor('bot'),
    color(COLOR.WHITE),
  ])

  function updateSpinButton() {
    const currentSpin = totalSpinsForRound - spinsRemaining + 1
    spinButton.setLabel(
      `Spin ${String(currentSpin)}/${String(totalSpinsForRound)}`,
    )
  }

  function updateUI() {
    const level = LEVEL.LEVELS[levelIndex]

    header.setLevel(levelIndex + 1)
    header.setRound(roundIndex + 1, level.roundsPerLevel)
    header.setScore(levelScore, level.targetScore)
    header.setMoney(money, moneyDelta)
    updateSpinButton()
  }

  function endRound() {
    spinButton.disable()
    spinButton.hide()
    skipButton.hide()
    money += SHOP.BASE_PASSIVE_INCOME
    header.setMoney(money, moneyDelta)

    go(SCENE.SHOP, {
      levelIndex,
      levelScore,
      money,
      roundIndex,
      segments: wheel.segments,
    })
  }

  function endLevel() {
    const level = LEVEL.LEVELS[levelIndex]

    if (levelScore >= level.targetScore) {
      carryOver = levelScore - level.targetScore

      if (levelIndex < LEVEL.LEVELS.length - 1) {
        continueButton = addButton({
          label: 'Next Level',
          x: center().x,
          y: center().y + BUTTON_OFFSET,
          onClick: () => {
            continueButton?.destroy()
            continueButton = null
            startLevel(levelIndex + 1)
          },
        })
      } else {
        continueButton = addButton({
          label: 'Play Again',
          x: center().x,
          y: center().y + BUTTON_OFFSET,
          onClick: () => {
            continueButton?.destroy()
            continueButton = null
            resetGame()
          },
        })
      }
    } else {
      continueButton = addButton({
        label: 'Retry Level',
        x: center().x,
        y: center().y + BUTTON_OFFSET,
        onClick: () => {
          continueButton?.destroy()
          continueButton = null
          carryOver = 0
          startLevel(levelIndex)
        },
      })
    }
  }

  function spin() {
    if (isSpinning || spinsRemaining <= 0) {
      return
    }

    isSpinning = true
    spinButton.disable()
    skipButton.disable()
    updateSpinButton()

    wheel.spin((segment) => {
      levelScore += segment.score
      money += segment.money
      moneyDelta += segment.money
      spinsRemaining--
      updateUI()
      isSpinning = false

      if (spinsRemaining > 0) {
        spinButton.enable()
        skipButton.enable()
        updateSpinButton()
      } else {
        skipButton.hide()
        endRound()
      }
    })
  }

  const spinButton = addButton({
    label: 'Spin',
    x: center().x,
    y: center().y + BUTTON_OFFSET,
    onClick: spin,
  })

  const skipButton = addButton({
    label: 'Skip',
    x: center().x,
    y: center().y + SKIP_BUTTON_OFFSET,
    onClick: () => {
      if (isSpinning || spinsRemaining <= 0) {
        return
      }

      spinsRemaining--
      updateUI()

      if (spinsRemaining > 0) {
        updateSpinButton()
      } else {
        skipButton.disable()
        skipButton.hide()
        spinButton.disable()
        spinButton.hide()
        endRound()
      }
    },
    buttonColor: COLOR.RED,
    shadowColor: COLOR.DARK_RED,
  })

  function startRound() {
    const level = LEVEL.LEVELS[levelIndex]
    totalSpinsForRound =
      level.baseSpinsPerRound + LEVEL.BONUS_SPINS + extraSpins
    spinsRemaining = totalSpinsForRound
    extraSpins = 0
    moneyDelta = SHOP.BASE_PASSIVE_INCOME
    updateUI()
    spinButton.show()
    spinButton.enable()
    skipButton.show()
    skipButton.enable()
  }

  function startLevel(index: number) {
    levelIndex = index
    roundIndex = 0
    levelScore = carryOver
    wheel.reset()
    startRound()
  }

  function resetGame() {
    carryOver = 0
    money = 0
    extraSpins = 0
    wheel.resetSegments()
    startLevel(0)
  }

  function continueFromShop() {
    if (roundIndex < LEVEL.LEVELS[levelIndex].roundsPerLevel - 1) {
      roundIndex++
      wheel.reset()
      startRound()
    } else {
      endLevel()
    }
  }

  onKeyPress('space', () => {
    spin()
  })

  if (initialState) {
    continueFromShop()
  } else {
    startLevel(0)
  }
})
