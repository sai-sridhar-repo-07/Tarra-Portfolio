import { useRef, useState, useCallback } from 'react'

/**
 * Creates a magnetic hover effect where the element attracts toward the cursor.
 * @param {number} strength - How strongly the element moves (0–1). Default: 0.4
 * @param {number} radius - Activation radius in pixels. Default: 100
 */
export function useMagneticEffect(strength = 0.4, radius = 100) {
  const ref = useRef(null)
  const [transform, setTransform] = useState({ x: 0, y: 0 })
  const animFrameRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = e.clientX - centerX
    const y = e.clientY - centerY
    const distance = Math.sqrt(x * x + y * y)

    if (distance < radius) {
      const factor = (radius - distance) / radius
      const targetX = x * factor * strength
      const targetY = y * factor * strength

      // Cancel previous frame and schedule new one
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(() => {
        setTransform({ x: targetX, y: targetY })
      })
    }
  }, [strength, radius])

  const handleMouseLeave = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    setTransform({ x: 0, y: 0 })
  }, [])

  return {
    ref,
    transform,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  }
}
