import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionHeading from '../ui/SectionHeading'
import { skillCategories } from '../../data/skills'

gsap.registerPlugin(ScrollTrigger)

// ── Skill Card with Animated Bar ──────────────────────────────────────────────
function SkillCard({ skill, index, inView }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.045, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -5, scale: 1.03 }}
      className="relative group glass rounded-xl p-4 border border-white/5 hover:border-purple-500/30 transition-colors duration-300 overflow-hidden cursor-default"
    >
      {/* Background glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{ background: `radial-gradient(circle at 50% 100%, ${skill.color}18, transparent 70%)` }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Top-right glow dot */}
      <motion.div
        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
        style={{ background: skill.color }}
        animate={inView ? { opacity: [0, 1, 0.6], scale: [0.5, 1.3, 1] } : {}}
        transition={{ delay: index * 0.045 + 0.3, duration: 0.5 }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
            {skill.name}
          </span>
          <motion.span
            className="text-xs font-bold font-mono tabular-nums"
            style={{ color: skill.color }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: index * 0.045 + 0.5 }}
          >
            {skill.level}%
          </motion.span>
        </div>

        {/* Bar track */}
        <div className="h-1.5 bg-dark-300 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${skill.color}80, ${skill.color})`,
              boxShadow: hovered ? `0 0 10px ${skill.color}60, 0 0 20px ${skill.color}30` : 'none',
            }}
            initial={{ width: 0 }}
            animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
            transition={{
              delay: index * 0.045 + 0.2,
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {/* Proficiency label on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          className="mt-2 text-xs font-medium"
          style={{ color: skill.color }}
        >
          {skill.level >= 90 ? 'Expert' : skill.level >= 80 ? 'Advanced' : skill.level >= 70 ? 'Proficient' : 'Intermediate'}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Category Tab ──────────────────────────────────────────────────────────────
function CategoryTab({ cat, active, onClick }) {
  return (
    <button
      onClick={() => onClick(cat.id)}
      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {active && (
        <motion.div
          layoutId="skill-tab"
          className="absolute inset-0 rounded-xl bg-purple-600/20 border border-purple-500/30"
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        />
      )}
      <span className="relative z-10 text-base">{cat.icon}</span>
      <span className="relative z-10">{cat.label}</span>
    </button>
  )
}

// ── Marquee tech strip ────────────────────────────────────────────────────────
const TECH_STRIP = [
  'PyTorch', 'TensorFlow', 'JAX', 'CUDA', 'Python', 'Go', 'Rust',
  'Kubernetes', 'Docker', 'AWS', 'GCP', 'Ray', 'Airflow', 'FastAPI',
]

function TechMarquee() {
  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient masks */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-dark to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {[...TECH_STRIP, ...TECH_STRIP].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 glass border border-white/5 rounded-full px-4 py-1.5 text-zinc-400 text-xs font-medium whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60" />
            {t}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('ml')
  const { ref, inView } = useInView({ threshold: 0.05, triggerOnce: true })
  const sectionRef = useRef(null)

  const currentCategory = skillCategories.find((c) => c.id === activeCategory)

  // GSAP entrance for the section title
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.skills-grid-item',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.skills-grid',
            start: 'top 85%',
            toggleActions: 'play none none reset',
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [activeCategory]) // re-run when category changes

  return (
    <section id="skills" ref={sectionRef} className="py-24 md:py-36 relative overflow-hidden">
      {/* BG */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/5 blur-3xl rounded-full pointer-events-none" />
      <div className="dot-bg absolute inset-0 opacity-25 pointer-events-none" />

      <div className="section-container">
        <SectionHeading
          label="Expertise"
          title="Skills & Tools"
          subtitle="A comprehensive look at my technical toolkit — built over years of shipping production ML systems."
          centered
          className="mb-14"
        />

        {/* Category tabs */}
        <div className="flex justify-center mb-12">
          <div className="glass rounded-2xl p-1.5 border border-white/5 flex gap-1 flex-wrap justify-center">
            {skillCategories.map((cat) => (
              <CategoryTab
                key={cat.id}
                cat={cat}
                active={activeCategory === cat.id}
                onClick={setActiveCategory}
              />
            ))}
          </div>
        </div>

        {/* Skill grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="skills-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12"
          >
            {currentCategory?.skills.map((skill, i) => (
              <SkillCard key={skill.name} skill={skill} index={i} inView={inView} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Tech marquee strip */}
        <div className="mt-4">
          <p className="text-zinc-600 text-xs text-center mb-4 tracking-widest uppercase font-medium">
            Also working with
          </p>
          <TechMarquee />
        </div>
      </div>
    </section>
  )
}
