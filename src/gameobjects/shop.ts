import { COLOR } from '../constants'
import type { FillTemplate, PoolUpgrade } from '../constants/shop'
import { addButton } from './button'

const BUTTON_X = () => width() * 0.72
const BUTTON_START_Y = 220
const BUTTON_Y_SPACING = 80
const FILL_TEMPLATE_START_Y = () => height() * 0.35
const FILL_TEMPLATE_X = () => width() * 0.5

export type Shop = ReturnType<typeof addShop>

interface ShopCallbacks {
  onAddSegment: () => void
  onContinue: () => void
  onExtraSpin: () => void
  onPoolUpgrade: (upgrade: PoolUpgrade) => void
}

export function addShop(
  callbacks: ShopCallbacks,
  poolOffers: [PoolUpgrade, PoolUpgrade],
  initialExtraSpinCost: number,
) {
  const x = BUTTON_X()

  const extraSpinButton = addButton({
    label: `Extra Spin ($${String(initialExtraSpinCost)})`,
    x,
    y: BUTTON_START_Y,
    onClick: callbacks.onExtraSpin,
    tooltip: `Spend $${String(initialExtraSpinCost)} to gain an extra spin this round`,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const addSegmentButton = addButton({
    label: 'Add Blank Segment (Free)',
    x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING,
    onClick: callbacks.onAddSegment,
    tooltip: 'Add a blank segment to the wheel (fill it later with an upgrade)',
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const poolButtons = poolOffers.map((offer, i) =>
    addButton({
      label: offer.label,
      x,
      y: BUTTON_START_Y + BUTTON_Y_SPACING * (2 + i),
      onClick: () => {
        callbacks.onPoolUpgrade(offer)
      },
      tooltip: offer.tooltip,
      buttonColor: COLOR.BLUE,
      shadowColor: COLOR.DARK_BLUE,
    }),
  )

  const continueButton = addButton({
    label: 'Continue',
    x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING * (2 + poolOffers.length),
    onClick: callbacks.onContinue,
    tooltip: 'Continue to the next round',
    buttonColor: COLOR.RED,
    shadowColor: COLOR.DARK_RED,
  })

  let fillTemplateButtons: ReturnType<typeof addButton>[] = []

  return {
    updateExtraSpinCost(cost: number) {
      extraSpinButton.setLabel(`Extra Spin ($${String(cost)})`)
      extraSpinButton.setTooltip(
        `Spend $${String(cost)} to gain an extra spin this round`,
      )
    },
    setExtraSpinEnabled(enabled: boolean) {
      if (enabled) {
        extraSpinButton.enable()
      } else {
        extraSpinButton.disable()
      }
    },
    setAddSegmentEnabled(enabled: boolean) {
      if (enabled) {
        addSegmentButton.enable()
      } else {
        addSegmentButton.disable()
      }
    },
    updatePoolOfferLabel(index: 0 | 1, label: string, tooltip: string) {
      poolButtons[index].setLabel(label)
      poolButtons[index].setTooltip(tooltip)
    },
    setPoolOfferEnabled(index: 0 | 1, enabled: boolean) {
      if (enabled) {
        poolButtons[index].enable()
      } else {
        poolButtons[index].disable()
      }
    },
    showFillTemplates(
      templates: FillTemplate[],
      onPick: (template: FillTemplate) => void,
    ) {
      this.hideFillTemplates()
      const startY = FILL_TEMPLATE_START_Y()
      const fx = FILL_TEMPLATE_X()
      fillTemplateButtons = templates.map((template, i) =>
        addButton({
          label: template.label,
          x: fx,
          y: startY + BUTTON_Y_SPACING * i,
          onClick: () => {
            onPick(template)
            this.hideFillTemplates()
          },
          tooltip: template.tooltip,
          buttonColor: COLOR.BLUE,
          shadowColor: COLOR.DARK_BLUE,
        }),
      )
    },
    hideFillTemplates() {
      fillTemplateButtons.forEach((b) => {
        b.destroy()
      })
      fillTemplateButtons = []
    },
    destroy() {
      extraSpinButton.destroy()
      addSegmentButton.destroy()
      poolButtons.forEach((b) => {
        b.destroy()
      })
      continueButton.destroy()
      this.hideFillTemplates()
    },
  }
}

export function drawPoolOffers(
  poolUpgrades: PoolUpgrade[],
): [PoolUpgrade, PoolUpgrade] {
  function pickOne(exclude?: PoolUpgrade): PoolUpgrade {
    const available = exclude
      ? poolUpgrades.filter((u) => u !== exclude)
      : poolUpgrades
    const availableWeight = available.reduce((sum, u) => sum + u.weight, 0)
    let roll = rand(0, availableWeight)
    for (const upgrade of available) {
      roll -= upgrade.weight
      if (roll <= 0) return upgrade
    }
    return available[available.length - 1]
  }

  const first = pickOne()
  const second = pickOne(first)
  return [first, second]
}

export function pickFillTemplates(
  templates: FillTemplate[],
  count: number,
): FillTemplate[] {
  const shuffled = [...templates]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randi(0, i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}
