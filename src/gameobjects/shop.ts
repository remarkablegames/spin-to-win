import { COLOR, SHOP } from '../constants'
import { addButton } from './button'

const BUTTON_START_Y = 260
const BUTTON_Y_SPACING = 80

export type Shop = ReturnType<typeof addShop>

interface ShopCallbacks {
  onAddSegment: () => void
  onContinue: () => void
  onExtraSpin: () => void
  onUpgradeWheel: () => void
}

export function addShop(callbacks: ShopCallbacks) {
  const extraSpinButton = addButton(
    `Extra Spin ($${String(SHOP.EXTRA_SPIN_BASE_COST)})`,
    center().x,
    BUTTON_START_Y,
    callbacks.onExtraSpin,
    undefined,
    undefined,
    COLOR.BLUE,
    COLOR.DARK_BLUE,
  )

  const upgradeWheelButton = addButton(
    `Upgrade Wheel ($${String(SHOP.UPGRADE_WHEEL_COST)})`,
    center().x,
    BUTTON_START_Y + BUTTON_Y_SPACING,
    callbacks.onUpgradeWheel,
    undefined,
    undefined,
    COLOR.BLUE,
    COLOR.DARK_BLUE,
  )

  const addSegmentButton = addButton(
    'Add Segment (Free)',
    center().x,
    BUTTON_START_Y + BUTTON_Y_SPACING * 2,
    callbacks.onAddSegment,
    undefined,
    undefined,
    COLOR.BLUE,
    COLOR.DARK_BLUE,
  )

  const continueButton = addButton(
    'Continue',
    center().x,
    BUTTON_START_Y + BUTTON_Y_SPACING * 3,
    callbacks.onContinue,
    undefined,
    undefined,
    COLOR.RED,
    COLOR.DARK_RED,
  )

  return {
    updateExtraSpinCost(cost: number) {
      extraSpinButton.setLabel(`Extra Spin ($${String(cost)})`)
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
