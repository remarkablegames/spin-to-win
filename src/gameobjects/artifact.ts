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

    for (let i = 0; i < slotCount; i++) {
      const slotX = i * (SLOT_SIZE + SLOT_GAP)
      const activeSlot = activeArtifacts[i] as ActiveArtifactSlot | undefined
      const passiveSlot = activeSlot
        ? undefined
        : (passiveArtifacts[i - activeArtifacts.length] as
            | PassiveArtifactSlot
            | undefined)
      const queuedCount = activeSlot
        ? queuedArtifacts.filter((id) => id === activeSlot.id).length
        : 0

      const slotColor = activeSlot
        ? queuedCount > 0
          ? COLOR.GOLD
          : COLOR.WHITE
        : passiveSlot
          ? COLOR.LIGHT_BROWN
          : COLOR.WHITE
      const slotOpacity = passiveSlot ? 0.8 : 0.6

      const bg = container.add([
        rect(SLOT_SIZE, SLOT_SIZE, { radius: 6 }),
        pos(slotX, 0),
        color(slotColor),
        opacity(slotOpacity),
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
      } else if (passiveSlot) {
        const artifact = ARTIFACT.getArtifactById(passiveSlot.id)
        bg.add([
          sprite(artifact.icon),
          pos(SLOT_SIZE / 2, SLOT_SIZE / 2),
          anchor('center'),
          scale(ICON_SCALE),
          z(12),
        ])
      }

      const queueHint =
        queuedCount > 0 ? `\nQueued: ${String(queuedCount)}` : ''
      const tooltipText = activeSlot
        ? `${ARTIFACT.getArtifactById(activeSlot.id).name}${queueHint}\n${ARTIFACT.getArtifactById(activeSlot.id).description}`
        : passiveSlot
          ? `${ARTIFACT.getArtifactById(passiveSlot.id).name}\n${ARTIFACT.getArtifactById(passiveSlot.id).description}`
          : 'Empty artifact slot'

      const tooltip = addTooltip({
        anchor: 'top',
        target: bg,
        text: tooltipText,
      })

      const slotId = activeSlot?.id ?? passiveSlot?.id ?? null
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
