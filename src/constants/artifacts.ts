import type { Artifact, ArtifactId, ArtifactRarity } from '../types'
import {
  ARROW,
  COIN,
  CROSS_MARK,
  GRAPE,
  HEART,
  PLUS,
  SPARK,
  STAR,
  TRASH,
} from './sprite'

export const ARTIFACT_SLOTS = 3

export const ARTIFACTS: Record<ArtifactId, Artifact> = {
  doubleNextSegment: {
    id: 'doubleNextSegment',
    type: 'active',
    name: 'Double Next Segment',
    description:
      'Doubles the score and money of the next spin, including negative effects.',
    icon: STAR.id,
    cost: 12,
    rarity: 'rare',
    maxCharges: 1,
  },
  boostNextScore: {
    id: 'boostNextScore',
    type: 'active',
    name: 'Boost Next Score',
    description: 'The next spin gives +50% score.',
    icon: HEART.id,
    cost: 5,
    rarity: 'common',
    maxCharges: 1,
  },
  boostNextMoney: {
    id: 'boostNextMoney',
    type: 'active',
    name: 'Boost Next Money',
    description: 'The next spin gives +50% money.',
    icon: COIN.id,
    cost: 5,
    rarity: 'common',
    maxCharges: 1,
  },
  boostNextMultiplier: {
    id: 'boostNextMultiplier',
    type: 'active',
    name: 'Boost Next Multiplier',
    description:
      'If the next spin lands on a multiplier segment, the multiplier value is increased by +0.25.',
    icon: SPARK.id,
    cost: 8,
    rarity: 'uncommon',
    maxCharges: 1,
  },
  extendSpin: {
    id: 'extendSpin',
    type: 'active',
    name: 'Extend Spin',
    description:
      'During a spin, adds one extra segment worth of rotation so the wheel lands on the next segment.',
    icon: ARROW.id,
    cost: 6,
    rarity: 'common',
    maxCharges: 1,
  },
  skipNextNegative: {
    id: 'skipNextNegative',
    type: 'active',
    name: 'Skip Next Negative',
    description:
      'If the next spin lands on a negative segment, ignore its effect.',
    icon: CROSS_MARK.id,
    cost: 8,
    rarity: 'uncommon',
    maxCharges: 1,
  },
  blankNextSegment: {
    id: 'blankNextSegment',
    type: 'active',
    name: 'Blank Next Segment',
    description:
      'Select a segment before the next spin. That segment is treated as blank for that spin.',
    icon: TRASH.id,
    cost: 7,
    rarity: 'uncommon',
    maxCharges: 1,
  },
  luckyCoin: {
    id: 'luckyCoin',
    type: 'passive',
    name: 'Lucky Coin',
    description: 'At the end of each round, each unused spin gives +$1.',
    icon: COIN.id,
    cost: 10,
    rarity: 'rare',
  },
  extraRoundSpin: {
    id: 'extraRoundSpin',
    type: 'passive',
    name: 'Extra Round Spin',
    description: 'Adds +2 extra spins to the total spins available each round.',
    icon: PLUS.id,
    cost: 12,
    rarity: 'rare',
  },
  scoreGrowth: {
    id: 'scoreGrowth',
    type: 'passive',
    name: 'Score Growth',
    description:
      "Each time the wheel lands on a segment with a score value, that segment's score is permanently increased by +5.",
    icon: GRAPE.id,
    cost: 10,
    rarity: 'rare',
  },
}

export const RARITY_WEIGHTS: Record<ArtifactRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 20,
}
