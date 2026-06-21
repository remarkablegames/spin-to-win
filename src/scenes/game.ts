import { ARTIFACT, COLOR, LEVEL, SCENE, SHOP, SPRITE } from '../constants'
import type { ActiveArtifactId } from '../constants/artifacts'
import {
  addArtifactInventory,
  addButton,
  addGrid,
  addHeader,
  addToast,
  addWheel,
} from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import { formatSegmentLabel, getDefaultSegments } from '../gameobjects/wheel'

const WHEEL_OFFSET = 30
const BUTTON_OFFSET = 265
const SKIP_BUTTON_OFFSET = BUTTON_OFFSET + 65

interface GameState {
  activeArtifacts?: ARTIFACT.ActiveArtifactSlot[]
  baseSpins?: number
  extraSpins?: number
  levelIndex?: number
  levelScore?: number
  money?: number
  passiveArtifacts?: ARTIFACT.PassiveArtifactSlot[]
  passiveIncome?: number
  roundIndex?: number
  segments?: WheelSegment[]
  wheelAngle?: number
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
  let activeArtifacts = initialState?.activeArtifacts ?? []
  let passiveArtifacts = initialState?.passiveArtifacts ?? []
  let queuedArtifacts: ActiveArtifactId[] = []
  let blankSegmentIndex: number | null = null
  let isBlankSelecting = false

  const header = addHeader()

  const wheelSegments = initialState?.segments ?? getDefaultSegments()
  const wheel = addWheel({
    segments: wheelSegments,
    angle: initialState?.wheelAngle,
    pos: vec2(center().x, center().y - WHEEL_OFFSET),
  })

  add([
    sprite(SPRITE.POINTER, { width: 28, height: 28 }),
    pos(center().x, center().y - WHEEL_OFFSET - wheel.radius - 14),
    anchor('center'),
    rotate(90),
    color(COLOR.WHITE),
  ])

  const artifactInventory = addArtifactInventory({
    onUse: useArtifact,
  })

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

  function useArtifact(id: ActiveArtifactId) {
    if (spinsRemaining <= 0) {
      return
    }

    const slot = activeArtifacts.find((s) => s.id === id)
    if (!slot || slot.charges <= 0) {
      return
    }

    if (id === 'extendSpin') {
      if (!wheel.isSpinning) {
        return
      }

      wheel.extendSpin()
      activeArtifacts = ARTIFACT.removeActiveArtifact(activeArtifacts, id)
      addToast('Spin Extended')
      artifactInventory.update(activeArtifacts, queuedArtifacts)
      return
    }

    if (id === 'blankNextSegment') {
      if (isSpinning || isBlankSelecting) {
        return
      }

      isBlankSelecting = true
      activeArtifacts = ARTIFACT.removeActiveArtifact(activeArtifacts, id)
      artifactInventory.update(activeArtifacts, queuedArtifacts)
      wheel.setSelectMode((segment, index) => {
        blankSegmentIndex = index
        isBlankSelecting = false
        addToast(`Segment Blanked: ${segment.label}`)
      })
      return
    }

    const queuedCount = queuedArtifacts.filter(
      (queuedId) => queuedId === id,
    ).length
    if (queuedCount >= slot.charges) {
      return
    }

    queuedArtifacts.push(id)
    artifactInventory.update(activeArtifacts, queuedArtifacts)
  }

  function grantRandomArtifact() {
    const artifactId = ARTIFACT.getRandomArtifacts(1)[0]
    const artifact = ARTIFACT.getArtifactById(artifactId)
    if (ARTIFACT.isActiveArtifact(artifactId)) {
      const previousLength = activeArtifacts.length
      activeArtifacts = ARTIFACT.addActiveArtifact(activeArtifacts, artifactId)
      if (activeArtifacts.length > previousLength) {
        addToast(`Artifact: ${artifact.name}`)
      } else {
        addToast('Artifact inventory full')
      }
    } else {
      const previousLength = passiveArtifacts.length
      passiveArtifacts = ARTIFACT.addPassiveArtifact(
        passiveArtifacts,
        artifactId,
      )
      if (passiveArtifacts.length > previousLength) {
        addToast(`Artifact: ${artifact.name}`)
      } else {
        addToast(`You already own ${artifact.name}`)
      }
    }

    artifactInventory.update(activeArtifacts, queuedArtifacts)
  }

  function applyArtifactEffects(segment: WheelSegment) {
    let finalScore = segment.score
    let finalMoney = segment.money
    let finalMultiplier = segment.multiplier
    let skipEffect = false

    if (
      blankSegmentIndex !== null &&
      wheel.getWinningSegmentIndex() === blankSegmentIndex
    ) {
      skipEffect = true
    }

    if (
      !skipEffect &&
      queuedArtifacts.includes('skipNextNegative') &&
      (finalScore < 0 || finalMoney < 0)
    ) {
      skipEffect = true
    }

    if (!skipEffect) {
      if (queuedArtifacts.includes('boostNextScore')) {
        finalScore = Math.round(finalScore * 1.5)
      }

      if (queuedArtifacts.includes('boostNextMoney')) {
        finalMoney = Math.round(finalMoney * 1.5)
      }

      if (
        queuedArtifacts.includes('boostNextMultiplier') &&
        finalMultiplier !== undefined
      ) {
        finalMultiplier += 0.25
      }

      if (queuedArtifacts.includes('doubleNextSegment')) {
        finalScore *= 2
        finalMoney *= 2
      }

      if (finalMultiplier !== undefined) {
        levelScore = Math.round(levelScore * finalMultiplier)
      } else {
        levelScore += finalScore
      }

      money += finalMoney
      moneyDelta += finalMoney
    }

    if (segment.artifact) {
      grantRandomArtifact()
    }

    if (
      ARTIFACT.hasArtifact(passiveArtifacts, 'scoreGrowth') &&
      segment.score !== 0
    ) {
      const index = wheel.getWinningSegmentIndex()
      if (index >= 0 && index < wheel.segments.length) {
        wheel.segments[index].score += 5
        wheel.segments[index].label = formatSegmentLabel(wheel.segments[index])
      }
    }

    for (const queuedId of queuedArtifacts) {
      activeArtifacts = ARTIFACT.removeActiveArtifact(activeArtifacts, queuedId)
    }

    queuedArtifacts = []
    blankSegmentIndex = null
    artifactInventory.update(activeArtifacts, queuedArtifacts)
  }

  function endRound() {
    money += passiveIncome

    if (ARTIFACT.hasArtifact(passiveArtifacts, 'luckyCoin')) {
      money += spinsRemaining
      moneyDelta += spinsRemaining
    }

    header.setMoney(money, moneyDelta)

    go(SCENE.SHOP, {
      activeArtifacts,
      baseSpins,
      levelIndex,
      levelScore,
      money,
      passiveArtifacts,
      passiveIncome,
      roundIndex,
      segments: wheel.segments,
      wheelAngle: wheel.angle,
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
    artifactInventory.update(activeArtifacts, queuedArtifacts)
    updateSpinButton()

    wheel.spin((segment) => {
      applyArtifactEffects(segment)
      updateUI()
      isSpinning = false
      isBlankSelecting = false

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
      queuedArtifacts = []
      blankSegmentIndex = null
      isBlankSelecting = false
      artifactInventory.update(activeArtifacts, queuedArtifacts)
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
    if (ARTIFACT.hasArtifact(passiveArtifacts, 'extraRoundSpin')) {
      totalSpinsForRound += 2
    }
    spinsRemaining = totalSpinsForRound
    extraSpins = 0
    moneyDelta = passiveIncome
    queuedArtifacts = []
    blankSegmentIndex = null
    isBlankSelecting = false
    artifactInventory.update(activeArtifacts, queuedArtifacts)
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
    activeArtifacts = initialState?.activeArtifacts ?? []
    passiveArtifacts = initialState?.passiveArtifacts ?? []
    if (roundIndex < LEVEL.LEVELS[levelIndex].roundsPerLevel - 1) {
      roundIndex += 1
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
