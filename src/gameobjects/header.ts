import { COLOR } from '../constants'

const HEADER_HEIGHT = 160
const TEXT_SIZE = 20
const LINE_HEIGHT = 28
const CENTER_X = () => width() / 2
const TOP_Y = 16

const PROGRESS_BAR_WIDTH = 200
const PROGRESS_BAR_HEIGHT = 8

export function addHeader() {
  add([rect(width(), HEADER_HEIGHT), pos(), color(COLOR.BROWN)])

  const levelLabel = add([
    text('', { align: 'center', size: TEXT_SIZE }),
    pos(CENTER_X(), TOP_Y),
    anchor('top'),
    color(COLOR.DARK_BROWN),
  ])

  const roundLabel = add([
    text('', { align: 'center', size: TEXT_SIZE }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT),
    anchor('top'),
    color(COLOR.MEDIUM_BROWN),
  ])

  const moneyLabel = add([
    text('', {
      align: 'center',
      size: TEXT_SIZE,
      styles: {
        dim: { color: COLOR.LIGHT_GREEN },
      },
    }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT * 2),
    anchor('top'),
    color(COLOR.GREEN),
  ])

  const scoreLabel = add([
    text('', {
      align: 'center',
      size: TEXT_SIZE,
      styles: {
        gold: { color: COLOR.GOLD },
      },
    }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT * 3),
    anchor('top'),
    color(COLOR.LIGHT_BROWN),
  ])

  add([
    rect(PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT, { radius: 4 }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT * 4 + 4),
    anchor('top'),
    color(COLOR.MEDIUM_BROWN),
    opacity(0.4),
  ])

  const progressBarFill = add([
    rect(0, PROGRESS_BAR_HEIGHT, { radius: 4 }),
    pos(CENTER_X() - PROGRESS_BAR_WIDTH / 2, TOP_Y + LINE_HEIGHT * 4 + 4),
    anchor('topleft'),
    color(COLOR.GOLD),
  ])

  return {
    setLevel(level: number) {
      levelLabel.text = `Level ${String(level)}`
    },
    setRound(current: number, total: number) {
      roundLabel.text = `Round ${String(current)}/${String(total)}`
    },
    setScore(current: number, target: number) {
      scoreLabel.text = `[gold]${String(current)}[/gold]/${String(target)}`
      const ratio = Math.min(1, Math.max(0, current / target))
      progressBarFill.width = PROGRESS_BAR_WIDTH * ratio
    },
    setMoney(money: number, delta = 0) {
      moneyLabel.text = `$${String(money)} [dim](${delta >= 0 ? '+' : ''}$${String(delta)})[/dim]`
    },
  }
}
