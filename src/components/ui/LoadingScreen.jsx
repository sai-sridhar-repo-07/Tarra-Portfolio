import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Premium loading screen with:
 * - Animated logo reveal
 * - Progress bar
 * - Smooth fade-out transition
 */
export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Simulate loading progress
    const intervals = [
      { delay: 100, value: 25 },
      { delay: 400, value: 55 },
      { delay: 800, value: 78 },
      { delay: 1300, value: 95 },
      { delay: 1700, value: 100 },
    ]

    const timers = intervals.map(({ delay, value }) =>
      setTimeout(() => setProgress(value), delay)
    )

    // Begin exit animation after loading
    const exitTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onComplete?.(), 600)
    }, 2200)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(exitTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="blob w-96 h-96 bg-purple-600/20 -top-20 -left-20 animate-blob" />
            <div className="blob w-80 h-80 bg-cyan-600/15 bottom-20 right-20 animate-blob-delayed" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Logo box */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                  boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)',
                }}
              >
                <motion.span
                  className="text-3xl font-black text-white font-display"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  S
                </motion.span>
              </div>
            </motion.div>

            {/* Name */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h1 className="text-xl font-bold text-white font-display tracking-tight">
                Sai Sridhar Tarra
              </h1>
              <p className="text-zinc-500 text-sm mt-1 tracking-widest uppercase">
                ML · AI · Engineer
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-48 flex flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <div className="h-px bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)',
                    width: `${progress}%`,
                    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
              <span className="text-xs text-zinc-600 text-right tabular-nums">
                {progress}%
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
