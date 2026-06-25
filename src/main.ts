import kaplay from 'kaplay'

const isCover = new URLSearchParams(location.search).get('scene') === 'cover'

kaplay({
  background: isCover ? [0, 0, 0, 0] : [176, 146, 126],
  font: 'RobotoMono',
  height: isCover ? 1024 : undefined,
  width: isCover ? 1024 : undefined,
})

const { start } = await import('./scenes')

start()

// press F1
// debug.inspect = true
