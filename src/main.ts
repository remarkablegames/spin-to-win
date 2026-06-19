import kaplay from 'kaplay'

kaplay({
  background: [176, 146, 126],
})

const { start } = await import('./scenes')

start()

// press F1
// debug.inspect = true
