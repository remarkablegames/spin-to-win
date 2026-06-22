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
