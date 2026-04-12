import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiArrowRight, FiTag } from 'react-icons/fi'
import { SiInstagram } from 'react-icons/si'
import { reelLinks, getAllTags } from '../data/reelLinks'
import SectionHeading from '../components/ui/SectionHeading'

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

function tagStyle(tag) {
  return tagColors[tag] || tagColors.default
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ReelCard({ item, index }) {
  const style = tagStyle(item.tag)
  const barColor = style.text

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.32, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(139,92,246,0.12)' }}
      className="group glass rounded-2xl border border-white/5 hover:border-purple-500/30 overflow-hidden transition-colors duration-300 flex flex-col"
    >
      <Link to={`/code-drops/${item.slug}`} className="flex flex-col flex-1">
      {/* Tag colour bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}80)` }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Tag pill */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
          >
            <FiTag size={9} />
            {item.tag}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-base text-white group-hover:text-purple-300 transition-colors mb-2 leading-snug">
          {item.title}
        </h2>

        {/* Description */}
        <p className="text-zinc-500 text-sm leading-relaxed mb-5 flex-1 line-clamp-2">
          {item.description}
        </p>

        {/* Footer — date + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-zinc-600 text-xs">{item.date}</span>
          <span className="text-purple-400 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Open <FiArrowRight size={11} />
          </span>
        </div>
      </div>
      </Link>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReelLinksPage() {
  const [activeTag, setActiveTag] = useState('All')
  const tags = getAllTags()

  const filtered = useMemo(() => {
    if (activeTag === 'All') return reelLinks
    return reelLinks.filter((r) => r.tag === activeTag)
  }, [activeTag])

  return (
    <>
      <Helmet>
        <title>Reel Code Drops | Sai Sridhar Tarra</title>
        <meta name="description" content="Source code links shared in Sai's Instagram reels — Python, ML, DSA, and more." />
      </Helmet>

      <div className="relative min-h-screen pt-28 pb-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob w-96 h-96 bg-purple-600/10 top-20 left-1/4 animate-blob" />
          <div className="blob w-72 h-72 bg-cyan-600/5 bottom-40 right-1/4 animate-blob-delayed" />
          <div className="grid-bg absolute inset-0 opacity-20" />
        </div>

        <div className="section-container relative z-10">
          {/* Header */}
          <SectionHeading
            label="Instagram Reels"
            title="Code Drops"
            subtitle="Source code for every reel — click a card to open the file on GitHub."
            centered
            className="mb-12"
          />

          {/* Instagram nudge */}
          <div className="flex justify-center mb-10">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-pink-400 transition-colors duration-200"
            >
              <SiInstagram size={14} />
              Follow on Instagram for new reels
            </a>
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'glass border border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-zinc-600 text-sm text-center mb-8">
            {filtered.length} snippet{filtered.length !== 1 ? 's' : ''}
            {activeTag !== 'All' && ` tagged "${activeTag}"`}
          </p>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((item, i) => (
                  <ReelCard key={item.id} item={item} index={i} />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-20"
                >
                  <p className="text-zinc-500 text-lg mb-2">No snippets yet for this tag</p>
                  <p className="text-zinc-700 text-sm">Check back after the next reel</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  )
}
