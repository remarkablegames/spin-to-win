import {
  ARTIFACT,
  COLOR,
  LEVEL,
  SCENE,
  SHOP,
  SOUND,
  SPRITE,
} from '../constants'
import type { PoolUpgrade } from '../constants/shop'
import {
  addArtifact,
  addGrid,
  addHeader,
  addMuteButton,
  addShop,
  addToast,
  addWheel,
  drawPoolOffers,
  pickFillTemplates,
} from '../gameobjects'
import type { Shop } from '../gameobjects/shop'
import type { WheelSegment } from '../gameobjects/wheel'
import type { ArtifactId, ArtifactSlot } from '../types'
import {
  addArtifactSlot,
  getArtifactById,
  getRandomArtifacts,
  getSellRefund,
  playSound,
  removeArtifactSlot,
} from '../utils'

const WHEEL_X = width() * 0.35

interface ShopState {
  artifacts: ArtifactSlot[]
  baseSpins?: number
  levelIndex: number
  levelScore: number
  money: number
  passiveIncome: number
  roundIndex: number
  segments: WheelSegment[]
  wheelAngle?: number
}

scene(SCENE.SHOP, (state: ShopState) => {
  addMuteButton()
  addGrid()

  let money = state.money
  let extraSpinCost = SHOP.EXTRA_SPIN_BASE_COST
  let extraSpins = 0
  let addedSegment = false
  let baseSpins = state.baseSpins ?? LEVEL.BASE_SPINS
  let passiveIncome = state.passiveIncome
  let artifacts = state.artifacts
  let rerollCost = SHOP.REROLL_BASE_COST

  const header = addHeader()
  header.setLevel(state.levelIndex + 1)
  header.setRound(
    state.roundIndex + 1,
    LEVEL.LEVELS[state.levelIndex].roundsPerLevel,
  )
  header.setScore(state.levelScore, LEVEL.LEVELS[state.levelIndex].targetScore)
  header.setMoney(money)

  const wheelX = vec2(WHEEL_X, center().y)
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
  ])

  const levelShopConfig = LEVEL.LEVELS[state.levelIndex].shop
  let poolOffers = drawPoolOffers(SHOP.POOL_UPGRADES, levelShopConfig)
  let artifactOfferIds = getRandomArtifacts(2, [], levelShopConfig)

  function sellArtifact(id: ArtifactId) {
    const artifact = getArtifactById(id)
    const refund = getSellRefund(id)
    money += refund
    header.setMoney(money)

    artifacts = removeArtifactSlot(artifacts, id)
    addToast(`Sold ${artifact.name} for $${String(refund)}`)
    playSound(SOUND.SHOP_PURCHASE.id)

    updateArtifactUI()
    updateButtons()
  }

  function buyArtifact(id: ArtifactId) {
    const artifact = getArtifactById(id)
    if (money < artifact.cost) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    const previousLength = artifacts.length
    artifacts = addArtifactSlot(artifacts, id)
    if (artifacts.length === previousLength) {
      const isFull = artifacts.length >= ARTIFACT.ARTIFACT_SLOTS
      addToast(
        isFull
          ? "You can't buy any more artifacts"
          : `You already own ${artifact.name}`,
      )
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    money -= artifact.cost
    header.setMoney(money)
    addToast(`Purchased ${artifact.name}`)
    playSound(SOUND.SHOP_PURCHASE.id)
    updateArtifactUI()
    updateButtons()
  }

  const activeArtifactInventory = addArtifact({
    holdToConfirm: true,
    onUse: (id) => {
      sellArtifact(id)
    },
  })

  function updateArtifactUI() {
    activeArtifactInventory.update(artifacts)
  }

  updateArtifactUI()

  let shop: Shop
  let isRerolling = false

  function createShop() {
    return addShop(
      {
        onExtraSpin: () => {
          if (money < extraSpinCost) {
            playSound(SOUND.INVALID_ACTION.id)
            return
          }
          money -= extraSpinCost
          extraSpins += 1
          extraSpinCost += SHOP.EXTRA_SPIN_COST_INCREMENT
          header.setMoney(money)
          shop.updateExtraSpinCost(extraSpinCost)
          addToast('Extra Spin Purchased')
          playSound(SOUND.SHOP_PURCHASE.id)
          updateButtons()
        },
        onAddSegment: () => {
          if (addedSegment) {
            playSound(SOUND.INVALID_ACTION.id)
            return
          }
          const blank: WheelSegment = {
            blank: true,
            color: COLOR.GREY,
            icon: SPRITE.QUESTION_MARK.id,
            label: '',
            tooltip: 'Blank segment (fill it with an upgrade)',
          }
          wheel.addSegment(blank)
          const newIndex = wheel.segments.length - 1
          const targetIndex = randi(0, wheel.segments.length)
          const [blankSegment] = wheel.segments.splice(newIndex, 1)
          wheel.segments.splice(targetIndex, 0, blankSegment)
          addedSegment = true
          shop.hideAddSegment()
          addToast('Blank Segment Added')
          playSound(SOUND.SHOP_PURCHASE.id)
          updateButtons()
        },
        onFillBlank: () => {
          if (money < SHOP.FILL_BLANK_SEGMENT_COST) {
            playSound(SOUND.INVALID_ACTION.id)
            return
          }
          if (!hasBlankSegments()) {
            playSound(SOUND.INVALID_ACTION.id)
            return
          }
          money -= SHOP.FILL_BLANK_SEGMENT_COST
          header.setMoney(money)
          const blankIndices = wheel.segments
            .map((segment, index) => (segment.blank ? index : -1))
            .filter((index) => index !== -1)
          const template = pickFillTemplates(SHOP.FILL_TEMPLATES, 1)[0]
          const idx = blankIndices[randi(0, blankIndices.length)]
          wheel.segments[idx] = { ...template }
          addToast(`Filled: ${template.label}`)
          playSound(SOUND.SHOP_PURCHASE.id)
          shop.hideFillBlank()
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
        onReroll: () => {
          rerollShop()
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
            wheelAngle: wheel.angle,
          })
        },
      },
      poolOffers,
      artifactOfferIds,
      extraSpinCost,
    )
  }

  function rerollShop() {
    if (isRerolling) {
      return
    }
    if (money < rerollCost) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }
    isRerolling = true
    money -= rerollCost
    rerollCost += SHOP.REROLL_COST_INCREMENT
    header.setMoney(money)
    shop.destroy()

    extraSpinCost = SHOP.EXTRA_SPIN_BASE_COST
    addedSegment = false
    poolOffers = drawPoolOffers(SHOP.POOL_UPGRADES, levelShopConfig)
    artifactOfferIds = getRandomArtifacts(2, [], levelShopConfig)

    shop = createShop()
    shop.updateRerollCost(rerollCost)
    addToast('Shop Rerolled')
    playSound(SOUND.SHOP_PURCHASE.id)
    updateButtons()
    wait(0, () => {
      isRerolling = false
    })
  }

  shop = createShop()

  function getPoolOfferCost(upgrade: PoolUpgrade): number {
    switch (upgrade.id) {
      case 'upgradeScoreSegment':
        return SHOP.UPGRADE_SCORE_SEGMENT_COST
      case 'upgradeMoneySegment':
        return SHOP.UPGRADE_MONEY_SEGMENT_COST
      case 'permanentBaseSpin':
        return SHOP.PERMANENT_BASE_SPIN_COST
      case 'deleteSegment':
        return SHOP.DELETE_SEGMENT_COST
      case 'upgradePassiveIncome':
        return SHOP.PASSIVE_INCOME_UPGRADE_COST
      default:
        return upgrade.baseCost
    }
  }

  function handlePoolUpgrade(upgrade: PoolUpgrade) {
    const cost = getPoolOfferCost(upgrade)
    if (money < cost) {
      playSound(SOUND.INVALID_ACTION.id)
      return
    }

    switch (upgrade.id) {
      case 'upgradeScoreSegment': {
        money -= cost
        header.setMoney(money)
        addToast('Select a score segment on the wheel')
        playSound(SOUND.SHOP_PURCHASE.id)
        wheel.setUpgradeMode('score', SHOP.UPGRADE_SCORE_SEGMENT_AMOUNT, () => {
          addToast('Score Segment Upgraded')
          playSound(SOUND.SHOP_PURCHASE.id)
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'upgradeMoneySegment': {
        money -= cost
        header.setMoney(money)
        addToast('Select a money segment on the wheel')
        playSound(SOUND.SHOP_PURCHASE.id)
        wheel.setUpgradeMode('money', SHOP.UPGRADE_MONEY_SEGMENT_AMOUNT, () => {
          addToast('Money Segment Upgraded')
          playSound(SOUND.SHOP_PURCHASE.id)
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'upgradeMultiplierSegment': {
        money -= cost
        header.setMoney(money)
        addToast('Select a multiplier segment on the wheel')
        playSound(SOUND.SHOP_PURCHASE.id)
        wheel.setUpgradeMode(
          'multiplier',
          SHOP.UPGRADE_MULTIPLIER_SEGMENT_AMOUNT,
          () => {
            addToast('Multiplier Segment Upgraded')
            playSound(SOUND.SHOP_PURCHASE.id)
            updateButtons()
          },
        )
        updateButtons()
        break
      }
      case 'cloneSegment': {
        money -= cost
        header.setMoney(money)
        addToast('Select a segment to clone')
        playSound(SOUND.SHOP_PURCHASE.id)
        wheel.setSelectMode((segment: WheelSegment) => {
          wheel.addSegment({ ...segment })
          addToast(`Cloned: ${segment.label}`)
          playSound(SOUND.SHOP_PURCHASE.id)
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'permanentBaseSpin': {
        money -= cost
        baseSpins += 1
        header.setMoney(money)
        addToast('+1 Permanent Spin Added')
        playSound(SOUND.SHOP_PURCHASE.id)
        updateButtons()
        break
      }
      case 'deleteSegment': {
        money -= cost
        header.setMoney(money)
        addToast('Select a segment to delete')
        playSound(SOUND.SHOP_PURCHASE.id)
        wheel.setDeleteMode((segment: WheelSegment) => {
          const idx = wheel.segments.indexOf(segment)
          if (idx !== -1) {
            wheel.segments.splice(idx, 1)
          }
          addToast('Segment Deleted')
          playSound(SOUND.SHOP_PURCHASE.id)
          updateButtons()
        })
        updateButtons()
        break
      }
      case 'upgradePassiveIncome': {
        money -= cost
        passiveIncome += SHOP.PASSIVE_INCOME_UPGRADE_AMOUNT
        header.setMoney(money)
        addToast(`Passive Income now $${String(passiveIncome)}/round`)
        playSound(SOUND.SHOP_PURCHASE.id)
        updateButtons()
        break
      }
    }
  }

  function hasScoreSegments() {
    return wheel.segments.some(({ score }) => score !== undefined)
  }

  function hasMoneySegments() {
    return wheel.segments.some(({ money }) => money !== undefined)
  }

  function hasBlankSegments() {
    return wheel.segments.some(({ blank }) => blank === true)
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
      case 'deleteSegment':
        return wheel.segments.length > SHOP.DELETE_SEGMENT_MIN_SEGMENTS
      default:
        return true
    }
  }

  function updateButtons() {
    shop.setExtraSpinEnabled(money >= extraSpinCost)
    shop.setAddSegmentEnabled(!addedSegment)
    shop.setFillBlankEnabled(
      hasBlankSegments() && money >= SHOP.FILL_BLANK_SEGMENT_COST,
    )
    shop.setRerollEnabled(money >= rerollCost)
    poolOffers.forEach((offer, i) => {
      shop.setPoolOfferEnabled(i as 0 | 1, isPoolOfferEnabled(offer))
    })
    artifactOfferIds.forEach((id, i) => {
      const artifact = getArtifactById(id)
      const canAfford = money >= artifact.cost
      const canAdd =
        artifacts.length < ARTIFACT.ARTIFACT_SLOTS &&
        !artifacts.some((slot) => slot.id === id)
      shop.setArtifactOfferEnabled(i as 0 | 1, canAfford && canAdd)
    })
  }

  updateButtons()
})
