import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrolledPast } from '../../hooks/useScrollProgress'
import { HiMenuAlt4, HiX } from 'react-icons/hi'

const navLinks = [
  { label: 'About', href: '/#about' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
]

function NavLink({ href, label, onClick }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive =
    (href === '/blog' && location.pathname.startsWith('/blog')) ||
    (href === '/' && location.pathname === '/')

  const handleClick = (e) => {
    onClick?.()

    if (href.startsWith('/#')) {
      e.preventDefault()
      const sectionId = href.slice(2) // strip /#

      if (location.pathname !== '/') {
        // ── KEY FIX ──────────────────────────────────────────────────────
        // We're NOT on the home page (e.g., /blog). Navigate home first
        // and pass the scroll target via React Router state so Home.jsx
        // can pick it up and scroll after mounting.
        navigate('/', { state: { scrollTo: sectionId } })
      } else {
        // Already on home — just smooth scroll in place
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        window.history.replaceState(null, '', href)
      }
    }
  }

  return (
    <Link
      to={href}
      onClick={handleClick}
      className={`relative text-sm font-medium transition-colors duration-200 group ${
        isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
      }`}
    >
      {label}
      {/* Gradient underline slides in on hover */}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300 ease-out bg-gradient-to-r from-purple-500 to-cyan-500" />
      {/* Active dot */}
      {isActive && (
        <motion.span
          layoutId="nav-active-dot"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  )
}

export default function Navbar() {
  const scrolled = useScrolledPast(60)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth > 768) setMobileOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-3 glass border-b border-white/5' : 'py-5 bg-transparent'
        }`}
      >
        <div className="section-container flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
            >
              S
            </motion.div>
            <span className="font-display font-bold text-white text-sm hidden sm:block">
              Sai Sridhar
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          {/* Resume CTA + hamburger */}
          <div className="flex items-center gap-4">
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-200"
            >
              Resume ↗
            </motion.a>

            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg glass text-white z-50"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <HiX size={18} />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <HiMenuAlt4 size={18} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-dark/80 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-72 glass border-l border-white/5 flex flex-col"
            >
              <div className="flex-1 flex flex-col justify-center px-8 gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <NavLink {...link} onClick={() => setMobileOpen(false)} />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.05 + 0.1 }}
                >
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm mt-2 w-full justify-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    View Resume ↗
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
