import type { Color } from 'kaplay'

import {
  APPLE,
  COIN,
  GRAPE,
  HEART,
  HOME,
  KARAT,
  MONEY_BAG,
  PUMPKA,
  SKULLER,
  SPARK,
  SPARKLES,
  SPIKE,
  STAR,
  TGA,
} from './sprite'

export const BASE_PASSIVE_INCOME = 3
export const PASSIVE_INCOME_UPGRADE_AMOUNT = 1
export const PASSIVE_INCOME_UPGRADE_COST = 9

export const EXTRA_SPIN_BASE_COST = 1
export const EXTRA_SPIN_COST_INCREMENT = 1

export const FILL_BLANK_SEGMENT_COST = 3

export const UPGRADE_SCORE_SEGMENT_COST = 6
export const UPGRADE_SCORE_SEGMENT_AMOUNT = 25

export const UPGRADE_MONEY_SEGMENT_COST = 6
export const UPGRADE_MONEY_SEGMENT_AMOUNT = 2

export const UPGRADE_MULTIPLIER_SEGMENT_COST = 6
export const UPGRADE_MULTIPLIER_SEGMENT_AMOUNT = 0.05

const CLONE_SEGMENT_BASE_COST = 12

export const PERMANENT_BASE_SPIN_COST = 12

export const DELETE_SEGMENT_COST = 15
export const DELETE_SEGMENT_MIN_SEGMENTS = 5

export const REROLL_BASE_COST = 2
export const REROLL_COST_INCREMENT = 2

export type PoolUpgradeId =
  | 'upgradeScoreSegment'
  | 'upgradeMoneySegment'
  | 'upgradeMultiplierSegment'
  | 'cloneSegment'
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
    label: `Upgrade Score Segment ($${String(UPGRADE_SCORE_SEGMENT_COST)})`,
    baseCost: UPGRADE_SCORE_SEGMENT_COST,
    tooltip: `Boost a score segment by +${String(UPGRADE_SCORE_SEGMENT_AMOUNT)}`,
  },

  {
    id: 'upgradeMoneySegment',
    weight: 25,
    label: `Upgrade Money Segment ($${String(UPGRADE_MONEY_SEGMENT_COST)})`,
    baseCost: UPGRADE_MONEY_SEGMENT_COST,
    tooltip: `Boost a money segment by +$${String(UPGRADE_MONEY_SEGMENT_AMOUNT)}`,
  },

  {
    id: 'upgradeMultiplierSegment',
    weight: 20,
    label: `Upgrade Multiplier Segment ($${String(UPGRADE_MULTIPLIER_SEGMENT_COST)})`,
    baseCost: UPGRADE_MULTIPLIER_SEGMENT_COST,
    tooltip: `Boost a multiplier segment by +5%`,
  },

  {
    id: 'cloneSegment',
    weight: 12,
    label: `Clone Segment ($${String(CLONE_SEGMENT_BASE_COST)})`,
    baseCost: CLONE_SEGMENT_BASE_COST,
    tooltip: `Duplicate an existing wheel segment`,
  },

  {
    id: 'permanentBaseSpin',
    weight: 15,
    label: `Permanent Base Spin ($${String(PERMANENT_BASE_SPIN_COST)})`,
    baseCost: PERMANENT_BASE_SPIN_COST,
    tooltip: `Permanently add +1 spin to every round`,
  },

  {
    id: 'deleteSegment',
    weight: 8,
    label: `Delete Segment ($${String(DELETE_SEGMENT_COST)})`,
    baseCost: DELETE_SEGMENT_COST,
    tooltip: `Permanently remove a segment from the wheel`,
  },

  {
    id: 'upgradePassiveIncome',
    weight: 10,
    label: `Upgrade Income ($${String(PASSIVE_INCOME_UPGRADE_COST)})`,
    baseCost: PASSIVE_INCOME_UPGRADE_COST,
    tooltip: `Earn +$${String(PASSIVE_INCOME_UPGRADE_AMOUNT)} more money each round`,
  },
]

export interface FillTemplate {
  artifact?: boolean
  color: Color
  endRound?: boolean
  icon: string
  label: string
  money?: number
  multiplier?: number
  score?: number
  tooltip: string
}

export const FILL_TEMPLATES: FillTemplate[] = [
  {
    color: rgb(255, 99, 71),
    icon: HEART.id,
    label: '+10',
    score: 10,
    tooltip: 'Score 10 points',
  },

  {
    color: rgb(128, 0, 128),
    icon: GRAPE.id,
    label: '+25',
    score: 25,
    tooltip: 'Score 25 points',
  },

  {
    color: rgb(30, 144, 255),
    icon: STAR.id,
    label: '+50',
    score: 50,
    tooltip: 'Score 50 points',
  },

  {
    color: rgb(255, 215, 0),
    icon: COIN.id,
    label: '+$3',
    money: 3,
    tooltip: 'Earn $3',
  },

  {
    color: rgb(60, 179, 113),
    icon: COIN.id,
    label: '+$5',
    money: 5,
    tooltip: 'Earn $5',
  },

  {
    color: rgb(220, 20, 60),
    icon: SKULLER.id,
    label: '-15',
    score: -15,
    tooltip: 'Lose 15 points',
  },

  {
    color: rgb(139, 0, 0),
    icon: MONEY_BAG.id,
    label: '-$3',
    money: -3,
    tooltip: 'Pay $3',
  },

  {
    color: rgb(100, 200, 255),
    icon: SPARKLES.id,
    label: '+25%',
    multiplier: 1.25,
    tooltip: 'Total score ×1.25',
  },

  {
    color: rgb(180, 100, 200),
    icon: SPIKE.id,
    label: '-15%',
    multiplier: 0.85,
    tooltip: 'Total score ×0.85',
  },

  {
    artifact: true,
    color: rgb(200, 100, 200),
    icon: HOME.id,
    label: 'Artifact',
    tooltip: 'Land here to gain a random artifact',
  },

  {
    color: rgb(34, 139, 34),
    icon: APPLE.id,
    label: '+5',
    score: 5,
    tooltip: 'Score 5 points',
  },

  {
    color: rgb(65, 105, 225),
    icon: STAR.id,
    label: '+35',
    score: 35,
    tooltip: 'Score 35 points',
  },

  {
    color: rgb(50, 205, 50),
    icon: COIN.id,
    label: '+$8',
    money: 8,
    tooltip: 'Earn $8',
  },

  {
    color: rgb(178, 34, 34),
    icon: TGA.id,
    label: '-$5',
    money: -5,
    tooltip: 'Pay $5',
  },

  {
    color: rgb(255, 69, 0),
    icon: PUMPKA.id,
    label: '-10',
    score: -10,
    tooltip: 'Lose 10 points',
  },

  {
    color: rgb(255, 165, 0),
    icon: SPARK.id,
    label: '+10%',
    multiplier: 1.1,
    tooltip: 'Total score ×1.1',
  },

  {
    color: rgb(180, 60, 80),
    icon: KARAT.id,
    label: '-10%',
    multiplier: 0.9,
    tooltip: 'Total score ×0.9',
  },

  {
    color: rgb(200, 50, 50),
    endRound: true,
    icon: SKULLER.id,
    label: 'End',
    tooltip: 'End the round',
  },
]
