import { COLOR, SHOP, SPRITE } from '../constants'
import type { LevelShopConfig } from '../constants/level'
import type {
  FillTemplate,
  PoolUpgrade,
  PoolUpgradeId,
} from '../constants/shop'
import type { ArtifactId } from '../types'
import { getArtifactById, isDesktop } from '../utils'
import { addButton } from './button'

const BUTTON_X = isDesktop() ? width() * 0.65 : width() * 0.7
const BUTTON_START_Y = 220
const BUTTON_Y_SPACING = 70

const POOL_UPGRADE_ICONS: Record<PoolUpgradeId, string> = {
  upgradeMultiplierSegment: SPRITE.SPARKLES.id,
  cloneSegment: SPRITE.COPY.id,
  deleteSegment: SPRITE.TRASH.id,
  permanentBaseSpin: SPRITE.PLUS.id,
  upgradeMoneySegment: SPRITE.COIN.id,
  upgradePassiveIncome: SPRITE.COIN.id,
  upgradeScoreSegment: SPRITE.HEART.id,
}

export type Shop = ReturnType<typeof addShop>

interface ShopCallbacks {
  onAddSegment: () => void
  onArtifactOffer: (index: 0 | 1) => void
  onContinue: () => void
  onExtraSpin: () => void
  onFillBlank: () => void
  onPoolUpgrade: (upgrade: PoolUpgrade) => void
  onReroll: () => void
}

export function addShop(
  callbacks: ShopCallbacks,
  poolOffers: [PoolUpgrade, PoolUpgrade],
  artifactOffers: ArtifactId[],
  initialExtraSpinCost: number,
) {
  const x = BUTTON_X

  const extraSpinButton = addButton({
    label: `Extra Spin ($${String(initialExtraSpinCost)})`,
    icon: SPRITE.PLUS.id,
    x,
    y: BUTTON_START_Y,
    onClick: callbacks.onExtraSpin,
    tooltip: `Spend $${String(initialExtraSpinCost)} to gain an extra spin this round`,
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const addSegmentButton = addButton({
    label: 'Add Blank Segment (Free)',
    icon: SPRITE.QUESTION_MARK.id,
    x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING,
    onClick: callbacks.onAddSegment,
    tooltip: 'Add a blank segment to the wheel (fill it with an upgrade)',
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const fillBlankButton = addButton({
    label: `Fill Blank Segment ($${String(SHOP.FILL_BLANK_SEGMENT_COST)})`,
    icon: SPRITE.STRANGER.id,
    x,
    y: BUTTON_START_Y + BUTTON_Y_SPACING * 2,
    onClick: callbacks.onFillBlank,
    tooltip: 'Fill a blank segment with a random effect',
    buttonColor: COLOR.BLUE,
    shadowColor: COLOR.DARK_BLUE,
  })

  const poolButtons = poolOffers.map((offer, i) =>
    addButton({
      label: offer.label,
      icon: POOL_UPGRADE_ICONS[offer.id],
      x,
      y: BUTTON_START_Y + BUTTON_Y_SPACING * (3 + i),
      onClick: () => {
        callbacks.onPoolUpgrade(offer)
      },
      tooltip: offer.tooltip,
      buttonColor: COLOR.BLUE,
      shadowColor: COLOR.DARK_BLUE,
    }),
  )

  const artifactOfferButtons = artifactOffers.map((id, i) => {
    const artifact = getArtifactById(id)
    return addButton({
      label: `${artifact.name} ($${String(artifact.cost)})`,
      icon: artifact.icon,
      x,
      y: BUTTON_START_Y + BUTTON_Y_SPACING * (3 + poolOffers.length + i),
      onClick: () => {
        callbacks.onArtifactOffer(i as 0 | 1)
      },
      tooltip: artifact.description,
      buttonColor: COLOR.GOLD,
      shadowColor: COLOR.DARK_BROWN,
    })
  })

  const rerollButton = addButton({
    label: `Reroll ($${String(SHOP.REROLL_BASE_COST)})`,
    icon: SPRITE.HISTORY.id,
    x,
    y:
      BUTTON_START_Y +
      BUTTON_Y_SPACING * (3 + poolOffers.length + artifactOffers.length),
    onClick: callbacks.onReroll,
    tooltip: 'Reroll all shop offers',
    buttonColor: COLOR.GREEN,
    shadowColor: COLOR.DARK_GREEN,
  })

  const continueButton = addButton({
    label: 'Continue',
    x,
    y:
      BUTTON_START_Y +
      BUTTON_Y_SPACING * (4 + poolOffers.length + artifactOffers.length),
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
    setAddSegmentEnabled(enabled: boolean) {
      if (enabled) {
        addSegmentButton.enable()
      } else {
        addSegmentButton.disable()
      }
    },
    hideAddSegment() {
      addSegmentButton.hide()
    },
    setFillBlankEnabled(enabled: boolean) {
      if (enabled) {
        fillBlankButton.enable()
      } else {
        fillBlankButton.disable()
      }
    },
    hideFillBlank() {
      fillBlankButton.hide()
    },
    setPoolOfferEnabled(index: 0 | 1, enabled: boolean) {
      if (enabled) {
        poolButtons[index].enable()
      } else {
        poolButtons[index].disable()
      }
    },
    hidePoolOffer(index: 0 | 1) {
      poolButtons[index].hide()
    },
    setArtifactOfferEnabled(index: 0 | 1, enabled: boolean) {
      if (enabled) {
        artifactOfferButtons[index].enable()
      } else {
        artifactOfferButtons[index].disable()
      }
    },
    hideArtifactOffer(index: 0 | 1) {
      artifactOfferButtons[index].hide()
    },
    updateRerollCost(cost: number) {
      rerollButton.setLabel(`Reroll ($${String(cost)})`)
    },
    setRerollEnabled(enabled: boolean) {
      if (enabled) {
        rerollButton.enable()
      } else {
        rerollButton.disable()
      }
    },
    destroy() {
      extraSpinButton.destroy()
      addSegmentButton.destroy()
      fillBlankButton.destroy()
      poolButtons.forEach((b) => {
        b.destroy()
      })
      artifactOfferButtons.forEach((b) => {
        b.destroy()
      })
      rerollButton.destroy()
      continueButton.destroy()
    },
  }
}

export function drawPoolOffers(
  poolUpgrades: PoolUpgrade[],
  shopConfig?: LevelShopConfig,
): [PoolUpgrade, PoolUpgrade] {
  function getLevelWeight(upgrade: PoolUpgrade): number {
    return (
      upgrade.weight *
      (shopConfig?.poolUpgradeWeightMultipliers?.[upgrade.id] ?? 1)
    )
  }

  function pickOne(exclude?: PoolUpgrade): PoolUpgrade {
    const available = exclude
      ? poolUpgrades.filter((u) => u !== exclude)
      : poolUpgrades
    const availableWeight = available.reduce(
      (sum, u) => sum + getLevelWeight(u),
      0,
    )
    let roll = rand(0, availableWeight)
    for (const upgrade of available) {
      roll -= getLevelWeight(upgrade)
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
