import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

/**
 * Reusable section heading with:
 * - Small label/eyebrow text
 * - Large gradient headline
 * - Subtext description
 * - Animated reveal on scroll
 */
export default function SectionHeading({ label, title, subtitle, centered = false, className = '' }) {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true })

  const containerClass = centered
    ? 'flex flex-col items-center text-center'
    : 'flex flex-col'

  return (
    <motion.div
      ref={ref}
      className={`${containerClass} ${className}`}
      initial="initial"
      animate={inView ? 'animate' : 'initial'}
    >
      {/* Label / Eyebrow */}
      {label && (
        <motion.div
          variants={{
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="inline-flex items-center gap-2 mb-4"
        >
          <span className="w-6 h-px bg-purple-500" />
          <span className="text-purple-400 text-xs font-semibold tracking-widest uppercase">
            {label}
          </span>
          <span className="w-6 h-px bg-purple-500" />
        </motion.div>
      )}

      {/* Main Title */}
      <div className="overflow-hidden mb-4">
        <motion.h2
          variants={{
            initial: { y: '100%', opacity: 0 },
            animate: {
              y: '0%',
              opacity: 1,
              transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.05 },
            },
          }}
          className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight gradient-text"
        >
          {title}
        </motion.h2>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
            },
          }}
          className={`text-zinc-400 text-base md:text-lg leading-relaxed ${centered ? 'max-w-2xl' : 'max-w-xl'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}
