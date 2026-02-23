import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Thin gradient progress bar at the top of the viewport.
 * Tracks scroll position using Framer Motion's useScroll.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX, transformOrigin: 'left' }}
    />
  )
}
