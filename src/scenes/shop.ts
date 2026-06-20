import { COLOR, LEVEL, SCENE, SHOP } from '../constants'
import { addGrid, addHeader, addNotification, addShop } from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import { formatSegmentLabel } from '../gameobjects/wheel'

interface ShopState {
  levelIndex: number
  levelScore: number
  money: number
  roundIndex: number
  segments: WheelSegment[]
}

scene(SCENE.SHOP, (state: ShopState) => {
  addGrid()

  let money = state.money
  let extraSpinCost = SHOP.EXTRA_SPIN_BASE_COST
  let extraSpins = 0
  let addedSegment = false

  const header = addHeader()
  header.setLevel(state.levelIndex + 1)
  header.setRound(
    state.roundIndex + 1,
    LEVEL.LEVELS[state.levelIndex].roundsPerLevel,
  )
  header.setScore(state.levelScore, LEVEL.LEVELS[state.levelIndex].targetScore)
  header.setMoney(money)

  const shop = addShop({
    onExtraSpin: () => {
      if (money < extraSpinCost) {
        return
      }

      money -= extraSpinCost
      extraSpins++
      extraSpinCost += SHOP.EXTRA_SPIN_COST_INCREMENT
      header.setMoney(money)
      shop.updateExtraSpinCost(extraSpinCost)
      addNotification('Extra Spin Purchased', COLOR.BLUE, vec2(center().x, 200))
      updateButtons()
    },
    onUpgradeWheel: () => {
      if (money < SHOP.UPGRADE_WHEEL_COST) {
        return
      }

      money -= SHOP.UPGRADE_WHEEL_COST
      const positiveSegments = state.segments.filter(
        (segment) => segment.score > 0 || segment.money > 0,
      )

      if (positiveSegments.length > 0) {
        const segment = positiveSegments[randi(0, positiveSegments.length)]
        if (segment.score > 0) {
          segment.score += SHOP.UPGRADE_WHEEL_AMOUNT
        } else {
          segment.money += SHOP.UPGRADE_WHEEL_AMOUNT
        }
        segment.label = formatSegmentLabel(segment)
      }

      header.setMoney(money)
      addNotification('Wheel Upgraded', COLOR.BLUE, vec2(center().x, 200))
      updateButtons()
    },
    onAddSegment: () => {
      if (addedSegment) {
        return
      }

      const isPositive = rand(0, 1) < SHOP.ADD_SEGMENT_POSITIVE_CHANCE
      const pool = isPositive ? SHOP.POSITIVE_SEGMENTS : SHOP.NEGATIVE_SEGMENTS
      const template = pool[randi(0, pool.length)]
      const segment = { ...template }
      state.segments.push(segment)
      addedSegment = true
      addNotification(
        `Added ${segment.label}`,
        segment.color,
        vec2(center().x, 200),
      )
      updateButtons()
    },
    onContinue: () => {
      shop.destroy()
      go(SCENE.GAME, {
        ...state,
        money,
        extraSpins,
      })
    },
  })

  function updateButtons() {
    shop.setExtraSpinEnabled(money >= extraSpinCost)
    shop.setUpgradeWheelEnabled(money >= SHOP.UPGRADE_WHEEL_COST)
    shop.setAddSegmentEnabled(!addedSegment)
  }

  updateButtons()
})
