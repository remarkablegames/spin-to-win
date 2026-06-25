import { COLOR, LEVEL, SCENE } from '../constants'
import { addButton, addGrid, addHeader, addMuteButton } from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import type { ArtifactSlot } from '../types'

interface EndState {
  artifacts?: ArtifactSlot[]
  baseSpins?: number
  extraSpins?: number
  levelIndex: number
  levelScore: number
  money: number
  passiveIncome?: number
  segments?: WheelSegment[]
  wheelAngle?: number
}

const BUTTON_OFFSET = 64
const RESULT_TEXT_TOP = 200

scene(SCENE.END, (state: EndState) => {
  addMuteButton()
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
    label: canAdvance ? 'Next Level' : 'Main Menu',
    onClick: () => {
      if (!canAdvance) {
        go(SCENE.TITLE)
        return
      }

      go(SCENE.GAME, {
        artifacts: state.artifacts,
        baseSpins: state.baseSpins,
        extraSpins: state.extraSpins,
        levelIndex: state.levelIndex + 1,
        levelScore: state.levelScore,
        money: state.money,
        passiveIncome: state.passiveIncome,
        roundIndex: -1,
        segments: state.segments,
        wheelAngle: state.wheelAngle,
      })
    },
    shadowColor: COLOR.DARK_GREEN,
    x: center().x,
    y: RESULT_TEXT_TOP + BUTTON_OFFSET,
  })
})
