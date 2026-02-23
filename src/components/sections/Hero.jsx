import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { FiArrowRight, FiGithub } from 'react-icons/fi'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import MagneticButton from '../ui/MagneticButton'
import { personal } from '../../data/personal'

gsap.registerPlugin(ScrollTrigger)

// Fixed positions — no Math.random() to avoid hydration drift on re-render
const PARTICLES = [
  { x: 15, y: 20, s: 2.5, d: 0.0, dur: 6, c: 0 },
  { x: 82, y: 12, s: 1.5, d: 1.2, dur: 8, c: 1 },
  { x: 45, y: 75, s: 2,   d: 0.5, dur: 7, c: 2 },
  { x: 90, y: 55, s: 1,   d: 2.0, dur: 5, c: 0 },
  { x: 7,  y: 60, s: 3,   d: 0.8, dur: 9, c: 1 },
  { x: 60, y: 8,  s: 1.5, d: 1.5, dur: 6, c: 2 },
  { x: 30, y: 90, s: 2,   d: 3.0, dur: 7, c: 0 },
  { x: 72, y: 35, s: 1,   d: 0.2, dur: 8, c: 1 },
  { x: 55, y: 50, s: 2.5, d: 2.5, dur: 6, c: 2 },
  { x: 20, y: 40, s: 1.5, d: 1.0, dur: 9, c: 0 },
  { x: 88, y: 80, s: 2,   d: 0.7, dur: 7, c: 1 },
  { x: 40, y: 25, s: 1,   d: 3.5, dur: 5, c: 2 },
  { x: 65, y: 88, s: 3,   d: 1.8, dur: 8, c: 0 },
  { x: 12, y: 80, s: 1.5, d: 0.3, dur: 6, c: 1 },
  { x: 77, y: 62, s: 2,   d: 2.2, dur: 7, c: 2 },
  { x: 35, y: 55, s: 1,   d: 4.0, dur: 9, c: 0 },
  { x: 50, y: 30, s: 2.5, d: 0.9, dur: 6, c: 1 },
  { x: 92, y: 30, s: 1.5, d: 1.6, dur: 8, c: 2 },
]
const PARTICLE_COLORS = ['#8B5CF6', '#06B6D4', '#A78BFA']

// ── Particles ────────────────────────────────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            background: PARTICLE_COLORS[p.c],
          }}
          animate={{ y: [0, -28, 0], opacity: [0.15, 0.55, 0.15], scale: [1, 1.8, 1] }}
          transition={{ delay: p.d, duration: p.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// ── Mouse Spotlight ──────────────────────────────────────────────────────────
function MouseSpotlight({ containerRef }) {
  const [pos, setPos] = useState({ x: -9999, y: -9999 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    el.addEventListener('mousemove', handleMove)
    return () => el.removeEventListener('mousemove', handleMove)
  }, [containerRef])

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(520px circle at ${pos.x}px ${pos.y}px, rgba(139,92,246,0.07), transparent 50%)`,
        transition: 'background 0.1s ease',
      }}
    />
  )
}

// ── Animated Mesh Blobs ──────────────────────────────────────────────────────
function MeshBlobs({ mouseX, mouseY }) {
  const b1x = useTransform(mouseX, [-1, 1], [-25, 25])
  const b1y = useTransform(mouseY, [-1, 1], [-25, 25])
  const b2x = useTransform(mouseX, [-1, 1], [25, -25])
  const b2y = useTransform(mouseY, [-1, 1], [25, -25])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main purple blob */}
      <motion.div
        className="blob w-[700px] h-[700px] bg-purple-600/25"
        style={{ top: '-15%', left: '-10%', x: b1x, y: b1y }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Cyan blob */}
      <motion.div
        className="blob w-[550px] h-[550px] bg-cyan-500/18"
        style={{ bottom: '0%', right: '-8%', x: b2x, y: b2y }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      {/* Accent blob */}
      <motion.div
        className="blob w-[400px] h-[400px] bg-violet-600/18"
        style={{ top: '35%', left: '40%', x: b1x, y: b2y }}
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Rotating orbit ring — large */}
      <motion.div
        className="absolute"
        style={{ top: '12%', right: '10%', width: 220, height: 220 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full rounded-full" style={{ border: '1px solid rgba(139,92,246,0.15)' }} />
        <div className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: '#8B5CF6', boxShadow: '0 0 10px #8B5CF6, 0 0 20px #8B5CF640' }} />
      </motion.div>

      {/* Counter-rotating orbit — small */}
      <motion.div
        className="absolute"
        style={{ bottom: '22%', left: '6%', width: 100, height: 100 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-full h-full rounded-full" style={{ border: '1px solid rgba(6,182,212,0.2)' }} />
        <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 translate-y-1/2"
          style={{ background: '#06B6D4', boxShadow: '0 0 8px #06B6D4' }} />
      </motion.div>

      {/* Grid + vignette */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 25%, #0D0D0D 80%)' }} />
    </div>
  )
}

// ── Animated Terminal Card ────────────────────────────────────────────────────
function TerminalCard() {
  const lines = [
    { text: '$ python train.py \\', color: '#A78BFA', delay: 1.4 },
    { text: '    --model llama-7b \\', color: '#71717A', delay: 1.7 },
    { text: '    --gpus 512 --bf16', color: '#71717A', delay: 2.0 },
    { text: '', color: '', delay: 2.2 },
    { text: '✓ 512 GPUs initialized', color: '#34D399', delay: 2.5 },
    { text: '  step  500 | loss 2.341', color: '#60A5FA', delay: 2.9 },
    { text: '  step 1500 | loss 1.892', color: '#60A5FA', delay: 3.2 },
    { text: '  step 3000 | loss 1.204 ↓', color: '#34D399', delay: 3.5 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-xl border border-white/8 overflow-hidden shadow-glass"
      style={{ width: 268, animation: 'float 7s ease-in-out 1s infinite' }}
    >
      {/* Traffic light bar */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/3 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-zinc-500 text-xs font-mono">train.py — zsh</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed space-y-0.5">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: line.delay, duration: 0.3 }}
            style={{ color: line.color || 'transparent', minHeight: '1.25rem' }}
          >
            {line.text}
            {i === lines.length - 1 && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-1.5 h-3.5 bg-purple-400 ml-0.5 align-middle"
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Small Floating Stat Card ──────────────────────────────────────────────────
function FloatCard({ icon, title, subtitle, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className="glass rounded-xl px-4 py-3 border border-white/8 shadow-glass"
      style={{ width: 200, animation: `float ${7 + delay}s ease-in-out ${delay * 0.4}s infinite` }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm bg-purple-500/15">
          {icon}
        </div>
        <div>
          <p className="text-white text-xs font-bold">{title}</p>
          <p className="text-zinc-500 text-xs">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Headline ─────────────────────────────────────────────────────────────────
function HeroHeadline() {
  const words = ['Machine', 'Learning', 'Engineer.']
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
      {words.map((word, i) => (
        <div key={word} className="overflow-hidden">
          <motion.span
            className="block font-display font-black leading-none"
            style={{
              fontSize: 'clamp(2.8rem, 8.2vw, 7rem)',
              letterSpacing: '-0.03em',
              ...(i === 1
                ? {
                    background: 'linear-gradient(135deg, #A78BFA 0%, #06B6D4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }
                : { color: '#F8F8F8' }),
            }}
            initial={{ y: '115%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.13, duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
          >
            {word}
          </motion.span>
        </div>
      ))}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function Hero() {
  const containerRef = useRef(null)
  const mouseXRaw = useMotionValue(0)
  const mouseYRaw = useMotionValue(0)
  const mouseX = useSpring(mouseXRaw, { stiffness: 40, damping: 20 })
  const mouseY = useSpring(mouseYRaw, { stiffness: 40, damping: 20 })

  useEffect(() => {
    const handleMove = (e) => {
      mouseXRaw.set((e.clientX / window.innerWidth) * 2 - 1)
      mouseYRaw.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseXRaw, mouseYRaw])

  // GSAP scroll parallax — content slides up as hero leaves view
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero-inner', {
        y: 90,
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero-section',
          start: 'top top',
          end: '70% top',
          scrub: 1.2,
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero-section"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-start overflow-hidden"
    >
      {/* Background layers */}
      <MeshBlobs mouseX={mouseX} mouseY={mouseY} />
      <ParticleField />
      <MouseSpotlight containerRef={containerRef} />

      {/* Content */}
      <div className="hero-inner section-container relative z-10 pt-28 pb-36 md:pt-36 md:pb-44 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-12 xl:gap-20 items-center">

          {/* ── Left: Text ── */}
          <div className="max-w-4xl">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="inline-flex items-center gap-3 mb-8 glass border border-white/8 rounded-full px-4 py-2"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                <motion.span
                  className="w-2 h-2 rounded-full bg-green-400 inline-block"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {personal.availability}
              </span>
              <span className="w-px h-3.5 bg-white/15" />
              <span className="text-xs text-zinc-500 font-medium">{personal.location}</span>
            </motion.div>

            {/* Headline */}
            <HeroHeadline />

            {/* Name */}
            <div className="overflow-hidden mb-6">
              <motion.div
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ delay: 0.87, duration: 0.65, ease: [0.33, 1, 0.68, 1] }}
                className="flex items-center gap-3"
              >
                <span
                  className="font-display font-black gradient-text-purple"
                  style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.8rem)', letterSpacing: '-0.03em' }}
                >
                  I'm Sai Sridhar.
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-px w-20 origin-left"
                  style={{ background: 'linear-gradient(90deg, #8B5CF6, transparent)' }}
                />
              </motion.div>
            </div>

            {/* Typewriter */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mb-10 h-8 flex items-center gap-2 text-zinc-400 text-lg md:text-xl font-medium"
            >
              <span>I build</span>
              <span className="text-purple-400 font-semibold">
                <TypeAnimation
                  sequence={[
                    'LLMs from scratch.', 2200,
                    'production ML pipelines.', 2200,
                    'distributed training systems.', 2200,
                    'multimodal AI systems.', 2200,
                    'next-gen AI products.', 2200,
                  ]}
                  wrapper="span"
                  speed={55}
                  repeat={Infinity}
                />
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex flex-wrap gap-4 items-center mb-14"
            >
              <MagneticButton strength={0.3}>
                <button
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary flex items-center gap-2 relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">View Work</span>
                  <motion.span
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </motion.span>
                </button>
              </MagneticButton>

              <MagneticButton strength={0.3}>
                <a
                  href={personal.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
              </MagneticButton>

              <motion.a
                href={`mailto:${personal.email}`}
                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                Get in touch →
              </motion.a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="flex flex-wrap gap-8 pt-8 border-t border-white/5"
            >
              {personal.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.65 + i * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col cursor-default origin-left"
                >
                  <span className="font-display font-black text-2xl gradient-text">
                    {stat.decimal ? stat.value.toFixed(1) : stat.value}{stat.suffix}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium mt-0.5">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Floating cards ── */}
          <div className="hidden xl:flex flex-col gap-4 items-end">
            <TerminalCard />
            <FloatCard icon="🔥" title="PyTorch" subtitle="Core framework" delay={1.8} />
            <FloatCard icon="🤖" title="1B+ Params" subtitle="Models trained" delay={2.1} />
            <FloatCard icon="⚡" title="100K RPS" subtitle="Inference peak" delay={2.4} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase font-medium">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-zinc-700 flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-purple-400"
            animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #0D0D0D, transparent)' }}
      />
    </section>
  )
}
