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
        fillBlank: 1.7,
        permanentBaseSpin: 0.5,
        upgradeMoneySegment: 1.7,
        upgradeScoreSegment: 1.7,
        upgradePassiveIncome: 1.15,
      },
    },
    targetScore: 100,
  },
  {
    roundsPerLevel: 3,
    shop: {
      artifactCostWeightMultipliers: [
        { maxCost: 6, multiplier: 1.2 },
        { minCost: 12, multiplier: 0.8 },
      ],
      poolUpgradeWeightMultipliers: {
        deleteSegment: 0.8,
        fillBlank: 1.25,
        upgradeMoneySegment: 1.25,
        upgradeScoreSegment: 1.25,
      },
    },
    targetScore: 200,
  },
  { roundsPerLevel: 3, targetScore: 300 },
]

export const BASE_SPINS = 3
