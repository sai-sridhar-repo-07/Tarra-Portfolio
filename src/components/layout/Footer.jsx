import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiArrowUp } from 'react-icons/fi'
import { personal } from '../../data/personal'

const socials = [
  { label: 'GitHub', icon: FiGithub, href: personal.github },
  { label: 'LinkedIn', icon: FiLinkedin, href: personal.linkedin },
  { label: 'Twitter', icon: FiTwitter, href: personal.twitter },
  { label: 'Email', icon: FiMail, href: `mailto:${personal.email}` },
]

const links = [
  { label: 'About', href: '/#about' },
  { label: 'Projects', href: '/#projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/#contact' },
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative border-t border-white/5 pt-12 pb-8 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }}
              >
                S
              </div>
              <span className="font-display font-bold text-white">Sai Sridhar Tarra</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              ML & AI Engineer building intelligent systems. Open to collaborations and opportunities.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">{personal.availability}</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-zinc-500 hover:text-purple-400 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Connect</h4>
            <div className="flex flex-col gap-2.5">
              {socials.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-zinc-500 hover:text-white transition-colors duration-200 w-fit"
                >
                  <Icon size={14} />
                  <span className="text-sm">{label}</span>
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
          <motion.p
            className="text-zinc-600 text-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            © {new Date().getFullYear()} Sai Sridhar Tarra. Crafted with precision.
          </motion.p>

          <div className="flex items-center gap-4">
            <span className="text-zinc-700 text-xs">Built with React + Framer Motion + GSAP</span>

            {/* Back to top */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-purple-500/50 transition-colors duration-200"
              aria-label="Back to top"
            >
              <FiArrowUp size={14} />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
