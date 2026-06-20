import type { Color } from 'kaplay'

import { TAG } from '../constants'

export interface WheelSegment {
  color: Color
  label: string
  value: number
}

interface WheelState {
  isSpinning: boolean
  radius: number
  segments: WheelSegment[]
  reset(): void
  spin(onComplete: (segment: WheelSegment) => void): void
  getWinningSegment(): WheelSegment
}

export type Wheel = ReturnType<typeof addWheel>

const SEGMENTS: WheelSegment[] = [
  { color: rgb(255, 99, 71), label: '+10', value: 10 },
  { color: rgb(60, 179, 113), label: '+25', value: 25 },
  { color: rgb(30, 144, 255), label: '+50', value: 50 },
  { color: rgb(255, 215, 0), label: '+100', value: 100 },
  { color: rgb(220, 20, 60), label: '-25', value: -25 },
  { color: rgb(128, 128, 128), label: '+0', value: 0 },
]

const RADIUS = 250
const SPIN_DURATION = 5
const ROTATIONS_MIN = 2
const ROTATIONS_MAX = 4

const WHITE = rgb(255, 255, 255)

export function addWheel() {
  const wheel = add([
    pos(center()),
    rotate(0),
    anchor('center'),
    timer(),
    TAG.WHEEL,
    {
      isSpinning: false,
      radius: RADIUS,
      segments: SEGMENTS,
      reset() {
        wheel.angle = 0
        this.isSpinning = false
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
      outline: { color: WHITE, width: 4 },
      radius: wheel.radius,
    })

    wheel.segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle

      const arcPoints = [vec2(0, 0)]
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
        color: WHITE,
        pos: vec2(
          Math.cos(midAngle) * labelRadius,
          Math.sin(midAngle) * labelRadius,
        ),
        size: 20,
        text: segment.label,
      })
    })

    drawCircle({
      color: WHITE,
      radius: 12,
    })
  })

  return wheel
}
