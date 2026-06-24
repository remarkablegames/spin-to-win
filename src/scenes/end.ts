import { COLOR, LEVEL, SCENE } from '../constants'
import { addButton, addGrid, addHeader } from '../gameobjects'

interface EndState {
  levelIndex: number
  levelScore: number
  money: number
}

const BUTTON_OFFSET = 64
const RESULT_TEXT_TOP = 200

scene(SCENE.END, (state: EndState) => {
  addGrid()

  const header = addHeader()

  const level = LEVEL.LEVELS[state.levelIndex]
  const isWin = state.levelScore >= level.targetScore
  const isLastLevel = state.levelIndex >= LEVEL.LEVELS.length - 1

  header.setLevel(state.levelIndex + 1)
  header.setRound(level.roundsPerLevel, level.roundsPerLevel)
  header.setScore(state.levelScore, level.targetScore)
  header.setMoney(state.money)

  const resultLabel = isWin
    ? isLastLevel
      ? 'You Won!'
      : 'Level Complete'
    : 'Level Failed'
  const resultColor = isWin ? COLOR.GOLD : COLOR.RED

  add([
    text(resultLabel, { align: 'center', size: 32 }),
    pos(center().x, RESULT_TEXT_TOP),
    anchor('center'),
    color(resultColor),
  ])

  const canAdvance = isWin && !isLastLevel

  addButton({
    buttonColor: COLOR.GREEN,
    label: canAdvance ? 'Next Level' : 'Restart',
    onClick: () => {
      go(
        SCENE.GAME,
        canAdvance
          ? {
              levelIndex: state.levelIndex + 1,
              money: state.money,
              roundIndex: -1,
            }
          : undefined,
      )
    },
    shadowColor: COLOR.DARK_GREEN,
    x: center().x,
    y: RESULT_TEXT_TOP + BUTTON_OFFSET,
  })
})
