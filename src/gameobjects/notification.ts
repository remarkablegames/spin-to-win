import type { Color, Vec2 } from 'kaplay'

export function addNotification(
  message: string,
  messageColor: Color,
  position: Vec2,
) {
  const label = add([
    text(message, { size: 24 }),
    pos(position),
    anchor('center'),
    color(messageColor),
    opacity(),
    scale(),
    lifespan(1.5, { fade: 0.5 }),
  ])

  label.scale = vec2(1.5)
  tween(
    label.scale.x,
    1,
    0.5,
    (value) => {
      label.scale = vec2(value)
    },
    easings.easeOutBack,
  )

  return label
}
