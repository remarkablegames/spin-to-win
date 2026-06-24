import type { Sound } from '../types'

export const BUTTON_CLICK: Sound = {
  id: 'buttonClick',
  src: '/sounds/click_002.mp3',
  volume: 0.45,
}

export const BUTTON_HOVER: Sound = {
  id: 'buttonHover',
  src: '/sounds/drop_003.mp3',
  volume: 0.25,
}

export const WHEEL_TICK: Sound = {
  id: 'wheelTick',
  src: '/sounds/tick_001.mp3',
  volume: 0.3,
}

export const POSITIVE_REWARD: Sound = {
  id: 'positiveReward',
  src: '/sounds/confirmation_001.mp3',
  volume: 0.55,
}

export const NEGATIVE_REWARD: Sound = {
  id: 'negativeReward',
  src: '/sounds/error_008.mp3',
  volume: 0.55,
}

export const INVALID_ACTION: Sound = {
  id: 'invalidAction',
  src: '/sounds/error_006.mp3',
  volume: 0.45,
}

export const ARTIFACT: Sound = {
  id: 'artifact',
  src: '/sounds/drop_004.mp3',
  volume: 0.5,
}

export const SHOP_PURCHASE: Sound = {
  id: 'shopPurchase',
  src: '/sounds/kaching.mp3',
  volume: 0.55,
}
