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
  const extraSpinButton = addButton({
    label: `Extra Spin ($${String(SHOP.EXTRA_SPIN_BASE_COST)})`,
    x: center().x,
    y: BUTTON_START_Y,
    onClick: callbacks.onExtraSpin,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const upgradeWheelButton = addButton({
    label: `Upgrade Wheel ($${String(SHOP.UPGRADE_WHEEL_COST)})`,
    x: center().x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING,
    onClick: callbacks.onUpgradeWheel,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const addSegmentButton = addButton({
    label: 'Add Segment (Free)',
    x: center().x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING * 2,
    onClick: callbacks.onAddSegment,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const continueButton = addButton({
    label: 'Continue',
    x: center().x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING * 3,
    onClick: callbacks.onContinue,
    buttonColor: COLOR.RED,
    shadowColor: COLOR.DARK_RED,
  })

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
