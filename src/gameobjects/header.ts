import { COLOR } from '../constants'

const HEADER_HEIGHT = 112

const UI_TEXT_SIZE = 20
const UI_LINE_SPACING = 4

export function addHeader() {
  add([rect(width(), HEADER_HEIGHT), pos(0, 0), color(COLOR.BROWN)])

  const infoLabel = add([
    text('', {
      align: 'center',
      lineSpacing: UI_LINE_SPACING,
      size: UI_TEXT_SIZE,
    }),
    pos(width() / 2, HEADER_HEIGHT / 2),
    anchor('center'),
  ])

  return {
    setText(value: string) {
      infoLabel.text = value
    },
  }
}
