import type { AudioPlayOpt } from 'kaplay'

import { SOUND } from '../constants'
import type { WheelSegment } from '../gameobjects/wheel'
import type { Sound } from '../types'

type SoundId = Sound['id']

const SOUND_BY_ID = Object.values(SOUND).reduce<Record<SoundId, Sound>>(
  (sounds, sound) => ({
    ...sounds,
    [sound.id]: sound,
  }),
  {},
)

export function playSound(id: SoundId, options: AudioPlayOpt = {}) {
  const sound = SOUND_BY_ID[id]

  return play(sound.id, {
    volume: sound.volume,
    ...options,
  })
}

export function playWheelTick() {
  playSound(SOUND.WHEEL_TICK.id, {
    detune: randi(-1, 2) * 50,
    volume: rand(0.2, SOUND.WHEEL_TICK.volume),
  })
}

export function playRewardSound(segment: WheelSegment) {
  if (segment.blank) {
    return
  }

  if (segment.artifact) {
    playSound(SOUND.ARTIFACT.id)
    return
  }

  if (segment.multiplier !== undefined) {
    playSound(
      segment.multiplier < 1
        ? SOUND.NEGATIVE_REWARD.id
        : SOUND.POSITIVE_REWARD.id,
    )
    return
  }

  if (segment.score < 0 || segment.money < 0) {
    playSound(SOUND.NEGATIVE_REWARD.id)
    return
  }

  if (segment.score > 0 || segment.money > 0) {
    playSound(SOUND.POSITIVE_REWARD.id)
  }
}
