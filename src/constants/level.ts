export interface LevelConfig {
  baseSpinsPerRound: number
  roundsPerLevel: number
  targetScore: number
}

export const LEVELS: LevelConfig[] = [
  { baseSpinsPerRound: 1, roundsPerLevel: 3, targetScore: 100 },
  { baseSpinsPerRound: 1, roundsPerLevel: 4, targetScore: 200 },
  { baseSpinsPerRound: 1, roundsPerLevel: 5, targetScore: 300 },
]

export const BONUS_SPINS = 0
