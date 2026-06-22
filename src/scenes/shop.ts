import { ARTIFACT, LEVEL, SCENE, SHOP, SPRITE } from '../constants'
import type { PoolUpgrade } from '../constants/shop'
import {
  addArtifact,
  addGrid,
  addHeader,
  addShop,
  addToast,
  addWheel,
  drawPoolOffers,
  pickFillTemplates,
} from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import type { ArtifactId, ArtifactSlot } from '../types'
import {
  addArtifactSlot,
  getArtifactById,
  getRandomArtifacts,
  getSellRefund,
  hasArtifact,
  isActiveArtifact,
  removeArtifactSlot,
} from '../utils'

interface ShopState {
  artifacts: ArtifactSlot[]
  baseSpins: number
  levelIndex: number
  levelScore: number
  money: number
  passiveIncome: number
  roundIndex: number
  segments: WheelSegment[]
  wheelAngle?: number
}

scene(SCENE.SHOP, (state: ShopState) => {
  addGrid()

  let money = state.money
  let extraSpinCost = SHOP.EXTRA_SPIN_BASE_COST
  let extraSpins = 0
  let addedSegment = false
  let baseSpins = state.baseSpins
  let passiveIncome = state.passiveIncome
  let passiveIncomeUpgrades = 0
  let artifacts = state.artifacts
  let upgradeScoreCost = SHOP.UPGRADE_SCORE_SEGMENT_BASE_COST
  let upgradeMoneyCost = SHOP.UPGRADE_MONEY_SEGMENT_BASE_COST
  let permanentSpinCost = SHOP.PERMANENT_BASE_SPIN_BASE_COST
  let deleteSegmentCost = SHOP.DELETE_SEGMENT_BASE_COST
  let passiveIncomeCost = SHOP.PASSIVE_INCOME_UPGRADE_BASE_COST

  const header = addHeader()
  header.setLevel(state.levelIndex + 1)
  header.setRound(
    state.roundIndex + 1,
    LEVEL.LEVELS[state.levelIndex].roundsPerLevel,
  )
  header.setScore(state.levelScore, LEVEL.LEVELS[state.levelIndex].targetScore)
  header.setMoney(money)

  const wheelX = vec2(width() * 0.28, center().y)
  const wheel = addWheel({
    segments: state.segments,
    pos: wheelX,
    angle: state.wheelAngle,
  })

  add([
    sprite(SPRITE.POINTER.id, {
      width: SPRITE.POINTER.width,
      height: SPRITE.POINTER.height,
    }),
    pos(wheelX.x, wheelX.y - wheel.radius - 12),
    anchor('center'),
    rotate(90),
    color(rgb(255, 255, 255)),
  ])

  const poolOffers = drawPoolOffers(SHOP.POOL_UPGRADES)

  const artifactOfferIds = getRandomArtifacts(2)

  function sellArtifact(id: ArtifactId) {
    const artifact = getArtifactById(id)
    const refund = getSellRefund(id)
    money += refund
    header.setMoney(money)

    artifacts = removeArtifactSlot(artifacts, id)
    addToast(`Sold ${artifact.name} for $${String(refund)}`)

    updateArtifactUI()
    updateButtons()
  }

  function buyArtifact(id: ArtifactId) {
    const artifact = getArtifactById(id)
    if (money < artifact.cost) {
      return
    }

    const previousLength = artifacts.length
    artifacts = addArtifactSlot(artifacts, id)
    if (artifacts.length === previousLength && !isActiveArtifact(id)) {
      addToast(`You already own ${artifact.name}`)
      return
    }
    if (artifacts.length === previousLength) {
      addToast("You can't buy any more artifacts")
      return
    }

    money -= artifact.cost
    header.setMoney(money)
    addToast(`Purchased ${artifact.name}`)
    updateArtifactUI()
    updateButtons()
  }

  const activeArtifactInventory = addArtifact({
    onUse: (id) => {
      sellArtifact(id)
    },
  })

  function updateArtifactUI() {
    activeArtifactInventory.update(artifacts)
  }

  updateArtifactUI()

  const shop = addShop(
    {
      onExtraSpin: () => {
        if (money < extraSpinCost) {
          return
        }
        money -= extraSpinCost
        extraSpins += 1
        extraSpinCost += SHOP.EXTRA_SPIN_COST_INCREMENT
        header.setMoney(money)
        shop.updateExtraSpinCost(extraSpinCost)
        addToast('Extra Spin Purchased')
        updateButtons()
      },
      onAddSegment: () => {
        if (addedSegment) {
          return
        }
        const blank: WheelSegment = {
          blank: true,
          color: rgb(100, 100, 100),
          icon: SPRITE.QUESTION_MARK.id,
          label: '',
          money: 0,
          score: 0,
          tooltip: 'Blank segment — fill it with an upgrade',
        }
        wheel.addSegment(blank)
        addedSegment = true
        shop.hideAddSegment()
        addToast('Blank Segment Added')
        updateButtons()
      },
      onPoolUpgrade: (upgrade: PoolUpgrade) => {
        const index = poolOffers.indexOf(upgrade) as 0 | 1
        const prevMoney = money
        handlePoolUpgrade(upgrade)
        if (money !== prevMoney) {
          shop.hidePoolOffer(index)
        }
      },
      onArtifactOffer: (index) => {
        const prevMoney = money
        buyArtifact(artifactOfferIds[index])
        if (money !== prevMoney) {
          shop.hideArtifactOffer(index)
        }
      },
      onContinue: () => {
        wheel.clearMode()
        shop.destroy()
        activeArtifactInventory.destroy()
        go(SCENE.GAME, {
          ...state,
          artifacts,
          baseSpins,
          money,
          extraSpins,
          passiveIncome,
          segments: wheel.segments,
          wheelAngle: state.wheelAngle,
        })
      },
    },
    poolOffers,
    artifactOfferIds,
    extraSpinCost,
  )

  function getPoolOfferCost(upgrade: PoolUpgrade): number {
    switch (upgrade.id) {
      case 'upgradeScoreSegment':
        return upgradeScoreCost
      case 'upgradeMoneySegment':
        return upgradeMoneyCost
      case 'permanentBaseSpin':
        return permanentSpinCost
      case 'deleteSegment':
        return deleteSegmentCost
      case 'upgradePassiveIncome':
        return passiveIncomeCost
      default:
        return upgrade.baseCost
    }
  }

  function handlePoolUpgrade(upgrade: PoolUpgrade) {
    const cost = getPoolOfferCost(upgrade)
    if (money < cost) {
      return
    }

    const offerIndex = poolOffers.indexOf(upgrade) as 0 | 1

    switch (upgrade.id) {
      case 'upgradeScoreSegment': {
        money -= cost
        upgradeScoreCost += SHOP.UPGRADE_SCORE_SEGMENT_COST_INCREMENT
        header.setMoney(money)
        shop.updatePoolOfferLabel(
          offerIndex,
          `Upgrade Score Segment ($${String(upgradeScoreCost)})`,
          `Spend $${String(upgradeScoreCost)} to boost a score segment by +${String(SHOP.UPGRADE_SCORE_SEGMENT_AMOUNT)}`,
        )
        addToast('Select a score segment on the wheel')
        wheel.setUpgradeMode('score', SHOP.UPGRADE_SCORE_SEGMENT_AMOUNT, () => {
          addToast('Score Segment Upgraded')
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'upgradeMoneySegment': {
        money -= cost
        upgradeMoneyCost += SHOP.UPGRADE_MONEY_SEGMENT_COST_INCREMENT
        header.setMoney(money)
        shop.updatePoolOfferLabel(
          offerIndex,
          `Upgrade Money Segment ($${String(upgradeMoneyCost)})`,
          `Spend $${String(upgradeMoneyCost)} to boost a money segment by +$${String(SHOP.UPGRADE_MONEY_SEGMENT_AMOUNT)}`,
        )
        addToast('Select a money segment on the wheel')
        wheel.setUpgradeMode('money', SHOP.UPGRADE_MONEY_SEGMENT_AMOUNT, () => {
          addToast('Money Segment Upgraded')
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'fillBlank': {
        money -= cost
        header.setMoney(money)
        const templates = pickFillTemplates(SHOP.FILL_TEMPLATES, 3)
        addToast('Select a blank segment on the wheel')
        wheel.setFillMode((segment: WheelSegment) => {
          shop.showFillTemplates(templates, (template) => {
            const idx = wheel.segments.indexOf(segment)
            if (idx !== -1) {
              wheel.segments[idx] = { ...template }
            }
            addToast(`Filled: ${template.label}`)
            updateButtons()
          })
        })
        updateButtons()
        break
      }
      case 'addMultiplierSegment': {
        money -= cost
        header.setMoney(money)
        const isPositive = rand(0, 1) < SHOP.MULTIPLIER_SEGMENT_POSITIVE_CHANCE
        const multiplierValue = isPositive
          ? SHOP.MULTIPLIER_SEGMENT_POSITIVE_VALUE
          : SHOP.MULTIPLIER_SEGMENT_NEGATIVE_VALUE
        const multiplierColor = isPositive
          ? rgb(100, 200, 255)
          : rgb(180, 100, 200)
        const multiplierLabel = isPositive ? '+25%' : '-25%'
        const multiplierSegment: WheelSegment = {
          color: multiplierColor,
          icon: SPRITE.STAR.id,
          label: multiplierLabel,
          money: 0,
          multiplier: multiplierValue,
          score: 0,
          tooltip: `Multiply round score by ${String(multiplierValue)} (${multiplierLabel})`,
        }
        wheel.addSegment(multiplierSegment)
        addToast(`Added ${multiplierLabel} Segment`)
        updateButtons()
        break
      }
      case 'permanentBaseSpin': {
        money -= cost
        baseSpins += 1
        permanentSpinCost += SHOP.PERMANENT_BASE_SPIN_COST_INCREMENT
        header.setMoney(money)
        shop.updatePoolOfferLabel(
          offerIndex,
          `Permanent Base Spin ($${String(permanentSpinCost)})`,
          `Spend $${String(permanentSpinCost)} to permanently add +1 spin to every round`,
        )
        addToast('+1 Permanent Spin Added')
        updateButtons()
        break
      }
      case 'deleteSegment': {
        money -= cost
        deleteSegmentCost += SHOP.DELETE_SEGMENT_COST_INCREMENT
        header.setMoney(money)
        shop.updatePoolOfferLabel(
          offerIndex,
          `Delete Segment ($${String(deleteSegmentCost)})`,
          `Spend $${String(deleteSegmentCost)} to permanently remove a segment from the wheel`,
        )
        addToast('Select a segment to delete')
        wheel.setDeleteMode((segment: WheelSegment) => {
          const idx = wheel.segments.indexOf(segment)
          if (idx !== -1) {
            wheel.segments.splice(idx, 1)
          }
          addToast('Segment Deleted')
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'upgradePassiveIncome': {
        if (passiveIncomeUpgrades >= SHOP.PASSIVE_INCOME_UPGRADE_MAX) {
          return
        }
        money -= cost
        passiveIncome += SHOP.PASSIVE_INCOME_UPGRADE_AMOUNT
        passiveIncomeUpgrades += 1
        passiveIncomeCost += SHOP.PASSIVE_INCOME_UPGRADE_COST_INCREMENT
        header.setMoney(money)
        if (passiveIncomeUpgrades >= SHOP.PASSIVE_INCOME_UPGRADE_MAX) {
          shop.setPoolOfferEnabled(offerIndex, false)
        } else {
          shop.updatePoolOfferLabel(
            offerIndex,
            `Upgrade Income ($${String(passiveIncomeCost)})`,
            `Spend $${String(passiveIncomeCost)} to earn +$${String(SHOP.PASSIVE_INCOME_UPGRADE_AMOUNT)} more money each round`,
          )
        }
        addToast(`Passive Income now $${String(passiveIncome)}/round`)
        updateButtons()
        break
      }
    }
  }

  function hasScoreSegments() {
    return wheel.segments.some((s) => s.score !== 0)
  }

  function hasMoneySegments() {
    return wheel.segments.some((s) => s.money !== 0)
  }

  function hasBlankSegments() {
    return wheel.segments.some((s) => s.blank === true)
  }

  function isPoolOfferEnabled(upgrade: PoolUpgrade): boolean {
    const cost = getPoolOfferCost(upgrade)
    if (money < cost) {
      return false
    }
    switch (upgrade.id) {
      case 'upgradeScoreSegment':
        return hasScoreSegments()
      case 'upgradeMoneySegment':
        return hasMoneySegments()
      case 'fillBlank':
        return hasBlankSegments()
      case 'deleteSegment':
        return wheel.segments.length > SHOP.DELETE_SEGMENT_MIN_SEGMENTS
      case 'upgradePassiveIncome':
        return passiveIncomeUpgrades < SHOP.PASSIVE_INCOME_UPGRADE_MAX
      default:
        return true
    }
  }

  function updateButtons() {
    shop.setExtraSpinEnabled(money >= extraSpinCost)
    shop.setAddSegmentEnabled(!addedSegment)
    poolOffers.forEach((offer, i) => {
      shop.setPoolOfferEnabled(i as 0 | 1, isPoolOfferEnabled(offer))
    })
    artifactOfferIds.forEach((id, i) => {
      const artifact = getArtifactById(id)
      const canAfford = money >= artifact.cost
      const canAdd = isActiveArtifact(id)
        ? artifacts.length < ARTIFACT.ARTIFACT_SLOTS
        : !hasArtifact(artifacts, id)
      shop.setArtifactOfferEnabled(i as 0 | 1, canAfford && canAdd)
    })
  }

  updateButtons()
})
