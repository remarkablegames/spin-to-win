import { COLOR, SHOP } from '../constants'
import { addButton } from './button'

const BUTTON_START_Y = 220
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
    tooltip: `Spend $${String(SHOP.EXTRA_SPIN_BASE_COST)} to gain an extra spin this round`,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const upgradeWheelButton = addButton({
    label: `Upgrade Wheel ($${String(SHOP.UPGRADE_WHEEL_COST)})`,
    x: center().x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING,
    onClick: callbacks.onUpgradeWheel,
    tooltip: `Spend $${String(SHOP.UPGRADE_WHEEL_COST)} to upgrade a positive wheel segment`,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const addSegmentButton = addButton({
    label: 'Add Segment (Free)',
    x: center().x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING * 2,
    onClick: callbacks.onAddSegment,
    tooltip: 'Add a random positive or negative segment to the wheel',
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const continueButton = addButton({
    label: 'Continue',
    x: center().x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING * 3,
    onClick: callbacks.onContinue,
    tooltip: 'Continue to the next round',
    buttonColor: COLOR.RED,
    shadowColor: COLOR.DARK_RED,
  })

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
