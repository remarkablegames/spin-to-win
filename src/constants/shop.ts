import type { Color } from 'kaplay'

import {
  APPLE,
  COIN,
  GRAPE,
  HEART,
  HOME,
  KARAT,
  LIGHTNING,
  MONEY_BAG,
  PUMPKA,
  SKULLER,
  SPARK,
  SPIKE,
  STAR,
  TGA,
} from './sprite'

export const BASE_PASSIVE_INCOME = 3
export const PASSIVE_INCOME_UPGRADE_AMOUNT = 1
export const PASSIVE_INCOME_UPGRADE_BASE_COST = 8
export const PASSIVE_INCOME_UPGRADE_COST_INCREMENT = 4
export const PASSIVE_INCOME_UPGRADE_MAX = 3

export const EXTRA_SPIN_BASE_COST = 1
export const EXTRA_SPIN_COST_INCREMENT = 1

export const UPGRADE_SCORE_SEGMENT_BASE_COST = 5
export const UPGRADE_SCORE_SEGMENT_COST_INCREMENT = 2
export const UPGRADE_SCORE_SEGMENT_AMOUNT = 25

export const UPGRADE_MONEY_SEGMENT_BASE_COST = 5
export const UPGRADE_MONEY_SEGMENT_COST_INCREMENT = 2
export const UPGRADE_MONEY_SEGMENT_AMOUNT = 3

export const ADD_MULTIPLIER_SEGMENT_COST = 8
export const MULTIPLIER_SEGMENT_POSITIVE_CHANCE = 0.7
export const MULTIPLIER_SEGMENT_POSITIVE_VALUE = 1.25
export const MULTIPLIER_SEGMENT_NEGATIVE_VALUE = 0.85

export const CLONE_SEGMENT_BASE_COST = 10

export const PERMANENT_BASE_SPIN_BASE_COST = 10
export const PERMANENT_BASE_SPIN_COST_INCREMENT = 5

export const DELETE_SEGMENT_BASE_COST = 15
export const DELETE_SEGMENT_COST_INCREMENT = 5
export const DELETE_SEGMENT_MIN_SEGMENTS = 5

export type PoolUpgradeId =
  | 'upgradeScoreSegment'
  | 'upgradeMoneySegment'
  | 'addMultiplierSegment'
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
    label: `Upgrade Score Segment ($${String(UPGRADE_SCORE_SEGMENT_BASE_COST)})`,
    baseCost: UPGRADE_SCORE_SEGMENT_BASE_COST,
    tooltip: `Boost a score segment by +${String(UPGRADE_SCORE_SEGMENT_AMOUNT)}`,
  },

  {
    id: 'upgradeMoneySegment',
    weight: 25,
    label: `Upgrade Money Segment ($${String(UPGRADE_MONEY_SEGMENT_BASE_COST)})`,
    baseCost: UPGRADE_MONEY_SEGMENT_BASE_COST,
    tooltip: `Boost a money segment by +$${String(UPGRADE_MONEY_SEGMENT_AMOUNT)}`,
  },

  {
    id: 'addMultiplierSegment',
    weight: 20,
    label: `Add Multiplier Segment ($${String(ADD_MULTIPLIER_SEGMENT_COST)})`,
    baseCost: ADD_MULTIPLIER_SEGMENT_COST,
    tooltip: `Add a score multiplier segment to the wheel`,
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
    label: `Permanent Base Spin ($${String(PERMANENT_BASE_SPIN_BASE_COST)})`,
    baseCost: PERMANENT_BASE_SPIN_BASE_COST,
    tooltip: `Permanently add +1 spin to every round`,
  },

  {
    id: 'deleteSegment',
    weight: 8,
    label: `Delete Segment ($${String(DELETE_SEGMENT_BASE_COST)})`,
    baseCost: DELETE_SEGMENT_BASE_COST,
    tooltip: `Permanently remove a segment from the wheel`,
  },

  {
    id: 'upgradePassiveIncome',
    weight: 10,
    label: `Upgrade Income ($${String(PASSIVE_INCOME_UPGRADE_BASE_COST)})`,
    baseCost: PASSIVE_INCOME_UPGRADE_BASE_COST,
    tooltip: `Earn +$${String(PASSIVE_INCOME_UPGRADE_AMOUNT)} more money each round`,
  },
]

export interface FillTemplate {
  artifact?: boolean
  color: Color
  endRound?: boolean
  icon: string
  label: string
  money: number
  multiplier?: number
  score: number
  tooltip: string
}

export const FILL_TEMPLATES: FillTemplate[] = [
  {
    color: rgb(255, 99, 71),
    icon: HEART.id,
    label: '+10',
    money: 0,
    score: 10,
    tooltip: 'Score 10 points',
  },

  {
    color: rgb(128, 128, 128),
    icon: GRAPE.id,
    label: '+25',
    money: 0,
    score: 25,
    tooltip: 'Score 25 points',
  },

  {
    color: rgb(30, 144, 255),
    icon: STAR.id,
    label: '+50',
    money: 0,
    score: 50,
    tooltip: 'Score 50 points',
  },

  {
    color: rgb(255, 215, 0),
    icon: COIN.id,
    label: '+$3',
    money: 3,
    score: 0,
    tooltip: 'Earn $3',
  },

  {
    color: rgb(60, 179, 113),
    icon: COIN.id,
    label: '+$5',
    money: 5,
    score: 0,
    tooltip: 'Earn $5',
  },

  {
    color: rgb(220, 20, 60),
    icon: SKULLER.id,
    label: '-15',
    money: 0,
    score: -15,
    tooltip: 'Lose 15 points',
  },

  {
    color: rgb(139, 0, 0),
    icon: MONEY_BAG.id,
    label: '-$3',
    money: -3,
    score: 0,
    tooltip: 'Pay $3',
  },

  {
    color: rgb(100, 200, 255),
    icon: LIGHTNING.id,
    label: '+25%',
    money: 0,
    multiplier: 1.25,
    score: 0,
    tooltip: 'Total score ×1.25',
  },

  {
    color: rgb(180, 100, 200),
    icon: SPIKE.id,
    label: '-15%',
    money: 0,
    multiplier: 0.85,
    score: 0,
    tooltip: 'Total score ×0.85',
  },

  {
    artifact: true,
    color: rgb(200, 100, 200),
    icon: HOME.id,
    label: 'Artifact',
    money: 0,
    score: 0,
    tooltip: 'Land here to gain a random artifact',
  },

  {
    color: rgb(34, 139, 34),
    icon: APPLE.id,
    label: '+5',
    money: 0,
    score: 5,
    tooltip: 'Score 5 points',
  },

  {
    color: rgb(65, 105, 225),
    icon: STAR.id,
    label: '+35',
    money: 0,
    score: 35,
    tooltip: 'Score 35 points',
  },

  {
    color: rgb(50, 205, 50),
    icon: COIN.id,
    label: '+$8',
    money: 8,
    score: 0,
    tooltip: 'Earn $8',
  },

  {
    color: rgb(178, 34, 34),
    icon: TGA.id,
    label: '-$5',
    money: -5,
    score: 0,
    tooltip: 'Pay $5',
  },

  {
    color: rgb(255, 69, 0),
    icon: PUMPKA.id,
    label: '-10',
    money: 0,
    score: -10,
    tooltip: 'Lose 10 points',
  },

  {
    color: rgb(255, 165, 0),
    icon: SPARK.id,
    label: '+10%',
    money: 0,
    multiplier: 1.1,
    score: 0,
    tooltip: 'Total score ×1.1',
  },

  {
    color: rgb(120, 120, 140),
    icon: KARAT.id,
    label: '-10%',
    money: 0,
    multiplier: 0.9,
    score: 0,
    tooltip: 'Total score ×0.9',
  },

  {
    color: rgb(200, 50, 50),
    endRound: true,
    icon: SKULLER.id,
    label: 'End',
    money: 0,
    score: 0,
    tooltip: 'End the round',
  },
]
