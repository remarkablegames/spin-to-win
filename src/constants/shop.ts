import type { Color } from 'kaplay'

export const BASE_PASSIVE_INCOME = 3
export const PASSIVE_INCOME_UPGRADE_AMOUNT = 1
export const PASSIVE_INCOME_UPGRADE_BASE_COST = 8
export const PASSIVE_INCOME_UPGRADE_COST_INCREMENT = 4
export const PASSIVE_INCOME_UPGRADE_MAX = 3

export const EXTRA_SPIN_BASE_COST = 2
export const EXTRA_SPIN_COST_INCREMENT = 2

export const UPGRADE_SCORE_SEGMENT_BASE_COST = 5
export const UPGRADE_SCORE_SEGMENT_COST_INCREMENT = 2
export const UPGRADE_SCORE_SEGMENT_AMOUNT = 5

export const UPGRADE_MONEY_SEGMENT_BASE_COST = 5
export const UPGRADE_MONEY_SEGMENT_COST_INCREMENT = 2
export const UPGRADE_MONEY_SEGMENT_AMOUNT = 2

export const FILL_BLANK_BASE_COST = 4

export const ADD_MULTIPLIER_SEGMENT_COST = 8
export const MULTIPLIER_SEGMENT_POSITIVE_CHANCE = 0.7
export const MULTIPLIER_SEGMENT_POSITIVE_VALUE = 1.25
export const MULTIPLIER_SEGMENT_NEGATIVE_VALUE = 0.75

export const PERMANENT_BASE_SPIN_BASE_COST = 10
export const PERMANENT_BASE_SPIN_COST_INCREMENT = 5

export const DELETE_SEGMENT_BASE_COST = 15
export const DELETE_SEGMENT_COST_INCREMENT = 5
export const DELETE_SEGMENT_MIN_SEGMENTS = 5

export type PoolUpgradeId =
  | 'upgradeScoreSegment'
  | 'upgradeMoneySegment'
  | 'fillBlank'
  | 'addMultiplierSegment'
  | 'permanentBaseSpin'
  | 'deleteSegment'
  | 'upgradePassiveIncome'

export interface PoolUpgrade {
  id: PoolUpgradeId
  weight: number
  label: string
  baseCost: number
  tooltip: string
}

export const POOL_UPGRADES: PoolUpgrade[] = [
  {
    id: 'upgradeScoreSegment',
    weight: 25,
    label: `Upgrade Score Segment ($${String(UPGRADE_SCORE_SEGMENT_BASE_COST)})`,
    baseCost: UPGRADE_SCORE_SEGMENT_BASE_COST,
    tooltip: `Spend $${String(UPGRADE_SCORE_SEGMENT_BASE_COST)} to boost a score segment by +${String(UPGRADE_SCORE_SEGMENT_AMOUNT)}`,
  },
  {
    id: 'upgradeMoneySegment',
    weight: 25,
    label: `Upgrade Money Segment ($${String(UPGRADE_MONEY_SEGMENT_BASE_COST)})`,
    baseCost: UPGRADE_MONEY_SEGMENT_BASE_COST,
    tooltip: `Spend $${String(UPGRADE_MONEY_SEGMENT_BASE_COST)} to boost a money segment by +$${String(UPGRADE_MONEY_SEGMENT_AMOUNT)}`,
  },
  {
    id: 'fillBlank',
    weight: 20,
    label: `Fill Blank Segment ($${String(FILL_BLANK_BASE_COST)})`,
    baseCost: FILL_BLANK_BASE_COST,
    tooltip: `Spend $${String(FILL_BLANK_BASE_COST)} to fill a blank segment with a new effect`,
  },
  {
    id: 'addMultiplierSegment',
    weight: 20,
    label: `Add Multiplier Segment ($${String(ADD_MULTIPLIER_SEGMENT_COST)})`,
    baseCost: ADD_MULTIPLIER_SEGMENT_COST,
    tooltip: `Spend $${String(ADD_MULTIPLIER_SEGMENT_COST)} to add a score multiplier segment to the wheel`,
  },
  {
    id: 'permanentBaseSpin',
    weight: 15,
    label: `Permanent Base Spin ($${String(PERMANENT_BASE_SPIN_BASE_COST)})`,
    baseCost: PERMANENT_BASE_SPIN_BASE_COST,
    tooltip: `Spend $${String(PERMANENT_BASE_SPIN_BASE_COST)} to permanently add +1 spin to every round`,
  },
  {
    id: 'deleteSegment',
    weight: 8,
    label: `Delete Segment ($${String(DELETE_SEGMENT_BASE_COST)})`,
    baseCost: DELETE_SEGMENT_BASE_COST,
    tooltip: `Spend $${String(DELETE_SEGMENT_BASE_COST)} to permanently remove a segment from the wheel`,
  },
  {
    id: 'upgradePassiveIncome',
    weight: 10,
    label: `Upgrade Income ($${String(PASSIVE_INCOME_UPGRADE_BASE_COST)})`,
    baseCost: PASSIVE_INCOME_UPGRADE_BASE_COST,
    tooltip: `Spend $${String(PASSIVE_INCOME_UPGRADE_BASE_COST)} to earn +$${String(PASSIVE_INCOME_UPGRADE_AMOUNT)} more money each round`,
  },
]

export interface FillTemplate {
  color: Color
  icon: { sprite: string; width: number; height: number }
  label: string
  money: number
  multiplier?: number
  score: number
  tooltip: string
}

export const FILL_TEMPLATES: FillTemplate[] = [
  {
    color: rgb(255, 99, 71),
    icon: { sprite: 'heart', width: 30, height: 26 },
    label: '+10',
    money: 0,
    score: 10,
    tooltip: 'Score 10 points',
  },
  {
    color: rgb(128, 128, 128),
    icon: { sprite: 'grape', width: 30, height: 43 },
    label: '+25',
    money: 0,
    score: 25,
    tooltip: 'Score 25 points',
  },
  {
    color: rgb(30, 144, 255),
    icon: { sprite: 'star', width: 30, height: 30 },
    label: '+50',
    money: 0,
    score: 50,
    tooltip: 'Score 50 points',
  },
  {
    color: rgb(255, 215, 0),
    icon: { sprite: 'coin', width: 28, height: 28 },
    label: '+$3',
    money: 3,
    score: 0,
    tooltip: 'Earn $3',
  },
  {
    color: rgb(60, 179, 113),
    icon: { sprite: 'coin', width: 28, height: 28 },
    label: '+$5',
    money: 5,
    score: 0,
    tooltip: 'Earn $5',
  },
  {
    color: rgb(220, 20, 60),
    icon: { sprite: 'skuller', width: 28, height: 30 },
    label: '-15',
    money: 0,
    score: -15,
    tooltip: 'Lose 15 points',
  },
  {
    color: rgb(139, 0, 0),
    icon: { sprite: 'money_bag', width: 35, height: 35 },
    label: '-$3',
    money: -3,
    score: 0,
    tooltip: 'Pay $3',
  },
  {
    color: rgb(100, 200, 255),
    icon: { sprite: 'star', width: 30, height: 30 },
    label: '\u00d71.25',
    money: 0,
    multiplier: 1.25,
    score: 0,
    tooltip: 'Multiply round score by 1.25',
  },
  {
    color: rgb(180, 100, 200),
    icon: { sprite: 'star', width: 30, height: 30 },
    label: '\u00d70.75',
    money: 0,
    multiplier: 0.75,
    score: 0,
    tooltip: 'Multiply round score by 0.75',
  },
]
