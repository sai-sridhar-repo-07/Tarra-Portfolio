import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { FiExternalLink, FiCalendar, FiMapPin } from 'react-icons/fi'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionHeading from '../ui/SectionHeading'
import { experiences } from '../../data/experience'

gsap.registerPlugin(ScrollTrigger)

// ── Timeline Entry Card ───────────────────────────────────────────────────────
function TimelineEntry({ exp, index }) {
  const ref = useRef(null)
  // Use Framer Motion's own useInView — avoids the empty-animate-object issue
  // that occurs when react-intersection-observer's inView=false gives animate={}
  const inView = useInView(ref, { once: true, amount: 0.12 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      // Always provide explicit values for both states — never pass {} as animate
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      className="relative flex gap-6 pb-10 last:pb-0"
    >
      {/* ── Left: dot + line ── */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ marginTop: 4 }}>
        {/* Animated dot */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 flex-shrink-0"
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: exp.color, opacity: 0.3 }}
            animate={inView ? { scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] } : {}}
            transition={{ delay: 0.4, duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
          {/* Icon circle */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
            style={{ background: exp.color, boxShadow: `0 0 18px ${exp.color}50, 0 0 6px ${exp.color}` }}
          >
            {exp.logo}
          </div>
        </motion.div>

        {/* Connecting line */}
        <motion.div
          className="flex-1 w-px mt-3"
          style={{ background: `linear-gradient(to bottom, ${exp.color}60, transparent)` }}
          initial={{ scaleY: 0, originY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* ── Right: card ── */}
      <motion.div
        whileHover={{ y: -3, boxShadow: `0 20px 50px rgba(0,0,0,0.4)` }}
        transition={{ duration: 0.3 }}
        className="flex-1 glass rounded-2xl border border-white/5 hover:border-purple-500/20 p-5 md:p-6 group transition-colors duration-300 mb-1"
      >
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
              {exp.role}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <a
                href={exp.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                {exp.company} <FiExternalLink size={10} />
              </a>
              <span className="text-zinc-700">·</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: `${exp.color}15`,
                  color: exp.color,
                  border: `1px solid ${exp.color}30`,
                }}
              >
                {exp.type}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <FiCalendar size={11} /> {exp.period}
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600 text-xs">
              <FiMapPin size={11} /> {exp.location}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{exp.description}</p>

        {/* Achievements with stagger */}
        <ul className="space-y-1.5 mb-4">
          {exp.achievements.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-2 text-sm text-zinc-400"
            >
              <motion.span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: exp.color }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ delay: 0.3 + i * 0.07, duration: 1, ease: 'easeInOut' }}
              />
              {item}
            </motion.li>
          ))}
        </ul>

        {/* Tech tags */}
        <motion.div
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          variants={{ animate: { transition: { staggerChildren: 0.04, delayChildren: 0.5 } } }}
          className="flex flex-wrap gap-1.5"
        >
          {exp.tech.map((t) => (
            <motion.span
              key={t}
              variants={{
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
              }}
              className="tag text-xs"
            >
              {t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ── Progress bar that grows with scroll ───────────────────────────────────────
function TimelineScrollBar({ containerRef }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 20%'],
  })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div
      className="absolute left-4 top-4 bottom-4 w-px"
      style={{ background: 'rgba(139,92,246,0.08)' }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 rounded-full"
        style={{
          height: '100%',
          scaleY,
          originY: 0,
          background: 'linear-gradient(to bottom, #8B5CF6, #06B6D4)',
        }}
      />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Experience() {
  const containerRef = useRef(null)

  return (
    <section id="experience" className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-cyan-600/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="section-container">
        <SectionHeading
          label="Journey"
          title="Experience"
          subtitle="From CMU research labs to frontier AI companies — a career built on impact."
          className="mb-14"
        />

        <div ref={containerRef} className="relative max-w-3xl">
          {/* Scroll-driven progress line */}
          <TimelineScrollBar containerRef={containerRef} />

          {/* Entries */}
          <div className="space-y-0">
            {experiences.map((exp, i) => (
              <TimelineEntry key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
