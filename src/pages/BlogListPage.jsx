import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiSearch, FiCalendar, FiClock, FiTag, FiArrowRight } from 'react-icons/fi'
import { blogPosts, getAllCategories } from '../blog'
import { formatDate } from '../utils/blogUtils'
import SectionHeading from '../components/ui/SectionHeading'

// ─── Blog Card ────────────────────────────────────────────────────────────────
function BlogCard({ post, index }) {
  const tagColors = {
    'Deep Learning': '#8B5CF6',
    'MLOps': '#06B6D4',
    'AI Research': '#10B981',
    'Computer Vision': '#F59E0B',
    'Machine Learning': '#A78BFA',
    'Data Engineering': '#34D399',
    'default': '#6B7280',
  }
  const color = tagColors[post.category] || tagColors.default

  return (
    // Cards are visible immediately (opacity: 1) — only animate position for polish
    <motion.article
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(139,92,246,0.12)' }}
      className="group glass rounded-2xl border border-white/5 hover:border-purple-500/30 overflow-hidden transition-colors duration-300"
    >
      <Link to={`/blog/${post.slug}`} className="block">
        {/* Category colour bar */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />

        <div className="p-6">
          {/* Meta row */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
              }}
            >
              {post.category}
            </span>
            {post.featured && (
              <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-display font-bold text-lg text-white group-hover:text-purple-300 transition-colors mb-2 leading-snug">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-zinc-500 text-sm leading-relaxed mb-5 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <span className="flex items-center gap-1.5">
                <FiCalendar size={11} />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock size={11} />
                {post.readTime}
              </span>
            </div>
            <span className="text-purple-400 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Read <FiArrowRight size={11} />
            </span>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-zinc-600 text-xs">
                  <FiTag size={9} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BlogListPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = getAllCategories()

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory = activeCategory === 'All' || post.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <>
      <Helmet>
        <title>Blog | Sai Sridhar Tarra — ML & AI Engineer</title>
        <meta name="description" content="Thoughts on machine learning, AI research, and building production AI systems." />
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
            label="Writing"
            title="Blog"
            subtitle="Thoughts on ML research, engineering patterns, and the future of AI — written for practitioners."
            centered
            className="mb-12"
          />

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-purple-500/50 transition-colors cursor-auto"
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'glass border border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-zinc-600 text-sm text-center mb-8">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>

          {/* Blog grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-zinc-500 text-lg mb-2">No articles found</p>
              <p className="text-zinc-700 text-sm">Try a different search term or category</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
