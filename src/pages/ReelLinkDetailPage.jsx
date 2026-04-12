import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiExternalLink, FiArrowLeft, FiTag } from 'react-icons/fi'
import { getBySlug } from '../data/reelLinks'

const tagColors = {
  ML:              { bg: '#8B5CF615', text: '#8B5CF6', border: '#8B5CF630' },
  Python:          { bg: '#06B6D415', text: '#06B6D4', border: '#06B6D430' },
  JavaScript:      { bg: '#F59E0B15', text: '#F59E0B', border: '#F59E0B30' },
  DSA:             { bg: '#10B98115', text: '#10B981', border: '#10B98130' },
  SQL:             { bg: '#F472B615', text: '#F472B6', border: '#F472B630' },
  Data:            { bg: '#34D39915', text: '#34D399', border: '#34D39930' },
  'System Design': { bg: '#A78BFA15', text: '#A78BFA', border: '#A78BFA30' },
  'Full Stack':      { bg: '#38BDF815', text: '#38BDF8', border: '#38BDF830' },
  Automation:        { bg: '#FB923C15', text: '#FB923C', border: '#FB923C30' },
  'Crazy Websites':  { bg: '#F43F5E15', text: '#F43F5E', border: '#F43F5E30' },
  default:           { bg: '#6B728015', text: '#6B7280', border: '#6B728030' },
}

export default function ReelLinkDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const item = getBySlug(slug)

  useEffect(() => {
    if (!item) navigate('/code-drops', { replace: true })
  }, [item, navigate])

  if (!item) return null

  const style = tagColors[item.tag] || tagColors.default
  const barColor = style.text

  return (
    <>
      <Helmet>
        <title>{item.title} | Code Drops — Sai Sridhar Tarra</title>
        <meta name="description" content={item.description} />
      </Helmet>

      <div className="relative min-h-screen pt-28 pb-24 flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob w-96 h-96 bg-purple-600/10 top-20 left-1/4 animate-blob" />
          <div className="blob w-72 h-72 bg-cyan-600/5 bottom-40 right-1/4 animate-blob-delayed" />
          <div className="grid-bg absolute inset-0 opacity-20" />
        </div>

        <div className="section-container relative z-10 max-w-lg w-full">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link
              to="/code-drops"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors duration-200"
            >
              <FiArrowLeft size={14} />
              All Code Drops
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl border border-white/5 overflow-hidden"
          >
            {/* Colour bar */}
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}80)` }} />

            <div className="p-8">
              {/* Tag */}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-5"
                style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
              >
                <FiTag size={9} />
                {item.tag}
              </span>

              {/* Title */}
              <h1 className="font-display font-bold text-2xl text-white mb-3 leading-snug">
                {item.title}
              </h1>

              {/* Description */}
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                {item.description}
              </p>

              {/* CTA */}
              <motion.a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                style={{ background: `linear-gradient(135deg, #8B5CF6, #06B6D4)` }}
              >
                Open Link
                <FiExternalLink size={13} className="opacity-70" />
              </motion.a>

              {/* Date */}
              <p className="text-zinc-700 text-xs text-center mt-5">{item.date}</p>
            </div>
          </motion.div>

          {/* Footer nudge */}
          <p className="text-zinc-600 text-xs text-center mt-6">
            Shared via{' '}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500/70 hover:text-pink-400 transition-colors"
            >
              Instagram Reels
            </a>{' '}
            · more at{' '}
            <Link to="/code-drops" className="text-purple-400/70 hover:text-purple-300 transition-colors">
              /code-drops
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
