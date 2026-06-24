import { ARTIFACT } from '../constants'
import type { LevelShopConfig } from '../constants/level'
import type {
  ActiveArtifact,
  ActiveArtifactId,
  Artifact,
  ArtifactId,
  ArtifactRarity,
  ArtifactSlot,
  PassiveArtifact,
  PassiveArtifactId,
} from '../types'

export function getArtifactById(id: ArtifactId): Artifact {
  return ARTIFACT.ARTIFACTS[id]
}

export function isActiveArtifact(id: ArtifactId): id is ActiveArtifactId {
  return getArtifactById(id).type === 'active'
}

export function isPassiveArtifact(id: ArtifactId): id is PassiveArtifactId {
  return getArtifactById(id).type === 'passive'
}

export function getActiveArtifacts(): ActiveArtifact[] {
  return Object.values(ARTIFACT.ARTIFACTS).filter(
    (artifact): artifact is ActiveArtifact => artifact.type === 'active',
  )
}

export function getPassiveArtifacts(): PassiveArtifact[] {
  return Object.values(ARTIFACT.ARTIFACTS).filter(
    (artifact): artifact is PassiveArtifact => artifact.type === 'passive',
  )
}

export function getArtifactsByRarity(rarity: ArtifactRarity): Artifact[] {
  return Object.values(ARTIFACT.ARTIFACTS).filter(
    (artifact) => artifact.rarity === rarity,
  )
}

export function getRandomArtifacts(
  count: number,
  exclude: ArtifactId[] = [],
  shopConfig?: LevelShopConfig,
): ArtifactId[] {
  const allCandidates = Object.values(ARTIFACT.ARTIFACTS).filter(
    (artifact) => !exclude.includes(artifact.id),
  )
  const maxArtifactCost = shopConfig?.maxArtifactCost
  const availableCandidates =
    maxArtifactCost !== undefined
      ? allCandidates.filter((artifact) => artifact.cost <= maxArtifactCost)
      : allCandidates
  const candidates =
    availableCandidates.length >= count ? availableCandidates : allCandidates

  if (candidates.length === 0) {
    return []
  }

  const result: ArtifactId[] = []
  const used = new Set<ArtifactId>()

  function getLevelWeight(artifact: Artifact): number {
    const rarityWeight = ARTIFACT.RARITY_WEIGHTS[artifact.rarity]
    const costMultiplier =
      shopConfig?.artifactCostWeightMultipliers?.find(
        ({ maxCost, minCost }) =>
          (minCost === undefined || artifact.cost >= minCost) &&
          (maxCost === undefined || artifact.cost <= maxCost),
      )?.multiplier ?? 1

    return rarityWeight * costMultiplier
  }

  for (let i = 0; i < count; i++) {
    if (candidates.length === used.size) {
      break
    }

    const remaining = candidates
      .filter((artifact) => !used.has(artifact.id))
      .reduce((sum, artifact) => sum + getLevelWeight(artifact), 0)
    let roll = rand(0, remaining)

    for (const artifact of candidates) {
      if (used.has(artifact.id)) {
        continue
      }

      roll -= getLevelWeight(artifact)

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
  if (artifacts.length >= ARTIFACT.ARTIFACT_SLOTS) {
    return artifacts
  }

  if (artifacts.some((slot) => slot.id === id)) {
    return artifacts
  }

  if (isActiveArtifact(id)) {
    return [...artifacts, { type: 'active', id, charges: 1 }]
  }

  return [...artifacts, { type: 'passive', id }]
}

export function spendArtifactCharge(
  artifacts: ArtifactSlot[],
  id: ActiveArtifactId,
): ArtifactSlot[] {
  return artifacts.map((slot) =>
    slot.type === 'active' && slot.id === id
      ? { ...slot, charges: Math.max(0, slot.charges - 1) }
      : slot,
  )
}

export function rechargeArtifacts(artifacts: ArtifactSlot[]): ArtifactSlot[] {
  return artifacts.map((slot) => {
    if (slot.type !== 'active') {
      return slot
    }
    const def = ARTIFACT.ARTIFACTS[slot.id] as ActiveArtifact
    return { ...slot, charges: def.maxCharges }
  })
}

export function removeArtifactSlot(
  artifacts: ArtifactSlot[],
  id: ArtifactId,
): ArtifactSlot[] {
  return artifacts.filter((slot) => slot.id !== id)
}
