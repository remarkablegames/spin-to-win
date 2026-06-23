interface Level {
  roundsPerLevel: number
  targetScore: number
}

export const LEVELS: Level[] = [
  { roundsPerLevel: 3, targetScore: 100 },
  { roundsPerLevel: 3, targetScore: 200 },
  { roundsPerLevel: 3, targetScore: 300 },
]

export const BASE_SPINS = 1
