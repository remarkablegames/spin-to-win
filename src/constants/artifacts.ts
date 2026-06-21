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

export type ArtifactRarity = 'common' | 'uncommon' | 'rare'

export type ActiveArtifactId =
  | 'doubleNextSegment'
  | 'boostNextScore'
  | 'boostNextMoney'
  | 'boostNextMultiplier'
  | 'extendSpin'
  | 'skipNextNegative'
  | 'blankNextSegment'

export type PassiveArtifactId = 'luckyCoin' | 'extraRoundSpin' | 'scoreGrowth'

export type ArtifactId = ActiveArtifactId | PassiveArtifactId

export interface ArtifactBase {
  id: ArtifactId
  name: string
  description: string
  icon: string
  cost: number
  rarity: ArtifactRarity
}

export interface ActiveArtifact extends ArtifactBase {
  type: 'active'
  maxCharges: number
}

export interface PassiveArtifact extends ArtifactBase {
  type: 'passive'
}

export type Artifact = ActiveArtifact | PassiveArtifact

export type ArtifactSlot =
  | { type: 'active'; id: ActiveArtifactId; charges: number }
  | { type: 'passive'; id: PassiveArtifactId }

export const ARTIFACT_SLOTS = 3

export const ARTIFACTS: Record<ArtifactId, Artifact> = {
  doubleNextSegment: {
    id: 'doubleNextSegment',
    type: 'active',
    name: 'Double Next Segment',
    description:
      'Doubles the score and money of the next spin, including negative effects.',
    icon: STAR,
    cost: 12,
    rarity: 'rare',
    maxCharges: 1,
  },
  boostNextScore: {
    id: 'boostNextScore',
    type: 'active',
    name: 'Boost Next Score',
    description: 'The next spin gives +50% score.',
    icon: HEART,
    cost: 5,
    rarity: 'common',
    maxCharges: 1,
  },
  boostNextMoney: {
    id: 'boostNextMoney',
    type: 'active',
    name: 'Boost Next Money',
    description: 'The next spin gives +50% money.',
    icon: COIN,
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
    icon: SPARK,
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
    icon: ARROW,
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
    icon: CROSS_MARK,
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
    icon: TRASH,
    cost: 7,
    rarity: 'uncommon',
    maxCharges: 1,
  },
  luckyCoin: {
    id: 'luckyCoin',
    type: 'passive',
    name: 'Lucky Coin',
    description: 'At the end of each round, each unused spin gives +$1.',
    icon: COIN,
    cost: 10,
    rarity: 'rare',
  },
  extraRoundSpin: {
    id: 'extraRoundSpin',
    type: 'passive',
    name: 'Extra Round Spin',
    description: 'Adds +2 extra spins to the total spins available each round.',
    icon: PLUS,
    cost: 12,
    rarity: 'rare',
  },
  scoreGrowth: {
    id: 'scoreGrowth',
    type: 'passive',
    name: 'Score Growth',
    description:
      "Each time the wheel lands on a segment with a score value, that segment's score is permanently increased by +5.",
    icon: GRAPE,
    cost: 10,
    rarity: 'rare',
  },
}

export const RARITY_WEIGHTS: Record<ArtifactRarity, number> = {
  common: 50,
  uncommon: 30,
  rare: 20,
}

export function getArtifactById(id: ArtifactId): Artifact {
  return ARTIFACTS[id]
}

export function isActiveArtifact(id: ArtifactId): id is ActiveArtifactId {
  return getArtifactById(id).type === 'active'
}

export function isPassiveArtifact(id: ArtifactId): id is PassiveArtifactId {
  return getArtifactById(id).type === 'passive'
}

export function getActiveArtifacts(): ActiveArtifact[] {
  return Object.values(ARTIFACTS).filter(
    (artifact): artifact is ActiveArtifact => artifact.type === 'active',
  )
}

export function getPassiveArtifacts(): PassiveArtifact[] {
  return Object.values(ARTIFACTS).filter(
    (artifact): artifact is PassiveArtifact => artifact.type === 'passive',
  )
}

export function getArtifactsByRarity(rarity: ArtifactRarity): Artifact[] {
  return Object.values(ARTIFACTS).filter(
    (artifact) => artifact.rarity === rarity,
  )
}

export function getRandomArtifacts(
  count: number,
  exclude: ArtifactId[] = [],
): ArtifactId[] {
  const candidates = Object.values(ARTIFACTS).filter(
    (artifact) => !exclude.includes(artifact.id),
  )

  if (candidates.length === 0) {
    return []
  }

  const result: ArtifactId[] = []
  const used = new Set<ArtifactId>()

  for (let i = 0; i < count; i++) {
    if (candidates.length === used.size) {
      break
    }

    const remaining = candidates
      .filter((artifact) => !used.has(artifact.id))
      .reduce((sum, artifact) => sum + RARITY_WEIGHTS[artifact.rarity], 0)
    let roll = rand(0, remaining)

    for (const artifact of candidates) {
      if (used.has(artifact.id)) {
        continue
      }

      roll -= RARITY_WEIGHTS[artifact.rarity]

      if (roll <= 0) {
        result.push(artifact.id)
        used.add(artifact.id)
        break
      }
    }
  }

  return result
}

export function getSellRefund(artifactId: ArtifactId): number {
  return Math.floor(getArtifactById(artifactId).cost / 2)
}

export function hasArtifact(
  artifacts: ArtifactSlot[],
  id: PassiveArtifactId,
): boolean {
  return artifacts.some((slot) => slot.id === id)
}

export function addArtifactSlot(
  artifacts: ArtifactSlot[],
  id: ArtifactId,
): ArtifactSlot[] {
  if (artifacts.length >= ARTIFACT_SLOTS) {
    return artifacts
  }

  if (isActiveArtifact(id)) {
    const existing = artifacts.find(
      (slot): slot is Extract<ArtifactSlot, { type: 'active' }> =>
        slot.type === 'active' && slot.id === id,
    )
    if (existing) {
      existing.charges += 1
      return artifacts
    }
    return [...artifacts, { type: 'active', id, charges: 1 }]
  }

  if (artifacts.some((slot) => slot.id === id)) {
    return artifacts
  }
  return [...artifacts, { type: 'passive', id }]
}

export function removeArtifactSlot(
  artifacts: ArtifactSlot[],
  id: ArtifactId,
): ArtifactSlot[] {
  if (isActiveArtifact(id)) {
    return artifacts
      .map((slot) =>
        slot.type === 'active' && slot.id === id
          ? { ...slot, charges: slot.charges - 1 }
          : slot,
      )
      .filter(
        (slot): slot is ArtifactSlot =>
          slot.type !== 'active' || slot.charges > 0,
      )
  }
  return artifacts.filter((slot) => slot.id !== id)
}
