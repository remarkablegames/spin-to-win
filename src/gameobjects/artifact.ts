import type { GameObj, PosComp, RectComp } from 'kaplay'

import { ARTIFACT, COLOR } from '../constants'
import type { ActiveArtifactId, ArtifactId, ArtifactSlot } from '../types'
import { getArtifactById, getSpriteById } from '../utils'
import { addTooltip } from './tooltip'

const SLOT_SIZE = 64
const SLOT_GAP = 12
const BADGE_SIZE = 20
const PADDING = 10
const BOTTOM_OFFSET = 16
const HOLD_TO_SELL_DURATION = 2
const TOOLTIP_OFFSET_Y = -8

interface ArtifactInventory {
  destroy(): void
  update(artifacts: ArtifactSlot[], queuedArtifacts?: ActiveArtifactId[]): void
}

interface AddArtifactOptions {
  holdToConfirm?: boolean
  onUse: (id: ArtifactId) => void
  x?: number
  y?: number
}

interface SlotDisplay {
  background: GameObj<PosComp>
  tooltip: ReturnType<typeof addTooltip>
}

export function addArtifact(options: AddArtifactOptions): ArtifactInventory {
  const slotCount = ARTIFACT.ARTIFACT_SLOTS
  const totalWidth =
    slotCount * SLOT_SIZE + (slotCount - 1) * SLOT_GAP + PADDING * 2
  const totalHeight = SLOT_SIZE + PADDING * 2
  const x = options.x ?? (width() - totalWidth) / 2 + PADDING
  const y = options.y ?? height() - totalHeight - BOTTOM_OFFSET + PADDING

  const container = add([pos(x, y)])

  container.add([
    rect(totalWidth, totalHeight, { radius: 8 }),
    pos(-PADDING, -PADDING),
    color(COLOR.LIGHT_BROWN),
    z(10),
  ])

  let slotDisplays: SlotDisplay[] = []

  function clearSlots() {
    slotDisplays.forEach((s) => {
      s.tooltip.destroy()
      s.background.destroy()
    })
    slotDisplays = []
  }

  function rebuildSlots(
    artifacts: ArtifactSlot[],
    queuedArtifacts: ActiveArtifactId[],
  ) {
    clearSlots()

    for (let i = 0; i < slotCount; i++) {
      const slotX = i * (SLOT_SIZE + SLOT_GAP)
      const slot = artifacts[i] as ArtifactSlot | undefined
      const isActive = slot?.type === 'active'
      const queuedCount =
        slot?.type === 'active'
          ? queuedArtifacts.filter((id) => id === slot.id).length
          : 0

      const slotColor = isActive && queuedCount > 0 ? COLOR.GOLD : COLOR.WHITE
      const slotOpacity = 0.6

      const bg = container.add([
        rect(SLOT_SIZE, SLOT_SIZE, { radius: 6 }),
        pos(slotX, 0),
        color(slotColor),
        opacity(slotOpacity),
        area(),
        z(11),
      ])

      if (slot) {
        const artifact = getArtifactById(slot.id)
        const spriteData = getSpriteById(artifact.icon)
        bg.add([
          sprite(artifact.icon, {
            width: spriteData.width,
            height: spriteData.height,
          }),
          pos(SLOT_SIZE / 2, SLOT_SIZE / 2),
          anchor('center'),
          z(12),
        ])

        if (slot.type === 'active' && slot.charges > 1) {
          const badge = bg.add([
            rect(BADGE_SIZE, BADGE_SIZE, { radius: 4 }),
            pos(SLOT_SIZE - BADGE_SIZE - 4, 4),
            color(COLOR.BLACK),
            z(13),
          ])
          badge.add([
            text(String(slot.charges), { size: 14 }),
            pos(BADGE_SIZE / 2, BADGE_SIZE / 2),
            anchor('center'),
            color(COLOR.WHITE),
            z(14),
          ])
        }
      }

      const queueHint =
        queuedCount > 0 ? `\nQueued: ${String(queuedCount)}` : ''
      const tooltipText = slot
        ? `${getArtifactById(slot.id).name}${queueHint}\n${getArtifactById(slot.id).description}`
        : 'Empty artifact slot'

      const tooltip = addTooltip({
        anchor: 'bot',
        offset: vec2(0, TOOLTIP_OFFSET_Y),
        target: bg,
        text: tooltipText,
      })

      const slotId = slot?.id ?? null

      let holdProgress: GameObj<RectComp> | null = null
      let holdTimer = 0
      let isHolding = false
      let isHovered = false

      function cancelHold() {
        isHolding = false
        holdTimer = 0
        holdProgress?.destroy()
        holdProgress = null
        tooltip.setText(tooltipText)
      }

      bg.onHover(() => {
        isHovered = true
        if (slotId) {
          setCursor('pointer')
          tooltip.show()
        }
      })
      bg.onHoverEnd(() => {
        isHovered = false
        setCursor('default')
        tooltip.hide()
        cancelHold()
      })

      if (options.holdToConfirm) {
        bg.onMousePress('left', () => {
          if (!slotId || !isHovered) {
            return
          }
          isHolding = true
          holdTimer = 0
          holdProgress = container.add([
            rect(0, SLOT_SIZE, { radius: 6 }),
            pos(slotX, 0),
            color(COLOR.RED),
            opacity(0.4),
            z(15),
          ])
          tooltip.setText('Hold to sell...')
        })
        bg.onMouseRelease('left', () => {
          cancelHold()
        })
        bg.onUpdate(() => {
          if (!isHolding || !slotId) {
            return
          }
          holdTimer += dt()
          const ratio = Math.min(1, holdTimer / HOLD_TO_SELL_DURATION)
          if (holdProgress) {
            holdProgress.width = SLOT_SIZE * ratio
          }
          if (holdTimer >= HOLD_TO_SELL_DURATION) {
            cancelHold()
            options.onUse(slotId)
          }
        })
      } else {
        bg.onClick(() => {
          if (slotId) {
            options.onUse(slotId)
          }
        })
      }

      slotDisplays.push({ background: bg, tooltip })
    }
  }

  function update(
    artifacts: ArtifactSlot[],
    queuedArtifacts: ActiveArtifactId[] = [],
  ) {
    rebuildSlots(artifacts, queuedArtifacts)
  }

  update([])

  return {
    destroy() {
      clearSlots()
      container.destroy()
    },
    update,
  }
}
