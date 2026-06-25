import { COLOR, LEVEL, SCENE, SOUND } from '../constants'
import {
  addButton,
  addGrid,
  addHeader,
  addMuteButton,
  addProgressBar,
  addShadowText,
} from '../gameobjects'
import type { WheelSegment } from '../gameobjects/wheel'
import type { ArtifactSlot } from '../types'
import { playSound } from '../utils'

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

const ANIMATE_DURATION = 1.5
const SCORE_FILL_INTERVAL = 0.1
const PROGRESS_BAR_WIDTH = 400
const PROGRESS_BAR_HEIGHT = 20
const TITLE_Y = 175
const PROGRESS_BAR_Y = 225
const SCORE_LABEL_Y = 270
const SUBMIT_BUTTON_Y = 335

scene(SCENE.END, (state: EndState) => {
  addMuteButton()
  addGrid()

  const header = addHeader()

  const level = LEVEL.LEVELS[state.levelIndex]
  const isWin = state.levelScore >= level.targetScore
  const isLastLevel = state.levelIndex >= LEVEL.LEVELS.length - 1
  const finalRatio = Math.min(1, state.levelScore / level.targetScore)
  const carryOverScore = Math.max(0, state.levelScore - level.targetScore)

  header.setLevel(state.levelIndex + 1)
  header.setRound(level.roundsPerLevel, level.roundsPerLevel)
  header.setScore(state.levelScore, level.targetScore)
  header.setMoney(state.money)

  const { text: titleText, shadow: titleShadow } = addShadowText({
    align: 'center',
    color: COLOR.GOLD,
    pos: { x: center().x, y: TITLE_Y },
    size: 36,
    text: 'Level End',
  })

  const scoreLabel = add([
    text(
      `[numerator]0[/numerator][denominator]/${String(level.targetScore)}[/denominator]`,
      {
        align: 'center',
        size: 26,
        styles: {
          denominator: { color: COLOR.BROWN },
          numerator: { color: COLOR.GOLD },
        },
      },
    ),
    pos(center().x, SCORE_LABEL_Y),
    anchor('center'),
  ])

  const centerBar = addProgressBar({
    x: center().x,
    y: PROGRESS_BAR_Y,
    width: PROGRESS_BAR_WIDTH,
    height: PROGRESS_BAR_HEIGHT,
  })

  const submitButton = addButton({
    buttonColor: COLOR.GREEN,
    label: 'Submit Score',
    onClick: () => {
      submitButton.hide()

      const tickLoop = loop(SCORE_FILL_INTERVAL, () => {
        playSound(SOUND.SCORE_FILL.id)
      })

      const animateDuration = Math.max(
        SCORE_FILL_INTERVAL,
        ANIMATE_DURATION * finalRatio,
      )
      header.animateScore(animateDuration)
      centerBar.animateTo(
        finalRatio,
        animateDuration,
        () => {
          tickLoop.cancel()

          playSound(isWin ? SOUND.LEVEL_COMPLETE.id : SOUND.LEVEL_FAILED.id)

          const resultLabel = isWin
            ? isLastLevel
              ? 'You Won!'
              : 'Level Complete!'
            : 'Level Failed'
          titleText.text = resultLabel
          titleText.color = isWin ? COLOR.GREEN : COLOR.RED
          titleShadow.text = resultLabel

          const canAdvance = isWin && !isLastLevel

          addButton({
            buttonColor: isWin ? COLOR.GREEN : COLOR.RED,
            label: canAdvance ? 'Next Level' : isWin ? 'Main Menu' : 'Restart',
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
                levelScore: carryOverScore,
                money: state.money,
                passiveIncome: state.passiveIncome,
                roundIndex: -1,
                segments: state.segments,
                wheelAngle: state.wheelAngle,
              })
            },
            shadowColor: isWin ? COLOR.DARK_GREEN : COLOR.DARK_RED,
            x: center().x,
            y: SUBMIT_BUTTON_Y,
          })
        },
        (ratio) => {
          const current = Math.round(ratio * level.targetScore)
          scoreLabel.text = `[numerator]${String(current)}[/numerator][denominator]/${String(level.targetScore)}[/denominator]`
        },
      )
    },
    shadowColor: COLOR.DARK_GREEN,
    x: center().x,
    y: SUBMIT_BUTTON_Y,
  })
})
