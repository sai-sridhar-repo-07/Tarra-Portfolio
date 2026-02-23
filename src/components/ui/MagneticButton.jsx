import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Magnetic button that attracts toward the cursor when hovered.
 * Wraps any children with the magnetic effect.
 *
 * @param {number} strength - Movement strength (0–1). Default: 0.35
 * @param {number} radius - Activation radius in pixels. Default: 80
 * @param {string} className - Additional class names
 */
export default function MagneticButton({ children, className = '', strength = 0.35, radius = 80, onClick, ...props }) {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius) {
      const factor = ((radius - dist) / radius) * strength
      setPosition({ x: dx * factor, y: dy * factor })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      className={`magnetic-btn ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
