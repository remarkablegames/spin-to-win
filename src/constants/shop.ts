export const BASE_PASSIVE_INCOME = 3

export const EXTRA_SPIN_BASE_COST = 2
export const EXTRA_SPIN_COST_INCREMENT = 2

export const UPGRADE_WHEEL_COST = 5
export const UPGRADE_WHEEL_AMOUNT = 5

export const ADD_SEGMENT_POSITIVE_CHANCE = 0.7

export const POSITIVE_SEGMENTS = [
  {
    color: rgb(255, 215, 0),
    icon: { sprite: 'grape', width: 30, height: 43 },
    label: '+25',
    money: 0,
    score: 25,
    tooltip: 'Score 25 points',
  },
  {
    color: rgb(60, 179, 113),
    icon: { sprite: 'coin', width: 28, height: 28 },
    label: '+$5',
    money: 5,
    score: 0,
    tooltip: 'Earn $5',
  },
]

export const NEGATIVE_SEGMENTS = [
  {
    color: rgb(220, 20, 60),
    icon: { sprite: 'skuller', width: 28, height: 30 },
    label: '-25',
    money: 0,
    score: -25,
    tooltip: 'Lose 25 points',
  },
  {
    color: rgb(139, 0, 0),
    icon: { sprite: 'money_bag', width: 35, height: 35 },
    label: '-$5',
    money: -5,
    score: 0,
    tooltip: 'Pay $5',
  },
]
