import type { Color } from 'kaplay'

import { COLOR } from '../constants'

export interface WheelSegment {
  color: Color
  label: string
  money: number
  score: number
}

interface WheelState {
  isSpinning: boolean
  radius: number
  segments: WheelSegment[]
  addSegment(segment: WheelSegment): void
  reset(): void
  resetSegments(): void
  spin(onComplete: (segment: WheelSegment) => void): void
  upgradeRandomPositiveSegment(amount: number): void
  getWinningSegment(): WheelSegment
}

export type Wheel = ReturnType<typeof addWheel>

export const SEGMENTS: WheelSegment[] = [
  { color: rgb(255, 99, 71), label: '+10', money: 0, score: 10 },
  { color: rgb(128, 128, 128), label: '+25', money: 0, score: 25 },
  { color: rgb(30, 144, 255), label: '+50', money: 0, score: 50 },
  { color: rgb(255, 215, 0), label: '+$5', money: 5, score: 0 },
  { color: rgb(220, 20, 60), label: '-25', money: 0, score: -25 },
  { color: rgb(60, 179, 113), label: '+$1', money: 1, score: 0 },
  { color: rgb(139, 0, 0), label: '-$3', money: -3, score: 0 },
]

export function getDefaultSegments() {
  return SEGMENTS.map((segment) => ({ ...segment }))
}

export function formatSegmentLabel(segment: WheelSegment) {
  if (segment.score !== 0) {
    return `${segment.score >= 0 ? '+' : ''}${String(segment.score)}`
  }
  return `${segment.money >= 0 ? '+' : ''}$${String(segment.money)}`
}

const RADIUS = 250
const SPIN_DURATION = 5
const ROTATIONS_MIN = 2
const ROTATIONS_MAX = 4

export function addWheel(initialSegments?: WheelSegment[]) {
  const wheelSegments = initialSegments ?? getDefaultSegments()

  const wheel = add([
    pos(center()),
    rotate(),
    timer(),
    {
      isSpinning: false,
      radius: RADIUS,
      segments: wheelSegments,
      addSegment(segment) {
        this.segments.push(segment)
      },
      reset() {
        wheel.angle = 0
        this.isSpinning = false
      },
      resetSegments() {
        this.segments = getDefaultSegments()
      },
      spin(onComplete) {
        if (this.isSpinning) {
          return
        }

        this.isSpinning = true

        const fullRotations = randi(ROTATIONS_MIN, ROTATIONS_MAX)
        const extraAngle = rand(0, 360)
        const targetAngle = wheel.angle + fullRotations * 360 + extraAngle

        wheel
          .tween(
            wheel.angle,
            targetAngle,
            SPIN_DURATION,
            (angle) => {
              wheel.angle = angle
            },
            easings.easeOutCubic,
          )
          .then(() => {
            this.isSpinning = false
            onComplete(this.getWinningSegment())
          })
      },
      upgradeRandomPositiveSegment(amount) {
        const positiveSegments = this.segments.filter(
          (segment) => segment.score > 0 || segment.money > 0,
        )

        if (positiveSegments.length === 0) {
          return
        }

        const segment = positiveSegments[randi(0, positiveSegments.length)]
        if (segment.score > 0) {
          segment.score += amount
        } else {
          segment.money += amount
        }
        segment.label = formatSegmentLabel(segment)
      },
      getWinningSegment() {
        const wheelAngle = (wheel.angle * Math.PI) / 180
        const segmentAngle = (Math.PI * 2) / this.segments.length
        let pointerRelative = -Math.PI / 2 - wheelAngle
        pointerRelative = pointerRelative % (Math.PI * 2)

        if (pointerRelative < 0) {
          pointerRelative += Math.PI * 2
        }

        const index = Math.floor(pointerRelative / segmentAngle)
        return this.segments[index]
      },
    } satisfies WheelState,
  ])

  wheel.onDraw(() => {
    const segmentAngle = (Math.PI * 2) / wheel.segments.length

    drawCircle({
      fill: false,
      radius: wheel.radius,
    })

    wheel.segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle

      const arcPoints = [vec2()]
      const arcSteps = 10

      for (let step = 0; step <= arcSteps; step++) {
        const angle = startAngle + (step / arcSteps) * segmentAngle
        arcPoints.push(
          vec2(Math.cos(angle) * wheel.radius, Math.sin(angle) * wheel.radius),
        )
      }

      drawPolygon({
        color: segment.color,
        fill: true,
        pts: arcPoints,
      })

      const midAngle = startAngle + segmentAngle / 2
      const labelRadius = wheel.radius * 0.65

      drawText({
        anchor: 'center',
        color: COLOR.WHITE,
        pos: vec2(
          Math.cos(midAngle) * labelRadius,
          Math.sin(midAngle) * labelRadius,
        ),
        size: 20,
        text: segment.label,
      })
    })

    drawCircle({
      color: COLOR.WHITE,
      radius: 12,
    })
  })

  return wheel
}
