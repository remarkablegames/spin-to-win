import './end'
import './game'
import './preload'
import './shop'

import { SCENE } from '../constants'

export function start() {
  go(SCENE.PRELOAD)
}
