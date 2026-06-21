import type {
  Color,
  GameObj,
  PosComp,
  RotateComp,
  TimerComp,
  TweenController,
  Vec2,
} from 'kaplay'

import { COLOR, SPRITE } from '../constants'
import { addTooltip } from './tooltip'

export interface WheelSegment {
  artifact?: boolean
  blank?: boolean
  color: Color
  icon: { sprite: string; width: number; height: number }
  label: string
  money: number
  multiplier?: number
  score: number
  tooltip: string
}

type UpgradeType = 'score' | 'money'

type WheelMode =
  | { type: 'none' }
  | {
      type: 'upgrade'
      upgradeType: UpgradeType
      amount: number
      onSelect: (segment: WheelSegment) => void
    }
  | { type: 'fill'; onSelect: (segment: WheelSegment) => void }
  | { type: 'delete'; onSelect: (segment: WheelSegment) => void }
  | {
      type: 'select'
      onSelect: (segment: WheelSegment, index: number) => void
    }

interface WheelState {
  isSpinning: boolean
  radius: number
  segments: WheelSegment[]
  addSegment(segment: WheelSegment): void
  extendSpin(): void
  reset(): void
  resetSegments(): void
  spin(onComplete: (segment: WheelSegment) => void): void
  getWinningSegment(): WheelSegment
  getWinningSegmentIndex(): number
  setUpgradeMode(
    upgradeType: UpgradeType,
    amount: number,
    onSelect: (segment: WheelSegment) => void,
  ): void
  setFillMode(onSelect: (segment: WheelSegment) => void): void
  setDeleteMode(onSelect: (segment: WheelSegment) => void): void
  setSelectMode(onSelect: (segment: WheelSegment, index: number) => void): void
  clearMode(): void
}

export type Wheel = ReturnType<typeof addWheel>

export const SEGMENTS: WheelSegment[] = [
  {
    color: rgb(255, 99, 71),
    icon: { sprite: SPRITE.HEART, width: 30, height: 26 },
    label: '+10',
    money: 0,
    score: 10,
    tooltip: 'Score 10 points',
  },
  {
    color: rgb(128, 128, 128),
    icon: { sprite: SPRITE.GRAPE, width: 30, height: 43 },
    label: '+25',
    money: 0,
    score: 25,
    tooltip: 'Score 25 points',
  },
  {
    color: rgb(30, 144, 255),
    icon: { sprite: SPRITE.STAR, width: 30, height: 30 },
    label: '+50',
    money: 0,
    score: 50,
    tooltip: 'Score 50 points',
  },
  {
    color: rgb(255, 215, 0),
    icon: { sprite: SPRITE.COIN, width: 28, height: 28 },
    label: '+$5',
    money: 5,
    score: 0,
    tooltip: 'Earn $5',
  },
  {
    color: rgb(220, 20, 60),
    icon: { sprite: SPRITE.SKULLER, width: 28, height: 30 },
    label: '-25',
    money: 0,
    score: -25,
    tooltip: 'Lose 25 points',
  },
  {
    color: rgb(60, 179, 113),
    icon: { sprite: SPRITE.COIN, width: 24, height: 24 },
    label: '+$1',
    money: 1,
    score: 0,
    tooltip: 'Earn $1',
  },
  {
    color: rgb(139, 0, 0),
    icon: { sprite: SPRITE.MONEY_BAG, width: 35, height: 35 },
    label: '-$3',
    money: -3,
    score: 0,
    tooltip: 'Pay $3',
  },
]

export function getDefaultSegments() {
  return SEGMENTS.map((segment) => ({ ...segment }))
}

export function formatSegmentLabel(segment: WheelSegment) {
  if (typeof segment.multiplier === 'number') {
    return segment.label
  }

  if (segment.score !== 0) {
    return `${segment.score >= 0 ? '+' : ''}${String(segment.score)}`
  }

  if (segment.money !== 0) {
    return `${segment.money >= 0 ? '+' : ''}$${String(segment.money)}`
  }

  return ''
}

const RADIUS = 250
const SPIN_DURATION = 5
const ROTATIONS_MIN = 2
const ROTATIONS_MAX = 4

interface WheelOptions {
  angle?: number
  pos?: Vec2
  segments?: WheelSegment[]
}

export function addWheel(options: WheelOptions = {}) {
  const wheelSegments = options.segments ?? getDefaultSegments()

  let isSpinning = false
  let currentMode: WheelMode = { type: 'none' }
  let spinTween: TweenController | null = null
  let spinOnComplete: ((segment: WheelSegment) => void) | null = null
  let spinTarget = 0

  const wheel: GameObj<PosComp & RotateComp & TimerComp & WheelState> = add([
    pos(options.pos ?? center()),
    rotate(options.angle),
    timer(),
    {
      isSpinning: false,
      radius: RADIUS,
      segments: wheelSegments,
      addSegment(segment: WheelSegment) {
        this.segments.push(segment)
      },
      reset() {
        wheel.angle = 0
        isSpinning = false
        this.isSpinning = false
      },
      resetSegments() {
        this.segments = getDefaultSegments()
      },
      spin(onComplete: (segment: WheelSegment) => void) {
        if (isSpinning) {
          return
        }

        isSpinning = true
        this.isSpinning = true
        spinOnComplete = onComplete

        const fullRotations = randi(ROTATIONS_MIN, ROTATIONS_MAX)
        const extraAngle = rand(0, 360)
        spinTarget = wheel.angle + fullRotations * 360 + extraAngle
        startSpinTween(wheel.angle, spinTarget, SPIN_DURATION)
      },
      extendSpin() {
        if (!isSpinning) {
          return
        }

        spinTween?.cancel()

        const segmentAngle = (Math.PI * 2) / this.segments.length
        spinTarget += (segmentAngle * 180) / Math.PI
        startSpinTween(wheel.angle, spinTarget, SPIN_DURATION / 2)
      },
      getWinningSegment() {
        return this.segments[this.getWinningSegmentIndex()]
      },
      getWinningSegmentIndex() {
        const wheelAngle = (wheel.angle * Math.PI) / 180
        const segmentAngle = (Math.PI * 2) / this.segments.length
        let pointerRelative = -Math.PI / 2 - wheelAngle
        pointerRelative = pointerRelative % (Math.PI * 2)

        if (pointerRelative < 0) {
          pointerRelative += Math.PI * 2
        }

        return Math.floor(pointerRelative / segmentAngle)
      },
      setUpgradeMode(
        upgradeType: UpgradeType,
        amount: number,
        onSelect: (segment: WheelSegment) => void,
      ) {
        currentMode = { type: 'upgrade', upgradeType, amount, onSelect }
      },
      setFillMode(onSelect: (segment: WheelSegment) => void) {
        currentMode = { type: 'fill', onSelect }
      },
      setDeleteMode(onSelect: (segment: WheelSegment) => void) {
        currentMode = { type: 'delete', onSelect }
      },
      setSelectMode(onSelect: (segment: WheelSegment, index: number) => void) {
        currentMode = { type: 'select', onSelect }
      },
      clearMode() {
        currentMode = { type: 'none' }
      },
    } satisfies WheelState,
  ])

  function startSpinTween(from: number, to: number, duration: number) {
    const tween = wheel.tween(
      from,
      to,
      duration,
      (angle: number) => {
        wheel.angle = angle
      },
      easings.easeOutCubic,
    )

    spinTween = tween
    tween.then(() => {
      isSpinning = false
      wheel.isSpinning = false
      if (spinOnComplete) spinOnComplete(wheel.getWinningSegment())
    })
  }

  const wheelTooltip = addTooltip()

  function getSegmentAtMouse(mouse: ReturnType<typeof mousePos>) {
    const relative = mouse.sub(wheel.pos)
    const distance = Math.sqrt(relative.x ** 2 + relative.y ** 2)
    if (distance > wheel.radius) {
      return null
    }

    const wheelAngle = (wheel.angle * Math.PI) / 180
    const segmentAngle = (Math.PI * 2) / wheel.segments.length
    let mouseAngle = Math.atan2(relative.y, relative.x) - wheelAngle
    mouseAngle = mouseAngle % (Math.PI * 2)
    if (mouseAngle < 0) {
      mouseAngle += Math.PI * 2
    }

    const index = Math.floor(mouseAngle / segmentAngle)
    return { segment: wheel.segments[index], index }
  }

  function isValidModeTarget(segment: WheelSegment, mode: WheelMode): boolean {
    switch (mode.type) {
      case 'upgrade':
        return mode.upgradeType === 'score'
          ? segment.score !== 0
          : segment.money !== 0
      case 'fill':
        return segment.blank === true
      case 'delete':
        return true
      case 'select':
        return true
      default:
        return false
    }
  }

  function getUpgradeTooltip(segment: WheelSegment, mode: WheelMode): string {
    switch (mode.type) {
      case 'upgrade':
        return mode.upgradeType === 'score'
          ? `${String(segment.score)} \u2192 ${String(segment.score + mode.amount)} \u00b7 click to upgrade`
          : `$${String(segment.money)} \u2192 $${String(segment.money + mode.amount)} \u00b7 click to upgrade`
      case 'fill':
        return 'Click to fill this blank segment'
      case 'delete':
        return 'Click to delete this segment'
      case 'select':
        return 'Click to select this segment'
      default:
        return segment.tooltip
    }
  }

  wheel.onUpdate(() => {
    if (isSpinning) {
      wheelTooltip.hide()
      return
    }

    const mouse = mousePos()
    const hit = getSegmentAtMouse(mouse)

    if (!hit) {
      wheelTooltip.hide()
      if (currentMode.type !== 'none') {
        setCursor('default')
      }
      return
    }

    const { segment } = hit

    if (currentMode.type !== 'none') {
      const valid = isValidModeTarget(segment, currentMode)
      setCursor(valid ? 'pointer' : 'default')
      wheelTooltip.setTarget(mouse)
      wheelTooltip.show(getUpgradeTooltip(segment, currentMode))
    } else {
      wheelTooltip.setTarget(mouse)
      wheelTooltip.show(segment.tooltip)
    }
  })

  onMousePress(() => {
    if (isSpinning || currentMode.type === 'none') {
      return
    }

    const mouse = mousePos()
    const hit = getSegmentAtMouse(mouse)
    if (!hit) {
      return
    }

    const { segment } = hit
    if (!isValidModeTarget(segment, currentMode)) {
      return
    }

    const mode = currentMode
    currentMode = { type: 'none' }
    setCursor('default')
    wheelTooltip.hide()

    if (mode.type === 'select') {
      mode.onSelect(segment, hit.index)
      return
    }

    if (mode.type === 'upgrade') {
      if (mode.upgradeType === 'score') {
        segment.score += mode.amount
      } else {
        segment.money += mode.amount
      }
      segment.label = formatSegmentLabel(segment)
    }
    mode.onSelect(segment)
  })

  wheel.onDraw(() => {
    const segmentAngle = (Math.PI * 2) / wheel.segments.length

    drawCircle({
      outline: { color: COLOR.BLACK, width: 5 },
      radius: wheel.radius,
    })

    const mouse = isSpinning ? null : mousePos()
    const hovered = mouse ? getSegmentAtMouse(mouse) : null

    wheel.segments.forEach((segment: WheelSegment, index: number) => {
      const startAngle = index * segmentAngle

      const arcPoints = [vec2()]
      const arcSteps = 10

      for (let step = 0; step <= arcSteps; step++) {
        const angle = startAngle + (step / arcSteps) * segmentAngle
        arcPoints.push(
          vec2(Math.cos(angle) * wheel.radius, Math.sin(angle) * wheel.radius),
        )
      }

      const isHoveredValid =
        hovered?.index === index &&
        currentMode.type !== 'none' &&
        isValidModeTarget(segment, currentMode)

      const drawColor = isHoveredValid ? COLOR.GOLD : segment.color

      drawPolygon({
        color: drawColor,
        fill: true,
        pts: arcPoints,
      })

      const midAngle = startAngle + segmentAngle / 2
      const labelRadius = wheel.radius * 0.65
      const labelPos = vec2(
        Math.cos(midAngle) * labelRadius,
        Math.sin(midAngle) * labelRadius,
      )

      const textWidth = formatText({ size: 20, text: segment.label }).width
      const halfOffset = textWidth / 2

      drawSprite({
        anchor: 'center',
        pos: vec2(labelPos.x - halfOffset, labelPos.y),
        sprite: segment.icon.sprite,
        width: segment.icon.width,
        height: segment.icon.height,
      })

      const textPos = vec2(labelPos.x + halfOffset, labelPos.y)
      const textOpts = {
        anchor: 'center' as const,
        size: 20,
        text: segment.label,
      }
      const outlineOffset = 2

      for (const [ox, oy] of [
        [-outlineOffset, -outlineOffset],
        [outlineOffset, -outlineOffset],
        [-outlineOffset, outlineOffset],
        [outlineOffset, outlineOffset],
        [-outlineOffset, 0],
        [outlineOffset, 0],
        [0, -outlineOffset],
        [0, outlineOffset],
      ]) {
        drawText({
          ...textOpts,
          color: COLOR.BLACK,
          pos: vec2(textPos.x + ox, textPos.y + oy),
        })
      }

      drawText({
        ...textOpts,
        color: COLOR.WHITE,
        pos: textPos,
      })
    })

    wheel.segments.forEach((_: WheelSegment, index: number) => {
      const angle = index * segmentAngle
      drawLine({
        p1: vec2(),
        p2: vec2(
          Math.cos(angle) * wheel.radius,
          Math.sin(angle) * wheel.radius,
        ),
        width: 2,
        color: COLOR.BLACK,
      })
    })

    drawCircle({
      color: COLOR.WHITE,
      outline: { color: COLOR.BLACK, width: 3 },
      radius: 12,
    })
  })

  return wheel
}
