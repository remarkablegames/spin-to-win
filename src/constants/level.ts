import type { PoolUpgradeId } from './shop'

interface ArtifactCostWeightMultiplier {
  maxCost?: number
  minCost?: number
  multiplier: number
}

export interface LevelShopConfig {
  artifactCostWeightMultipliers?: ArtifactCostWeightMultiplier[]
  maxArtifactCost?: number
  poolUpgradeWeightMultipliers?: Partial<Record<PoolUpgradeId, number>>
}

interface Level {
  roundsPerLevel: number
  shop?: LevelShopConfig
  targetScore: number
}

export const LEVELS: Level[] = [
  // level 1
  {
    roundsPerLevel: 3,
    shop: {
      artifactCostWeightMultipliers: [
        { maxCost: 3, multiplier: 1.8 },
        { minCost: 4, maxCost: 6, multiplier: 1.2 },
      ],
      maxArtifactCost: 6,
      poolUpgradeWeightMultipliers: {
        addMultiplierSegment: 1.15,
        cloneSegment: 0.5,
        deleteSegment: 0.25,
        permanentBaseSpin: 0.5,
        upgradeMoneySegment: 1.7,
        upgradeScoreSegment: 1.7,
        upgradePassiveIncome: 1.15,
      },
    },
    targetScore: 100,
  },

  // level 2
  {
    roundsPerLevel: 3,
    shop: {
      artifactCostWeightMultipliers: [
        { maxCost: 6, multiplier: 1.2 },
        { minCost: 12, multiplier: 0.8 },
      ],
      poolUpgradeWeightMultipliers: {
        deleteSegment: 0.8,
        upgradeMoneySegment: 1.25,
        upgradeScoreSegment: 1.25,
      },
    },
    targetScore: 250,
  },

  // level 3
  {
    roundsPerLevel: 3,
    shop: {
      artifactCostWeightMultipliers: [
        { maxCost: 6, multiplier: 1.0 },
        { minCost: 7, maxCost: 12, multiplier: 1.2 },
        { minCost: 18, multiplier: 0.6 },
      ],
      poolUpgradeWeightMultipliers: {
        cloneSegment: 1.2,
        deleteSegment: 1.2,
        upgradeMoneySegment: 1.0,
        upgradeScoreSegment: 1.0,
      },
    },
    targetScore: 500,
  },

  // level 4
  {
    roundsPerLevel: 3,
    shop: {
      artifactCostWeightMultipliers: [
        { maxCost: 6, multiplier: 0.8 },
        { minCost: 7, maxCost: 12, multiplier: 1.1 },
        { minCost: 13, maxCost: 20, multiplier: 1.3 },
        { minCost: 21, multiplier: 0.5 },
      ],
      poolUpgradeWeightMultipliers: {
        cloneSegment: 1.5,
        deleteSegment: 1.5,
        upgradeMoneySegment: 0.9,
        upgradeScoreSegment: 0.9,
        addMultiplierSegment: 1.2,
      },
    },
    targetScore: 1000,
  },

  // level 5
  { roundsPerLevel: 3, targetScore: 2000 },
]

export const BASE_SPINS = 3
