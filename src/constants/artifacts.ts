import type { Artifact, ArtifactId, ArtifactRarity } from '../types'
import {
  ARROW,
  COIN,
  CROSS_MARK,
  EGG,
  FLOWY,
  JAM,
  PLUS,
  SPARK,
  SPIDER_WEB,
  STAR,
  SUN,
  WATERMELON,
} from './sprite'

export const ARTIFACT_SLOTS = 5

export const ARTIFACTS: Record<ArtifactId, Artifact> = {
  doubleNextSegment: {
    id: 'doubleNextSegment',
    type: 'active',
    name: 'Double Next Segment',
    description: 'Doubles the score and money of the next spin',
    icon: STAR.id,
    cost: 6,
    rarity: 'rare',
    maxCharges: 1,
  },

  boostNextScore: {
    id: 'boostNextScore',
    type: 'active',
    name: 'Boost Next Score',
    description: 'The next spin gives +50% score',
    icon: JAM.id,
    cost: 3,
    rarity: 'common',
    maxCharges: 1,
  },

  boostNextMoney: {
    id: 'boostNextMoney',
    type: 'active',
    name: 'Boost Next Money',
    description: 'The next spin gives +50% money',
    icon: COIN.id,
    cost: 3,
    rarity: 'common',
    maxCharges: 1,
  },

  boostNextMultiplier: {
    id: 'boostNextMultiplier',
    type: 'active',
    name: 'Boost Next Multiplier',
    description: 'Landing on a multiplier segment increases its value by +25%',
    icon: SPARK.id,
    cost: 6,
    rarity: 'uncommon',
    maxCharges: 1,
  },

  extendSpin: {
    id: 'extendSpin',
    type: 'active',
    name: 'Extend Spin',
    description: 'Moves to the next segment before the spin ends',
    icon: ARROW.id,
    cost: 3,
    rarity: 'common',
    maxCharges: 1,
  },

  stopSpin: {
    id: 'stopSpin',
    type: 'active',
    name: 'Stop Spin',
    description: 'Stops the wheel from spinning',
    icon: SPIDER_WEB.id,
    cost: 3,
    rarity: 'uncommon',
    maxCharges: 1,
  },

  skipNextNegative: {
    id: 'skipNextNegative',
    type: 'active',
    name: 'Skip Negative',
    description:
      'If the next spin lands on a negative segment, ignore its effect',
    icon: CROSS_MARK.id,
    cost: 6,
    rarity: 'uncommon',
    maxCharges: 1,
  },

  blankNextSegment: {
    id: 'blankNextSegment',
    type: 'active',
    name: 'Blank Segment',
    description: 'Select a segment to treat as blank for the next spin',
    icon: EGG.id,
    cost: 3,
    rarity: 'uncommon',
    maxCharges: 1,
  },

  luckyCoin: {
    id: 'luckyCoin',
    type: 'passive',
    name: 'Lucky Coin',
    description: 'Unused spins give +$1 at the end of the round',
    icon: SUN.id,
    cost: 9,
    rarity: 'rare',
  },

  extraRoundSpin: {
    id: 'extraRoundSpin',
    type: 'passive',
    name: 'Extra Round Spin',
    description: 'Adds +2 extra spins per round',
    icon: PLUS.id,
    cost: 9,
    rarity: 'rare',
  },

  scoreGrowth: {
    id: 'scoreGrowth',
    type: 'passive',
    name: 'Score Growth',
    description:
      'Landing on a score segment permanently increases its value by +5',
    icon: FLOWY.id,
    cost: 9,
    rarity: 'rare',
  },

  segmentCollector: {
    id: 'segmentCollector',
    type: 'passive',
    name: 'Segment Collector',
    description: 'Each wheel segment gives +2 score at the end of the round',
    icon: WATERMELON.id,
    cost: 9,
    rarity: 'rare',
  },
}

export const RARITY_WEIGHTS: Record<ArtifactRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 20,
}
