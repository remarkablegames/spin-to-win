import { SPRITE } from '../constants'
import type { Sprite } from '../types'

export function getSpriteById(id: string): Sprite {
  const sprite = Object.values(SPRITE).find(
    (s): s is Sprite => typeof s === 'object' && s.id === id,
  )

  if (!sprite) {
    throw new Error(`Unknown sprite id: ${id}`)
  }

  return sprite
}
