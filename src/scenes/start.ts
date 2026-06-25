import './cover'
import './end'
import './game'
import './preload'
import './shop'
import './title'

import { SCENE } from '../constants'

export function start() {
  go(SCENE.PRELOAD)
}
