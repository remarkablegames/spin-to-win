import { COLOR, LEVEL, SCENE, SHOP, SOUND, SPRITE } from '../constants'
import {
  addArtifact,
  addButton,
  addFloatingText,
  addGrid,
  addHeader,
  addToast,
  addWheel,
  FLOATING_TEXT_DURATION,
} from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import { formatSegmentLabel, getDefaultSegments } from '../gameobjects/wheel'
import type { ActiveArtifactId, ArtifactId, ArtifactSlot } from '../types'
import {
  addArtifactSlot,
  getArtifactById,
  getRandomArtifacts,
  hasArtifact,
  isActiveArtifact,
  playRewardSound,
  playSound,
  playWheelTick,
  rechargeArtifacts,
  spendArtifactCharge,
} from '../utils'

const WHEEL_OFFSET = 45
const SPIN_BUTTON_OFFSET = 255
const END_BUTTON_OFFSET = SPIN_BUTTON_OFFSET + 65

interface GameState {
  artifacts?: ArtifactSlot[]
  baseSpins?: number
  extraSpins?: number
  levelIndex?: number
  levelScore?: number
  money?: number
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
  let baseSpins = initialState?.baseSpins ?? LEVEL.BASE_SPINS
  let passiveIncome = initialState?.passiveIncome ?? SHOP.BASE_PASSIVE_INCOME
  let spinsRemaining = 0
  let totalSpinsForRound = 0
  let isSpinning = false
  let artifacts: ArtifactSlot[] = initialState?.artifacts ?? []
  let queuedArtifacts: ActiveArtifactId[] = []
  let blankSegmentIndex: number | null = null
  let isBlankSelecting = false

  const header = addHeader()

  const wheelSegments = initialState?.segments ?? getDefaultSegments()
  const wheel = addWheel({
    segments: wheelSegments,
    angle: initialState?.wheelAngle,
    onSpinTick: playWheelTick,
    pos: vec2(center().x, center().y - WHEEL_OFFSET),
  })

  add([
    sprite(SPRITE.POINTER.id, {
      width: SPRITE.POINTER.width,
      height: SPRITE.POINTER.height,
    }),
    pos(center().x, center().y - WHEEL_OFFSET - wheel.radius - 14),
    anchor('center'),
    rotate(90),
    color(COLOR.WHITE),
  ])

  const artifactInventory = addArtifact({
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
    header.setMoney(money, passiveIncome)
    updateSpinButton()
  }

  function useArtifact(id: ArtifactId) {
    if (!isActiveArtifact(id)) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    const slot = artifacts.find(
      (s): s is Extract<ArtifactSlot, { type: 'active' }> =>
        s.type === 'active' && s.id === id,
    )
    if (!slot || slot.charges <= 0) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    if (id === 'extendSpin') {
      if (!wheel.isSpinning) {
        playSound(SOUND.INVALID_ACTION.id)
        return
      }

      wheel.extendSpin()
      artifacts = spendArtifactCharge(artifacts, id)
      addToast('Spin Extended')
      playSound(SOUND.ARTIFACT.id)
      artifactInventory.update(artifacts, queuedArtifacts)
      return
    }

    if (id === 'stopSpin') {
      if (!wheel.isSpinning) {
        playSound(SOUND.INVALID_ACTION.id)
        return
      }

      wheel.stopSpin()
      artifacts = spendArtifactCharge(artifacts, id)
      addToast('Spin Stopped')
      playSound(SOUND.ARTIFACT.id)
      artifactInventory.update(artifacts, queuedArtifacts)
      return
    }

    if (spinsRemaining <= 0) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    if (id === 'blankNextSegment') {
      if (isSpinning || isBlankSelecting) {
        playSound(SOUND.INVALID_ACTION.id)
        return
      }

      isBlankSelecting = true
      artifacts = spendArtifactCharge(artifacts, id)
      artifactInventory.update(artifacts, queuedArtifacts)
      playSound(SOUND.ARTIFACT.id)
      wheel.setSelectMode((segment, index) => {
        blankSegmentIndex = index
        isBlankSelecting = false
        addToast(`Segment Blanked: ${segment.label}`)
        playSound(SOUND.ARTIFACT.id)
      })
      return
    }

    const queuedCount = queuedArtifacts.filter(
      (queuedId) => queuedId === id,
    ).length
    if (queuedCount >= slot.charges) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    queuedArtifacts.push(id)
    playSound(SOUND.ARTIFACT.id)
    artifactInventory.update(artifacts, queuedArtifacts)
  }

  function grantRandomArtifact() {
    const artifactId = getRandomArtifacts(1)[0]
    const artifact = getArtifactById(artifactId)
    const previousLength = artifacts.length
    artifacts = addArtifactSlot(artifacts, artifactId)
    if (artifacts.length > previousLength) {
      addToast(`Artifact: ${artifact.name}`)
      playSound(SOUND.ARTIFACT.id)
    } else {
      addToast(
        isActiveArtifact(artifactId)
          ? 'Artifact inventory full'
          : `You already own ${artifact.name}`,
      )
    }

    artifactInventory.update(artifacts, queuedArtifacts)
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

    if (hasArtifact(artifacts, 'scoreGrowth') && segment.score !== 0) {
      const index = wheel.getWinningSegmentIndex()
      if (index >= 0 && index < wheel.segments.length) {
        wheel.segments[index].score += 5
        wheel.segments[index].label = formatSegmentLabel(wheel.segments[index])
      }
    }

    for (const queuedId of queuedArtifacts) {
      artifacts = spendArtifactCharge(artifacts, queuedId)
    }

    queuedArtifacts = []
    blankSegmentIndex = null
    artifactInventory.update(artifacts, queuedArtifacts)
  }

  function endRound() {
    money += passiveIncome

    if (hasArtifact(artifacts, 'luckyCoin')) {
      money += spinsRemaining
      moneyDelta += spinsRemaining
    }

    header.setMoney(money, moneyDelta)

    go(SCENE.SHOP, {
      artifacts,
      baseSpins,
      levelIndex,
      levelScore,
      money,
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
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    isSpinning = true
    spinsRemaining -= 1
    spinButton.disable()
    skipButton.disable()
    artifactInventory.update(artifacts, queuedArtifacts)
    updateSpinButton()

    wheel.spin((segment) => {
      applyArtifactEffects(segment)
      playRewardSound(segment)
      updateUI()
      isSpinning = false
      isBlankSelecting = false

      let showedFloat = false
      if (!segment.blank) {
        const wheelPos = vec2(center().x, center().y - WHEEL_OFFSET)
        if (segment.multiplier !== undefined) {
          const pct = Math.round((segment.multiplier - 1) * 100)
          addFloatingText({
            text: pct >= 0 ? `+${String(pct)}%` : `${String(pct)}%`,
            color: pct >= 0 ? COLOR.LIGHT_BLUE : COLOR.PURPLE,
            pos: wheelPos,
          })
          showedFloat = true
        } else if (segment.score !== 0) {
          addFloatingText({
            text:
              segment.score > 0
                ? `+${String(segment.score)}`
                : String(segment.score),
            color: segment.score > 0 ? COLOR.LIGHT_GREEN : COLOR.RED,
            pos: wheelPos,
          })
          showedFloat = true
        } else if (segment.money !== 0) {
          addFloatingText({
            text:
              segment.money > 0
                ? `+$${String(segment.money)}`
                : `-$${String(Math.abs(segment.money))}`,
            color: segment.money > 0 ? COLOR.GREEN : COLOR.RED,
            pos: wheelPos,
          })
          showedFloat = true
        }
      }

      if (spinsRemaining > 0) {
        spinButton.enable()
        skipButton.enable()
        updateSpinButton()
      } else if (showedFloat) {
        wait(FLOATING_TEXT_DURATION, endRound)
      } else {
        endRound()
      }
    })
  }

  const spinButton = addButton({
    label: 'Spin',
    x: center().x,
    y: center().y + SPIN_BUTTON_OFFSET,
    onClick: spin,
    tooltip: '1 spin remaining',
    tooltipAnchor: 'bot',
  })

  const skipButton = addButton({
    label: 'End',
    x: center().x,
    y: center().y + END_BUTTON_OFFSET,
    onClick: () => {
      if (isSpinning || spinsRemaining <= 0) {
        playSound(SOUND.INVALID_ACTION.id)
        return
      }

      spinsRemaining = 0
      queuedArtifacts = []
      blankSegmentIndex = null
      isBlankSelecting = false
      artifactInventory.update(artifacts, queuedArtifacts)
      endRound()
    },
    tooltip: 'End the round',
    tooltipAnchor: 'bot',
    buttonColor: COLOR.RED,
    shadowColor: COLOR.DARK_RED,
  })

  function startRound() {
    artifacts = rechargeArtifacts(artifacts)
    totalSpinsForRound = baseSpins + extraSpins
    if (hasArtifact(artifacts, 'extraRoundSpin')) {
      totalSpinsForRound += 2
    }
    spinsRemaining = totalSpinsForRound
    extraSpins = 0
    moneyDelta = 0
    queuedArtifacts = []
    blankSegmentIndex = null
    isBlankSelecting = false
    artifactInventory.update(artifacts, queuedArtifacts)
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
    baseSpins = initialState?.baseSpins ?? LEVEL.BASE_SPINS
    passiveIncome = initialState?.passiveIncome ?? SHOP.BASE_PASSIVE_INCOME
    artifacts = initialState?.artifacts ?? []
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
