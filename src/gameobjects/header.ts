import { COLOR } from '../constants'
import { addTooltip } from './tooltip'

const HEADER_HEIGHT = 130
const TEXT_SIZE = 20
const LINE_HEIGHT = 28
const CENTER_X = () => width() / 2
const TOP_Y = 16

const PROGRESS_BAR_WIDTH = 200
const PROGRESS_BAR_HEIGHT = 8

export function addHeader() {
  add([rect(width(), HEADER_HEIGHT), pos(), color(COLOR.BROWN)])

  const levelRoundLabel = add([
    text('', {
      align: 'center',
      size: TEXT_SIZE,
      styles: {
        level: { color: COLOR.MEDIUM_BROWN },
        round: { color: COLOR.LIGHT_BROWN },
      },
    }),
    pos(CENTER_X(), TOP_Y),
    anchor('top'),
  ])

  const moneyLabel = add([
    text('', {
      align: 'center',
      size: TEXT_SIZE,
      styles: {
        dim: { color: COLOR.LIGHT_GREEN },
      },
    }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT),
    anchor('top'),
    color(COLOR.GREEN),
    area(),
  ])

  const moneyTooltip = addTooltip({
    anchor: 'top',
    target: moneyLabel,
    text: 'Money is used to buy things in the shop',
  })

  moneyLabel.onHover(() => {
    moneyTooltip.show()
  })
  moneyLabel.onHoverEnd(() => {
    moneyTooltip.hide()
  })

  const scoreLabel = add([
    text('', {
      align: 'center',
      size: TEXT_SIZE,
      styles: {
        gold: { color: COLOR.GOLD },
      },
    }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT * 2),
    anchor('top'),
    color(COLOR.LIGHT_BROWN),
    area(),
  ])

  const scoreTooltip = addTooltip({
    anchor: 'top',
    target: scoreLabel,
    text: '',
  })

  scoreLabel.onHover(() => {
    scoreTooltip.show()
  })
  scoreLabel.onHoverEnd(() => {
    scoreTooltip.hide()
  })

  add([
    rect(PROGRESS_BAR_WIDTH, PROGRESS_BAR_HEIGHT, { radius: 4 }),
    pos(CENTER_X(), TOP_Y + LINE_HEIGHT * 3 + 4),
    anchor('top'),
    color(COLOR.MEDIUM_BROWN),
    opacity(0.4),
  ])

  const progressBarFill = add([
    rect(0, PROGRESS_BAR_HEIGHT, { radius: 4 }),
    pos(CENTER_X() - PROGRESS_BAR_WIDTH / 2, TOP_Y + LINE_HEIGHT * 3 + 4),
    anchor('topleft'),
    color(COLOR.GOLD),
  ])

  let currentLevel = 0

  return {
    setLevel(level: number) {
      currentLevel = level
    },
    setRound(current: number, total: number) {
      levelRoundLabel.text = `[level]Level ${String(currentLevel)},[/level] [round]Round ${String(current)}/${String(total)}[/round]`
    },
    setScore(current: number, target: number) {
      scoreLabel.text = `[gold]${String(current)}[/gold]/${String(target)}`
      scoreTooltip.setText(`Score ${String(target)} points to clear the level`)
      const ratio = Math.min(1, Math.max(0, current / target))
      progressBarFill.width = PROGRESS_BAR_WIDTH * ratio
    },
    setMoney(money: number, delta = 0) {
      if (!delta) {
        moneyLabel.text = `$${String(money)}`
      } else {
        moneyLabel.text = `$${String(money)} [dim](${delta >= 0 ? '+' : ''}$${String(delta)})[/dim]`
      }
    },
  }
}
