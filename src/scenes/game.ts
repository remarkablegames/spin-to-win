import { COLOR, LEVEL, SCENE, SHOP, SOUND, SPRITE } from '../constants'
import {
  addArtifact,
  addButton,
  addFloatingText,
  addGrid,
  addHeader,
  addMuteButton,
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
  playMusic,
  playRewardSound,
  playSound,
  playWheelTick,
  rechargeArtifacts,
  spendArtifactCharge,
} from '../utils'

const WHEEL_OFFSET = 45
const SPIN_BUTTON_OFFSET = 255
const END_BUTTON_OFFSET = SPIN_BUTTON_OFFSET + 65

type SegmentSnapshot = WheelSegment & { index: number }

interface ResolvedSegmentEffect {
  money: number
  multiplier?: number
  preview: boolean
  score: number
  segmentIndex: number
  skipped: boolean
}

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
        artifacts: initialState.artifacts,
        baseSpins: initialState.baseSpins,
        extraSpins: initialState.extraSpins,
        levelIndex: initialState.levelIndex,
        levelScore: initialState.levelScore,
        money: initialState.money,
        passiveIncome: initialState.passiveIncome,
        segments: initialState.segments,
        wheelAngle: initialState.wheelAngle,
      })
      return
    }
  }

  playMusic()
  addMuteButton()
  addGrid()

  let levelIndex = initialState?.levelIndex ?? 0
  let roundIndex = initialState?.roundIndex ?? 0
  let levelScore = initialState?.levelScore ?? 0
  const carryOver = initialState?.levelScore ?? 0
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
  let temporarySegmentSnapshots: SegmentSnapshot[] = []
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

  function updateArtifactInventoryAfterClick() {
    wait(0, () => {
      artifactInventory.update(artifacts, queuedArtifacts)
    })
  }

  function snapshotSegment(index: number) {
    if (
      temporarySegmentSnapshots.some((snapshot) => snapshot.index === index)
    ) {
      return
    }

    temporarySegmentSnapshots.push({
      ...wheel.segments[index],
      index,
    })
  }

  function restoreTemporarySegments() {
    temporarySegmentSnapshots.forEach(({ index, ...segment }) => {
      if (index >= 0 && index < wheel.segments.length) {
        wheel.segments[index] = segment
      }
    })
    temporarySegmentSnapshots = []
  }

  function resetTemporaryArtifactState() {
    restoreTemporarySegments()
    queuedArtifacts = []
    blankSegmentIndex = null
    isBlankSelecting = false
  }

  function previewBlankSegment(index: number) {
    snapshotSegment(index)
    wheel.segments[index] = {
      blank: true,
      color: COLOR.GREY,
      icon: SPRITE.QUESTION_MARK.id,
      label: '',
      tooltip: 'Blanked for next spin',
    }
  }

  function formatMultiplierLabel(multiplier: number) {
    return `${multiplier >= 1 ? '+' : ''}${String(Math.round((multiplier - 1) * 100))}%`
  }

  function isNegativeSegment(segment: WheelSegment) {
    return (
      (segment.score ?? 0) < 0 ||
      (segment.money ?? 0) < 0 ||
      segment.endRound === true ||
      (segment.multiplier !== undefined && segment.multiplier < 1)
    )
  }

  function previewQueuedArtifactEffects() {
    wheel.segments.forEach((segment, index) => {
      if (index === blankSegmentIndex || segment.blank) {
        return
      }

      if (
        queuedArtifacts.includes('skipNextNegative') &&
        isNegativeSegment(segment)
      ) {
        snapshotSegment(index)
        wheel.segments[index] = {
          ...segment,
          blank: true,
          color: COLOR.GREY,
          icon: SPRITE.QUESTION_MARK.id,
          label: '',
          multiplier: undefined,
          tooltip: 'Skipped by artifact',
        }
        return
      }

      const preview = { ...segment }

      if (
        queuedArtifacts.includes('boostNextScore') &&
        preview.score !== undefined
      ) {
        preview.score = Math.round(preview.score * 1.5)
      }

      if (
        queuedArtifacts.includes('boostNextMoney') &&
        preview.money !== undefined
      ) {
        preview.money = Math.round(preview.money * 1.5)
      }

      if (
        queuedArtifacts.includes('boostNextMultiplier') &&
        preview.multiplier !== undefined
      ) {
        preview.multiplier += 0.25
      }

      if (queuedArtifacts.includes('doubleNextSegment')) {
        if (preview.score !== undefined) {
          preview.score *= 2
        }
        if (preview.money !== undefined) {
          preview.money *= 2
        }
      }

      const changed =
        preview.score !== segment.score ||
        preview.money !== segment.money ||
        preview.multiplier !== segment.multiplier

      if (!changed) {
        return
      }

      snapshotSegment(index)
      wheel.segments[index] = {
        ...preview,
        label:
          preview.multiplier !== undefined
            ? formatMultiplierLabel(preview.multiplier)
            : formatSegmentLabel(preview),
      }
    })
  }

  function rebuildTemporarySegmentPreviews() {
    const currentBlankSegmentIndex = blankSegmentIndex
    restoreTemporarySegments()

    if (currentBlankSegmentIndex !== null) {
      previewBlankSegment(currentBlankSegmentIndex)
    }

    previewQueuedArtifactEffects()
  }

  function previewResolvedSegmentEffect(
    index: number,
    effect: ResolvedSegmentEffect,
  ) {
    if (!effect.preview) {
      return
    }

    const segment = wheel.segments[index]

    snapshotSegment(index)

    if (effect.skipped) {
      wheel.segments[index] = {
        ...segment,
        blank: true,
        color: COLOR.GREY,
        icon: SPRITE.QUESTION_MARK.id,
        label: '',
        money: 0,
        multiplier: undefined,
        score: 0,
        tooltip: 'Skipped by artifact',
      }
      return
    }

    const changed =
      effect.score !== segment.score ||
      effect.money !== segment.money ||
      effect.multiplier !== segment.multiplier

    if (!changed) {
      return
    }

    const effectLabel =
      effect.multiplier !== undefined
        ? formatMultiplierLabel(effect.multiplier)
        : formatSegmentLabel({
            ...segment,
            money: effect.money,
            score: effect.score,
          })

    wheel.segments[index] = {
      ...segment,
      label: effectLabel,
      money: effect.money,
      multiplier: effect.multiplier,
      score: effect.score,
    }
  }

  function restoreTemporarySegmentsAfterResult(
    shouldWait: boolean,
    onComplete: () => void,
  ) {
    if (!shouldWait) {
      onComplete()
      return
    }

    wait(FLOATING_TEXT_DURATION, () => {
      restoreTemporarySegments()
      onComplete()
    })
  }

  function useArtifact(id: ArtifactId) {
    if (!isActiveArtifact(id)) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    if (id === 'blankNextSegment' && isBlankSelecting) {
      isBlankSelecting = false
      wheel.clearMode()
      playSound(SOUND.ARTIFACT.id)
      updateArtifactInventoryAfterClick()
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
      updateArtifactInventoryAfterClick()
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
      updateArtifactInventoryAfterClick()
      return
    }

    if (spinsRemaining <= 0) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    if (id === 'blankNextSegment') {
      if (isSpinning) {
        playSound(SOUND.INVALID_ACTION.id)
        return
      }

      isBlankSelecting = true
      updateArtifactInventoryAfterClick()
      playSound(SOUND.ARTIFACT.id)
      wheel.setSelectMode((segment, index) => {
        artifacts = spendArtifactCharge(artifacts, id)
        blankSegmentIndex = index
        rebuildTemporarySegmentPreviews()
        isBlankSelecting = false
        updateArtifactInventoryAfterClick()
        addToast(`Segment Blanked: ${segment.label}`)
        playSound(SOUND.ARTIFACT.id)
      })
      return
    }

    const queuedCount = queuedArtifacts.filter(
      (queuedId) => queuedId === id,
    ).length
    if (queuedCount > 0) {
      queuedArtifacts = queuedArtifacts.filter((queuedId) => queuedId !== id)
      rebuildTemporarySegmentPreviews()
      playSound(SOUND.ARTIFACT.id)
      updateArtifactInventoryAfterClick()
      return
    }

    if (queuedCount >= slot.charges) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    queuedArtifacts.push(id)
    rebuildTemporarySegmentPreviews()
    playSound(SOUND.ARTIFACT.id)
    updateArtifactInventoryAfterClick()
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

  function applyArtifactEffects(
    segment: WheelSegment,
    segmentIndex: number,
  ): ResolvedSegmentEffect {
    const usedQueuedArtifacts = [...queuedArtifacts]
    let finalScore = segment.score ?? 0
    let finalMoney = segment.money ?? 0
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
      isNegativeSegment(segment)
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

    if (hasArtifact(artifacts, 'scoreGrowth') && segment.score !== undefined) {
      const index = wheel.getWinningSegmentIndex()
      if (index >= 0 && index < wheel.segments.length) {
        wheel.segments[index].score = (wheel.segments[index].score ?? 0) + 5
        wheel.segments[index].label = formatSegmentLabel(wheel.segments[index])
      }
    }

    for (const queuedId of queuedArtifacts) {
      artifacts = spendArtifactCharge(artifacts, queuedId)
    }

    queuedArtifacts = []
    blankSegmentIndex = null
    artifactInventory.update(artifacts, queuedArtifacts)

    return {
      money: finalMoney,
      multiplier: finalMultiplier,
      preview: skipEffect || usedQueuedArtifacts.length > 0,
      score: finalScore,
      segmentIndex,
      skipped: skipEffect,
    }
  }

  function endRound() {
    money += passiveIncome

    if (hasArtifact(artifacts, 'luckyCoin')) {
      money += spinsRemaining
      moneyDelta += spinsRemaining
    }

    if (hasArtifact(artifacts, 'segmentCollector')) {
      const segmentBonus = wheel.segments.length * 2
      levelScore += segmentBonus
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
      artifacts,
      baseSpins,
      extraSpins,
      levelIndex,
      levelScore,
      money,
      passiveIncome,
      segments: wheel.segments,
      wheelAngle: wheel.angle,
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

    wheel.spin(() => {
      const segmentIndex = wheel.getWinningSegmentIndex()
      restoreTemporarySegments()

      const segment = wheel.segments[segmentIndex]
      const effect = applyArtifactEffects(segment, segmentIndex)
      previewResolvedSegmentEffect(effect.segmentIndex, effect)
      playRewardSound(segment)
      if (segment.endRound && !effect.skipped) {
        spinsRemaining = 0
      }
      updateUI()
      isSpinning = false
      isBlankSelecting = false

      let showedFloat = false
      if (!effect.skipped && !segment.blank) {
        const wheelPos = vec2(center().x, center().y - WHEEL_OFFSET)
        if (segment.endRound) {
          addFloatingText({
            text: 'End',
            color: COLOR.RED,
            pos: wheelPos,
          })
          showedFloat = true
        } else if (effect.multiplier !== undefined) {
          const pct = Math.round((effect.multiplier - 1) * 100)
          addFloatingText({
            text: pct >= 0 ? `+${String(pct)}%` : `${String(pct)}%`,
            color: pct >= 0 ? COLOR.LIGHT_BLUE : COLOR.PURPLE,
            pos: wheelPos,
          })
          showedFloat = true
        } else if (effect.score !== 0) {
          addFloatingText({
            text:
              effect.score > 0
                ? `+${String(effect.score)}`
                : String(effect.score),
            color: effect.score > 0 ? COLOR.LIGHT_GREEN : COLOR.RED,
            pos: wheelPos,
          })
          showedFloat = true
        } else if (effect.money !== 0) {
          addFloatingText({
            text:
              effect.money > 0
                ? `+$${String(effect.money)}`
                : `-$${String(Math.abs(effect.money))}`,
            color: effect.money > 0 ? COLOR.GREEN : COLOR.RED,
            pos: wheelPos,
          })
          showedFloat = true
        }
      }

      const shouldWaitForResult =
        temporarySegmentSnapshots.length > 0 ||
        (spinsRemaining <= 0 && showedFloat)

      restoreTemporarySegmentsAfterResult(shouldWaitForResult, () => {
        if (spinsRemaining > 0) {
          spinButton.enable()
          skipButton.enable()
          updateSpinButton()
        } else {
          endRound()
        }
      })
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
      resetTemporaryArtifactState()
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
    resetTemporaryArtifactState()
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
    levelScore = initialState?.levelScore ?? carryOver
    if (!initialState?.segments) {
      wheel.reset()
    }
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
