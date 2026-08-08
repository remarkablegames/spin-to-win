import { isDesktop } from './device'

/** Horizontal center for the shop's offer buttons. */
export const getShopButtonX = () =>
  isDesktop() ? width() * 0.65 : width() * 0.7

interface WheelLayoutOptions {
  bottomReserved: number
  contentTop: number
  defaultRadius: number
  /** Largest the wheel is allowed to grow to fill extra space. Defaults to `defaultRadius` (no growth). */
  maxRadius?: number
  minRadius: number
  topReserved: number
}

interface WheelLayout {
  /** Top of the reserved block (topReserved + wheel + bottomReserved). */
  blockTop: number
  radius: number
  wheelCenterY: number
}

/**
 * Computes a wheel radius and vertical center that fits within the space
 * between `contentTop` and the bottom of the screen, reserving `topReserved`
 * px above the wheel and `bottomReserved` px below it (e.g. for a pointer,
 * buttons, etc). The wheel radius scales with the available space (clamped
 * between `minRadius` and `maxRadius`), and any leftover slack is split
 * evenly above and below the block so it stays centered.
 */
export function computeWheelLayout({
  bottomReserved,
  contentTop,
  defaultRadius,
  maxRadius = defaultRadius,
  minRadius,
  topReserved,
}: WheelLayoutOptions): WheelLayout {
  const contentHeight = height() - contentTop
  const availableForWheel = contentHeight - topReserved - bottomReserved
  const radius = Math.min(maxRadius, Math.max(minRadius, availableForWheel / 2))

  const usedHeight = topReserved + radius * 2 + bottomReserved
  const blockTop = contentTop + Math.max(0, contentHeight - usedHeight) / 2

  return {
    blockTop,
    radius,
    wheelCenterY: blockTop + topReserved + radius,
  }
}
