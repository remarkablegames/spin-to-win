import type { GameObj, PosComp } from 'kaplay'

import { ARTIFACT, COLOR } from '../constants'
import type {
  ActiveArtifactId,
  ActiveArtifactSlot,
  ArtifactId,
  PassiveArtifactSlot,
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
    passiveArtifacts?: PassiveArtifactSlot[],
    queuedArtifacts?: ActiveArtifactId[],
  ): void
}

interface AddArtifactOptions {
  onUse: (id: ArtifactId) => void
  x?: number
  y?: number
}

interface SlotDisplay {
  background: GameObj<PosComp>
  tooltip: ReturnType<typeof addTooltip>
}

export function addArtifact(options: AddArtifactOptions): ArtifactInventory {
  const totalHeight = SLOT_SIZE + PADDING * 2
  const y = options.y ?? height() - totalHeight - BOTTOM_OFFSET + PADDING

  const container = add([pos(0, y)])

  let background = container.add([
    rect(1, totalHeight, { radius: 8 }),
    pos(0, -PADDING),
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
    activeArtifacts: ActiveArtifactSlot[],
    passiveArtifacts: PassiveArtifactSlot[],
    queuedArtifacts: ActiveArtifactId[],
  ) {
    clearSlots()
    background.destroy()

    const activeCount = ARTIFACT.ACTIVE_ARTIFACT_SLOTS
    const totalSlots = activeCount + passiveArtifacts.length
    const totalWidth =
      Math.max(totalSlots, activeCount) * SLOT_SIZE +
      (Math.max(totalSlots, activeCount) - 1) * SLOT_GAP +
      PADDING * 2
    const x = options.x ?? (width() - totalWidth) / 2 + PADDING

    container.pos.x = x

    background = container.add([
      rect(totalWidth, totalHeight, { radius: 8 }),
      pos(-PADDING, -PADDING),
      color(COLOR.LIGHT_BROWN),
      z(10),
    ])

    for (let i = 0; i < activeCount; i++) {
      const slotX = i * (SLOT_SIZE + SLOT_GAP)
      const activeSlot = activeArtifacts[i] as ActiveArtifactSlot | undefined
      const queuedCount = activeSlot
        ? queuedArtifacts.filter((id) => id === activeSlot.id).length
        : 0

      const bg = container.add([
        rect(SLOT_SIZE, SLOT_SIZE, { radius: 6 }),
        pos(slotX, 0),
        color(
          activeSlot
            ? queuedCount > 0
              ? COLOR.GOLD
              : COLOR.WHITE
            : COLOR.WHITE,
        ),
        opacity(0.6),
        area(),
        z(11),
      ])

      if (activeSlot) {
        const artifact = ARTIFACT.getArtifactById(activeSlot.id)
        bg.add([
          sprite(artifact.icon),
          pos(SLOT_SIZE / 2, SLOT_SIZE / 2),
          anchor('center'),
          scale(ICON_SCALE),
          z(12),
        ])

        if (activeSlot.charges > 1) {
          const badge = bg.add([
            rect(BADGE_SIZE, BADGE_SIZE, { radius: 4 }),
            pos(SLOT_SIZE - BADGE_SIZE - 4, 4),
            color(COLOR.BLACK),
            z(13),
          ])
          badge.add([
            text(String(activeSlot.charges), { size: 14 }),
            pos(BADGE_SIZE / 2, BADGE_SIZE / 2),
            anchor('center'),
            color(COLOR.WHITE),
            z(14),
          ])
        }
      }

      const queueHint =
        queuedCount > 0 ? `\nQueued: ${String(queuedCount)}` : ''
      const tooltipText = activeSlot
        ? `${ARTIFACT.getArtifactById(activeSlot.id).name}${queueHint}\n${ARTIFACT.getArtifactById(activeSlot.id).description}`
        : 'Empty artifact slot'

      const tooltip = addTooltip({
        anchor: 'top',
        target: bg,
        text: tooltipText,
      })

      const slotId = activeSlot?.id ?? null
      bg.onHover(() => {
        if (slotId) {
          setCursor('pointer')
          tooltip.show()
        }
      })
      bg.onHoverEnd(() => {
        setCursor('default')
        tooltip.hide()
      })
      bg.onClick(() => {
        if (slotId) {
          options.onUse(slotId)
        }
      })

      slotDisplays.push({ background: bg, tooltip })
    }

    passiveArtifacts.forEach((passiveSlot, i) => {
      const slotX = (activeCount + i) * (SLOT_SIZE + SLOT_GAP)
      const artifact = ARTIFACT.getArtifactById(passiveSlot.id)

      const bg = container.add([
        rect(SLOT_SIZE, SLOT_SIZE, { radius: 6 }),
        pos(slotX, 0),
        color(COLOR.LIGHT_BROWN),
        opacity(0.8),
        area(),
        z(11),
      ])

      bg.add([
        sprite(artifact.icon),
        pos(SLOT_SIZE / 2, SLOT_SIZE / 2),
        anchor('center'),
        scale(ICON_SCALE),
        z(12),
      ])

      const tooltip = addTooltip({
        anchor: 'top',
        target: bg,
        text: `${artifact.name}\n${artifact.description}`,
      })

      const slotId = passiveSlot.id
      bg.onHover(() => {
        setCursor('pointer')
        tooltip.show()
      })
      bg.onHoverEnd(() => {
        setCursor('default')
        tooltip.hide()
      })
      bg.onClick(() => {
        options.onUse(slotId)
      })

      slotDisplays.push({ background: bg, tooltip })
    })
  }

  function update(
    activeArtifacts: ActiveArtifactSlot[],
    passiveArtifacts: PassiveArtifactSlot[] = [],
    queuedArtifacts: ActiveArtifactId[] = [],
  ) {
    rebuildSlots(activeArtifacts, passiveArtifacts, queuedArtifacts)
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
