import { COLOR, LEVEL, SCENE, SHOP, SPRITE } from '../constants'
import { addButton, addGrid, addHeader, addWheel } from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import { getDefaultSegments } from '../gameobjects/wheel'

const BUTTON_OFFSET = 320
const SKIP_BUTTON_OFFSET = BUTTON_OFFSET + 64

interface GameState {
  baseSpins?: number
  extraSpins?: number
  levelIndex?: number
  levelScore?: number
  money?: number
  passiveIncome?: number
  roundIndex?: number
  segments?: WheelSegment[]
}

scene(SCENE.GAME, (initialState?: GameState) => {
  if (initialState) {
    const level = LEVEL.LEVELS[initialState.levelIndex ?? 0]

    if ((initialState.roundIndex ?? 0) >= level.roundsPerLevel - 1) {
      go(SCENE.END, {
        levelIndex: initialState.levelIndex,
        levelScore: initialState.levelScore,
        money: initialState.money,
      })
      return
    }
  }

  addGrid()

  let levelIndex = initialState?.levelIndex ?? 0
  let roundIndex = initialState?.roundIndex ?? 0
  let levelScore = initialState?.levelScore ?? 0
  const carryOver = 0
  let money = initialState?.money ?? 0
  let moneyDelta = 0
  let extraSpins = initialState?.extraSpins ?? 0
  let baseSpins =
    initialState?.baseSpins ?? LEVEL.LEVELS[levelIndex].baseSpinsPerRound
  let passiveIncome = initialState?.passiveIncome ?? SHOP.BASE_PASSIVE_INCOME
  let spinsRemaining = 0
  let totalSpinsForRound = 0
  let isSpinning = false

  const header = addHeader()

  const wheelSegments = initialState?.segments ?? getDefaultSegments()
  const wheel = addWheel(wheelSegments)

  add([
    sprite(SPRITE.POINTER, { width: 28, height: 28 }),
    pos(center().x, center().y - wheel.radius - 12),
    anchor('center'),
    rotate(90),
    color(COLOR.WHITE),
  ])

  function formatSpinTooltip() {
    return `${String(spinsRemaining)} spin${spinsRemaining === 1 ? '' : 's'} remaining`
  }

  function updateSpinButton() {
    spinButton.setLabel(
      `Spin ${String(spinsRemaining)}/${String(totalSpinsForRound)}`,
    )
    spinButton.setTooltip(formatSpinTooltip())
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
    money += passiveIncome
    header.setMoney(money, moneyDelta)

    go(SCENE.SHOP, {
      baseSpins,
      levelIndex,
      levelScore,
      money,
      passiveIncome,
      roundIndex,
      segments: wheel.segments,
    })
  }

  function endLevel() {
    go(SCENE.END, {
      levelIndex,
      levelScore,
      money,
    })
  }

  function spin() {
    if (isSpinning || spinsRemaining <= 0) {
      return
    }

    isSpinning = true
    spinsRemaining -= 1
    spinButton.disable()
    skipButton.disable()
    updateSpinButton()

    wheel.spin((segment) => {
      if (segment.multiplier !== undefined) {
        levelScore = Math.round(levelScore * segment.multiplier)
      } else {
        levelScore += segment.score
      }
      money += segment.money
      moneyDelta += segment.money
      updateUI()
      isSpinning = false

      if (spinsRemaining > 0) {
        spinButton.enable()
        skipButton.enable()
        updateSpinButton()
      } else {
        endRound()
      }
    })
  }

  const spinButton = addButton({
    label: 'Spin',
    x: center().x,
    y: center().y + BUTTON_OFFSET,
    onClick: spin,
    tooltip: '1 spin remaining',
    tooltipAnchor: 'bot',
  })

  const skipButton = addButton({
    label: 'Skip',
    x: center().x,
    y: center().y + SKIP_BUTTON_OFFSET,
    onClick: () => {
      if (isSpinning || spinsRemaining <= 0) {
        return
      }

      spinsRemaining -= 1
      updateUI()

      if (spinsRemaining > 0) {
        updateSpinButton()
      } else {
        endRound()
      }
    },
    tooltip: 'Skip this turn',
    tooltipAnchor: 'bot',
    buttonColor: COLOR.RED,
    shadowColor: COLOR.DARK_RED,
  })

  function startRound() {
    totalSpinsForRound = baseSpins + LEVEL.BONUS_SPINS + extraSpins
    spinsRemaining = totalSpinsForRound
    extraSpins = 0
    moneyDelta = passiveIncome
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

  function continueFromShop() {
    baseSpins =
      initialState?.baseSpins ?? LEVEL.LEVELS[levelIndex].baseSpinsPerRound
    passiveIncome = initialState?.passiveIncome ?? SHOP.BASE_PASSIVE_INCOME
    if (roundIndex < LEVEL.LEVELS[levelIndex].roundsPerLevel - 1) {
      roundIndex += 1
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
