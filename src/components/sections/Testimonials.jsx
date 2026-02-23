import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import SectionHeading from '../ui/SectionHeading'
import { testimonials } from '../../data/testimonials'

// ─── Star Rating ──────────────────────────────────────────────────────────────
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestimonialCard({ testimonial }) {
  return (
    <div className="glass rounded-2xl border border-white/8 p-7 md:p-10 max-w-2xl mx-auto">
      {/* Quote mark */}
      <div
        className="text-6xl font-black leading-none mb-4 select-none"
        style={{ color: testimonial.color, opacity: 0.3, fontFamily: 'Georgia, serif' }}
      >
        "
      </div>

      {/* Quote text */}
      <blockquote className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 italic">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${testimonial.color}, ${testimonial.color}80)` }}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{testimonial.name}</p>
          <p className="text-zinc-500 text-xs">
            {testimonial.role} · {testimonial.company}
          </p>
          <div className="mt-1">
            <Stars count={testimonial.rating} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const autoPlayRef = useRef(null)

  const goTo = (index, dir) => {
    setDirection(dir)
    setCurrent(index)
  }

  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length, -1)
  const next = () => goTo((current + 1) % testimonials.length, 1)

  // Auto-advance
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setDirection(1)
      setCurrent((c) => (c + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(autoPlayRef.current)
  }, [])

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.97,
      transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
    }),
  }

  return (
    <section id="testimonials" className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-60 bg-purple-600/8 blur-3xl rounded-full pointer-events-none" />

      <div className="section-container">
        <SectionHeading
          label="Social Proof"
          title="What People Say"
          subtitle="Kind words from colleagues and collaborators across the industry."
          centered
          className="mb-14"
        />

        <div className="relative">
          {/* Slider */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <TestimonialCard testimonial={testimonials[current]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            {/* Prev */}
            <button
              onClick={prev}
              className="w-10 h-10 glass rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-purple-500/50 transition-all duration-200"
            >
              <FiChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className={`transition-all duration-300 rounded-full ${
                    i === current
                      ? 'w-6 h-1.5 bg-purple-500'
                      : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={next}
              className="w-10 h-10 glass rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-purple-500/50 transition-all duration-200"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
