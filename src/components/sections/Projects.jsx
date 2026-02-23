import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiGithub, FiExternalLink, FiX, FiStar, FiArrowRight, FiCode } from 'react-icons/fi'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import SectionHeading from '../ui/SectionHeading'
import { projects, categories } from '../../data/projects'
import { modalBackdrop, modalContent } from '../../animations/variants'

gsap.registerPlugin(ScrollTrigger)

// ── 3D Tilt card wrapper ──────────────────────────────────────────────────────
// perspective must be on the PARENT so rotation of the child looks correct
function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    // Parent holds perspective so the child's rotation looks 3D
    <div style={{ perspective: '1000px' }} className={className}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  )
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onClick }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <TiltCard className="h-full">
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => onClick(project)}
          className="relative glass rounded-2xl border border-white/5 hover:border-purple-500/35 overflow-hidden transition-colors duration-300 h-full cursor-pointer flex flex-col group"
          whileHover={{ boxShadow: '0 20px 60px rgba(139,92,246,0.15)' }}
        >
          {/* Top banner */}
          <div className={`h-40 md:h-44 relative flex-shrink-0 bg-gradient-to-br ${project.gradient} overflow-hidden`}>
            <div className="absolute inset-0 dot-bg opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />

            {/* Hover shimmer sweep */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)', backgroundSize: '200%' }}
              animate={hovered ? { backgroundPosition: ['-200% 0', '200% 0'] } : {}}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            />

            {/* Status + stars */}
            <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                project.status === 'Production'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>{project.status}</span>
              <div className="flex items-center gap-1 text-white/70 text-xs glass rounded-full px-2.5 py-1 border border-white/10">
                <FiStar size={10} className="text-amber-400" />
                <span>{project.stars >= 1000 ? `${(project.stars / 1000).toFixed(1)}K` : project.stars}</span>
              </div>
            </div>

            {/* Category */}
            <div className="absolute bottom-3 left-4">
              <span className="text-white/50 text-xs font-medium">{project.category}</span>
            </div>

            {/* Click-to-view overlay — backdropFilter via CSS transition, opacity via Framer Motion */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backdropFilter: hovered ? 'blur(2px)' : 'blur(0px)',
                transition: 'backdrop-filter 0.25s ease',
              }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-2 text-white text-sm font-semibold bg-black/40 rounded-full px-4 py-2 border border-white/10">
                <FiCode size={14} />
                View Details
              </div>
            </motion.div>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-display font-bold text-lg text-white group-hover:text-purple-300 transition-colors mb-1 leading-tight">
              {project.title}
            </h3>
            <p className="text-zinc-600 text-xs mb-3">{project.subtitle}</p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tech.slice(0, 4).map((t) => (
                <span key={t} className="tag text-xs">{t}</span>
              ))}
              {project.tech.length > 4 && (
                <span className="tag text-xs">+{project.tech.length - 4}</span>
              )}
            </div>

            {/* Footer links */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <FiGithub size={14} />
              </a>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  <FiExternalLink size={14} />
                </a>
              )}
              <motion.span
                className="ml-auto text-xs text-zinc-700 group-hover:text-purple-400 transition-colors flex items-center gap-1"
                animate={hovered ? { x: 3 } : { x: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                Open <FiArrowRight size={10} />
              </motion.span>
            </div>
          </div>
        </motion.div>
      </TiltCard>
    </motion.div>
  )
}

// ── Project Modal ──────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  // Stable reference so the effect doesn't re-register on every render
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop — motion.div so AnimatePresence can animate it out */}
          <motion.div
            key="modal-backdrop"
            {...modalBackdrop}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50"
            onClick={onClose}
          />

          {/* Scroll container — also a motion.div so it fades with the backdrop */}
          <motion.div
            key="modal-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-4 md:inset-10 lg:inset-16 z-50 overflow-y-auto flex items-start justify-center py-8"
          >
            <motion.div
              {...modalContent}
              className="w-full max-w-3xl glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            >
              {/* Banner */}
              <div className={`h-52 bg-gradient-to-br ${project.gradient} relative`}>
                <div className="absolute inset-0 dot-bg opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/85 to-transparent" />
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-4 right-4 w-9 h-9 glass rounded-full flex items-center justify-center text-white border border-white/10 hover:border-white/30 transition-colors"
                >
                  <FiX size={15} />
                </motion.button>
                <div className="absolute bottom-6 left-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="tag text-xs">{project.category}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      project.status === 'Production'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>{project.status}</span>
                  </div>
                  <h2 className="font-display font-black text-3xl text-white">{project.title}</h2>
                  <p className="text-white/50 text-sm mt-1">{project.subtitle}</p>
                </div>
              </div>

              <div className="p-7 space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-2.5">Overview</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{project.longDescription}</p>
                </div>

                {project.metrics && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Key Metrics</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {project.metrics.map((m, i) => (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07, duration: 0.4 }}
                          className="glass rounded-xl p-3.5 border border-white/5 text-center"
                        >
                          <p className="font-display font-black text-xl gradient-text">{m.value}</p>
                          <p className="text-zinc-500 text-xs mt-0.5">{m.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-white font-semibold mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, i) => (
                      <motion.span
                        key={t}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 + 0.1 }}
                        className="tag"
                      >
                        {t}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <FiStar size={13} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{project.stars}</span>
                  <span>GitHub stars</span>
                </div>

                <div className="flex gap-3 pt-1">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FiGithub size={14} /> Source Code
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <FiExternalLink size={14} /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Projects() {
  const [filter, setFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState(null)
  const sectionRef = useRef(null)

  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category === filter)

  return (
    <section id="projects" ref={sectionRef} className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-cyan-600/5 blur-3xl pointer-events-none" />

      <div className="section-container">
        {/* Header with project count */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading
            label="Work"
            title="Featured Projects"
            subtitle="Production ML systems built to solve real problems at scale."
          />
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 glass rounded-xl px-4 py-2.5 border border-white/5 text-center"
          >
            <span className="font-display font-black text-2xl gradient-text">{projects.length}</span>
            <p className="text-zinc-500 text-xs">Projects</p>
          </motion.div>
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 overflow-hidden ${
                filter === cat
                  ? 'text-white'
                  : 'glass border border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
              }`}
            >
              {filter === cat && (
                <motion.div
                  layoutId="filter-bg"
                  className="absolute inset-0 bg-purple-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </motion.div>

        {/* Grid — motion.div with layout animates container height on filter change */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard project={project} index={i} onClick={setSelectedProject} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-14"
        >
          <a
            href="https://github.com/saisridhartarra"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <FiGithub size={14} />
            See all projects on GitHub
          </a>
        </motion.div>
      </div>

      {/* Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  )
}
