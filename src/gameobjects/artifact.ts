import type {
  ColorComp,
  GameObj,
  PosComp,
  RectComp,
  ScaleComp,
  SpriteComp,
} from 'kaplay'

import { ARTIFACT, COLOR } from '../constants'
import type {
  ActiveArtifactId,
  ActiveArtifactSlot,
} from '../constants/artifacts'
import { addTooltip } from './tooltip'

const SLOT_SIZE = 64
const SLOT_GAP = 12
const BADGE_SIZE = 20
const PADDING = 10
const BOTTOM_OFFSET = 16
const ICON_SCALE = 0.8

interface ArtifactInventory {
  destroy(): void
  update(
    activeArtifacts: ActiveArtifactSlot[],
    queuedArtifacts?: ActiveArtifactId[],
  ): void
}

interface AddArtifactOptions {
  onUse: (id: ActiveArtifactId) => void
  x?: number
  y?: number
}

export function addArtifact(options: AddArtifactOptions): ArtifactInventory {
  const slotCount = ARTIFACT.ACTIVE_ARTIFACT_SLOTS
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

  interface Slot {
    background: GameObj<RectComp & ColorComp>
    badge: GameObj<PosComp & RectComp & ColorComp> | null
    icon: GameObj<PosComp & SpriteComp & ScaleComp> | null
    id: ActiveArtifactId | null
    tooltip: ReturnType<typeof addTooltip>
  }

  const slots: Slot[] = []

  function updateSlot(
    index: number,
    slot: ActiveArtifactSlot | undefined,
    queuedCount: number,
  ) {
    const slotData = slots[index]
    slotData.id = slot?.id ?? null

    if (slotData.icon) {
      slotData.icon.destroy()
      slotData.icon = null
    }

    if (slotData.badge) {
      slotData.badge.destroy()
      slotData.badge = null
    }

    if (slot) {
      const artifact = ARTIFACT.getArtifactById(slot.id)
      slotData.background.color = queuedCount > 0 ? COLOR.GOLD : COLOR.WHITE
      slotData.icon = slotData.background.add([
        sprite(artifact.icon),
        pos(SLOT_SIZE / 2, SLOT_SIZE / 2),
        anchor('center'),
        scale(ICON_SCALE),
        z(12),
      ])

      if (slot.charges > 1) {
        slotData.badge = slotData.background.add([
          rect(BADGE_SIZE, BADGE_SIZE, { radius: 4 }),
          pos(SLOT_SIZE - BADGE_SIZE - 4, 4),
          color(COLOR.BLACK),
          z(13),
        ])
        slotData.badge.add([
          text(String(slot.charges), { size: 14 }),
          pos(BADGE_SIZE / 2, BADGE_SIZE / 2),
          anchor('center'),
          color(COLOR.WHITE),
          z(14),
        ])
      }

      const queueHint =
        queuedCount > 0 ? `\nQueued: ${String(queuedCount)}` : ''
      slotData.tooltip.setText(
        `${artifact.name}${queueHint}\n${artifact.description}`,
      )
    } else {
      slotData.background.color = COLOR.WHITE
      slotData.tooltip.setText('Empty artifact slot')
    }
  }

  for (let i = 0; i < slotCount; i++) {
    const slotX = i * (SLOT_SIZE + SLOT_GAP)
    const background = container.add([
      rect(SLOT_SIZE, SLOT_SIZE, { radius: 6 }),
      pos(slotX, 0),
      color(COLOR.WHITE),
      opacity(0.6),
      area(),
      z(11),
    ])

    const tooltip = addTooltip({
      anchor: 'top',
      target: background,
      text: 'Empty artifact slot',
    })

    background.onHover(() => {
      const slotData = slots[i]

      if (slotData.id) {
        setCursor('pointer')
        slotData.tooltip.show()
      }
    })

    background.onHoverEnd(() => {
      setCursor('default')
      slots[i].tooltip.hide()
    })

    background.onClick(() => {
      const slotData = slots[i]

      if (slotData.id) {
        options.onUse(slotData.id)
      }
    })

    slots.push({
      background,
      badge: null,
      icon: null,
      id: null,
      tooltip,
    })
  }

  function update(
    activeArtifacts: ActiveArtifactSlot[],
    queuedArtifacts: ActiveArtifactId[] = [],
  ) {
    for (let i = 0; i < slotCount; i++) {
      const slot = activeArtifacts[i] as ActiveArtifactSlot | undefined
      const queuedCount = queuedArtifacts.filter((id) => id === slot?.id).length
      updateSlot(i, slot, queuedCount)
    }
  }

  update([])

  return {
    destroy() {
      container.destroy()
      slots.forEach((slot) => {
        slot.tooltip.destroy()
      })
    },
    update,
  }
}
