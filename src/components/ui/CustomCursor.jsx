import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Premium custom cursor with:
 * - Small dot that follows instantly
 * - Large ring that lags behind (spring animation)
 * - Expands on hover over interactive elements
 * - Color changes based on element type
 * Hidden on touch/mobile devices
 */
export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [cursorText, setCursorText] = useState('')

  // Raw mouse values (instant)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring-based values for the ring (lagging follow)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const ringX = useSpring(mouseX, springConfig)
  const ringY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    // Track hoverable elements
    const handleElementHover = (e) => {
      const target = e.target
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('magnetic-btn')

      const cursorTextAttr = target.getAttribute('data-cursor-text') ||
        target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text')

      setIsHovering(!!isInteractive)
      setCursorText(cursorTextAttr || '')
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', handleElementHover)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseover', handleElementHover)
    }
  }, [mouseX, mouseY, isVisible])

  if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
    return null
  }

  return (
    <>
      {/* Small dot — instant follow */}
      <motion.div
        className="cursor-dot"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isClicking ? 0.5 : isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Ring — spring lagging follow */}
      <motion.div
        style={{
          position: 'fixed',
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          width: isHovering ? 56 : isClicking ? 20 : 36,
          height: isHovering ? 56 : isClicking ? 20 : 36,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: isHovering
              ? '1.5px solid rgba(139, 92, 246, 0.4)'
              : '1.5px solid rgba(139, 92, 246, 0.7)',
            background: isHovering ? 'rgba(139, 92, 246, 0.06)' : 'transparent',
            transition: 'border-color 0.2s, background 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cursorText && (
            <span style={{
              color: '#A78BFA',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              {cursorText}
            </span>
          )}
        </div>
      </motion.div>
    </>
  )
}
