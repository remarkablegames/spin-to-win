import { SPRITE } from '../constants'

const MUTE_KEY = 'org.remarkablegames.spin-to-win.muted'
const BUTTON_SIZE = 32
const BUTTON_PADDING = 12

export function addMuteButton() {
  let muted: boolean = getData(MUTE_KEY) ?? false

  if (muted) {
    setVolume(0)
  }

  const muteButton = add([
    sprite(muted ? SPRITE.SOUNDS_OUTLINE.id : SPRITE.SOUNDS.id, {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    }),
    pos(width() - BUTTON_SIZE - BUTTON_PADDING, BUTTON_PADDING),
    anchor('topleft'),
    area(),
    z(1),
    opacity(0.7),
  ])

  muteButton.onClick(() => {
    muted = !muted
    setData(MUTE_KEY, muted)
    setVolume(muted ? 0 : 1)
    muteButton.use(
      sprite(muted ? SPRITE.SOUNDS_OUTLINE.id : SPRITE.SOUNDS.id, {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
      }),
    )
  })

  muteButton.onHover(() => {
    setCursor('pointer')
    muteButton.opacity = 1
  })

  muteButton.onHoverEnd(() => {
    setCursor('default')
    muteButton.opacity = 0.7
  })
}
