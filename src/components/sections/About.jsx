import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionHeading from '../ui/SectionHeading'
import { personal } from '../../data/personal'

gsap.registerPlugin(ScrollTrigger)

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', decimal = false, inView }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    const totalSteps = 80
    const step = 20
    let frame = 0
    const timer = setInterval(() => {
      frame++
      const progress = frame / totalSteps
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = value * eased
      setCount(decimal ? parseFloat(current.toFixed(1)) : Math.floor(current))
      if (frame >= totalSteps) { setCount(value); clearInterval(timer) }
    }, step)
    return () => clearInterval(timer)
  }, [inView, value, decimal])

  return <span>{decimal ? count.toFixed(1) : count}{suffix}</span>
}

// ── Profile Image Block ───────────────────────────────────────────────────────
function ProfileBlock() {
  const imgRef = useRef(null)

  // GSAP subtle float on scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex justify-center lg:justify-start"
    >
      <div ref={imgRef} className="relative">
        {/* Glow aura */}
        <motion.div
          className="absolute -inset-4 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.15))' }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Animated gradient border */}
        <motion.div
          className="absolute -inset-px rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4, #8B5CF6)',
            backgroundSize: '200%',
            animation: 'gradient-x 4s linear infinite',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Photo placeholder */}
        <div
          className="relative w-64 h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1A1A1A 0%, #2A2A2A 100%)' }}
        >
          {/* Silhouette avatar */}
          <div className="absolute inset-0 flex items-end justify-center pb-6">
            <div
              className="w-36 h-48 rounded-t-full opacity-50"
              style={{ background: 'linear-gradient(to top, #8B5CF6, #A78BFA40)' }}
            />
          </div>
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          />
          <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-dark to-transparent" />
        </div>

        {/* Floating stat badges */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-10 -bottom-6 glass rounded-xl px-4 py-3 border border-white/10 shadow-glass"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">🧠</div>
            <div>
              <p className="text-white text-sm font-bold">2+ Years</p>
              <p className="text-zinc-500 text-xs">ML Experience</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -left-10 top-12 glass rounded-xl px-3 py-2.5 border border-white/10"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🏆</span>
            <div>
              <p className="text-white text-xs font-bold">Accenture</p>
              <p className="text-zinc-500 text-xs">@ ML Eng.</p>
            </div>
          </div>
        </motion.div>

        {/* Top-right floating pulse ring */}
        <div className="absolute -top-4 -right-4">
          <motion.div
            className="w-8 h-8 rounded-full border border-purple-500/40"
            animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-purple-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Bio Text (GSAP line-by-line reveal) ──────────────────────────────────────
function AnimatedBio() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bio-line',
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="space-y-3">
      <p className="bio-line text-zinc-300 text-base md:text-lg leading-relaxed">{personal.bio}</p>
      <p className="bio-line text-zinc-400 text-sm leading-relaxed">
        I've worked at{' '}
        <span className="text-white font-medium">Accenture</span>,{' '}
        <span className="text-white font-medium">Career Crate</span> — building infrastructure that powers frontier AI research.
      </p>
      <p className="bio-line text-zinc-400 text-sm leading-relaxed">
        When I'm not training models, I write about ML, contribute to open source, and explore the
        latest from NeurIPS and ICML.
      </p>
    </div>
  )
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function About() {
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.3, triggerOnce: true })

  // Stagger tags
  const tags = ['LLMs', 'RLHF', 'Distributed Training', 'MLOps', 'Computer Vision', 'RAG Systems']

  return (
    <section id="about" className="py-24 md:py-36 relative overflow-hidden">
      {/* Bg decoration */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-600/5 blur-3xl rounded-full pointer-events-none" />

      <div className="section-container">
        <SectionHeading
          label="About"
          title="Who I Am"
          subtitle="Building at the frontier of AI — from research to production."
          className="mb-16 md:mb-24"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">
          {/* Profile image */}
          <ProfileBlock />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-7"
          >
            {/* Animated bio */}
            <AnimatedBio />

            {/* Tags with stagger */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={{
                animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
              className="flex flex-wrap gap-2"
            >
              {tags.map((tag) => (
                <motion.span
                  key={tag}
                  variants={{
                    initial: { opacity: 0, scale: 0.8, y: 10 },
                    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
                  }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="tag cursor-default"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>

            {/* Stats */}
            <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {personal.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  className="glass rounded-xl p-4 border border-white/5 text-center relative overflow-hidden group cursor-default"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="font-display font-black text-xl gradient-text">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} decimal={stat.decimal} inView={statsInView} />
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-4 pt-1">
              <motion.a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Download Resume ↗
              </motion.a>
              <motion.a
                href={`mailto:${personal.email}`}
                className="btn-secondary text-sm"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Let's Talk
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
