import { COLOR, SHOP } from '../constants'
import { addButton } from './button'

const TITLE_Y = 120
const MONEY_Y = 180
const BUTTON_START_Y = 280
const BUTTON_SPACING = 80

export type Shop = ReturnType<typeof addShop>

interface ShopCallbacks {
  onAddSegment: () => void
  onContinue: () => void
  onExtraSpin: () => void
  onUpgradeWheel: () => void
}

export function addShop(money: number, callbacks: ShopCallbacks) {
  add([rect(width(), height()), pos(), color(COLOR.BROWN)])

  add([
    text('Shop', { size: 40 }),
    pos(center().x, TITLE_Y),
    anchor('center'),
    color(COLOR.WHITE),
  ])

  const moneyLabel = add([
    text(`$${String(money)}`, { size: 28 }),
    pos(center().x, MONEY_Y),
    anchor('center'),
    color(COLOR.GOLD),
  ])

  const extraSpinButton = addButton(
    `Extra Spin ($${String(SHOP.EXTRA_SPIN_BASE_COST)})`,
    center().x,
    BUTTON_START_Y,
    callbacks.onExtraSpin,
  )

  const upgradeWheelButton = addButton(
    `Upgrade Wheel ($${String(SHOP.UPGRADE_WHEEL_COST)})`,
    center().x,
    BUTTON_START_Y + BUTTON_SPACING,
    callbacks.onUpgradeWheel,
  )

  const addSegmentButton = addButton(
    'Add Segment (Free)',
    center().x,
    BUTTON_START_Y + BUTTON_SPACING * 2,
    callbacks.onAddSegment,
  )

  const continueButton = addButton(
    'Continue',
    center().x,
    BUTTON_START_Y + BUTTON_SPACING * 4,
    callbacks.onContinue,
  )

  return {
    updateExtraSpinCost(cost: number) {
      extraSpinButton.setLabel(`Extra Spin ($${String(cost)})`)
    },
    updateMoney(newMoney: number) {
      moneyLabel.text = `$${String(newMoney)}`
    },
    setExtraSpinEnabled(enabled: boolean) {
      if (enabled) {
        extraSpinButton.enable()
      } else {
        extraSpinButton.disable()
      }
    },
    setUpgradeWheelEnabled(enabled: boolean) {
      if (enabled) {
        upgradeWheelButton.enable()
      } else {
        upgradeWheelButton.disable()
      }
    },
    setAddSegmentEnabled(enabled: boolean) {
      if (enabled) {
        addSegmentButton.enable()
      } else {
        addSegmentButton.disable()
      }
    },
    destroy() {
      extraSpinButton.destroy()
      upgradeWheelButton.destroy()
      addSegmentButton.destroy()
      continueButton.destroy()
    },
  }
}
