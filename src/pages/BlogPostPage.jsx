import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { FiArrowLeft, FiCalendar, FiClock, FiTwitter, FiLinkedin, FiLink, FiList } from 'react-icons/fi'
import 'highlight.js/styles/github-dark.css'
import { getPostBySlug } from '../blog'
import { formatDate, extractHeadings } from '../utils/blogUtils'

// ─── Reading Progress Bar ─────────────────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('.blog-article')
      if (!article) return
      const articleTop = article.offsetTop
      const articleHeight = article.offsetHeight
      const scrolled = window.scrollY - articleTop + window.innerHeight / 2
      const p = Math.min(1, Math.max(0, scrolled / articleHeight))
      setProgress(p * 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return <div className="reading-progress" style={{ width: `${progress}%` }} />
}

// ─── Table of Contents ────────────────────────────────────────────────────────
function TableOfContents({ headings, activeId }) {
  if (!headings || !headings.length) return null

  return (
    <div className="glass rounded-xl border border-white/5 p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <FiList size={14} className="text-purple-400" />
        <h3 className="text-white font-semibold text-sm">Contents</h3>
      </div>
      <nav className="space-y-1 max-h-96 overflow-y-auto">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className={`block text-xs leading-relaxed py-1 transition-colors duration-150 ${
              h.level === 2 ? 'pl-0' : 'pl-3'
            } ${
              activeId === h.id
                ? 'text-purple-400 font-medium'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  )
}

// ─── Social Share ─────────────────────────────────────────────────────────────
function SocialShare({ title, url }) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-500 text-sm">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 glass rounded-lg flex items-center justify-center text-zinc-500 hover:text-white border border-white/5 hover:border-blue-400/50 transition-colors"
      >
        <FiTwitter size={13} />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-8 h-8 glass rounded-lg flex items-center justify-center text-zinc-500 hover:text-white border border-white/5 hover:border-blue-500/50 transition-colors"
      >
        <FiLinkedin size={13} />
      </a>
      <button
        onClick={copyLink}
        className="relative w-8 h-8 glass rounded-lg flex items-center justify-center text-zinc-500 hover:text-white border border-white/5 transition-colors"
      >
        <FiLink size={13} />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-green-500/90 text-white px-2 py-0.5 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = getPostBySlug(slug)
  const [activeHeading, setActiveHeading] = useState('')
  // Track mount to prevent premature redirects during Suspense loading
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
  }, [])

  useEffect(() => {
    // Only redirect after the component has fully mounted — not during Suspense
    if (!mounted.current) return
    if (!post) {
      navigate('/blog', { replace: true })
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [post, navigate])

  // Track active heading for TOC
  useEffect(() => {
    if (!post) return
    const headingEls = document.querySelectorAll('.blog-article h2, .blog-article h3')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHeading(entry.target.id)
        })
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )
    headingEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [post])

  // Show skeleton while data resolves — never render a blank screen
  if (!post) return (
    <div className="relative min-h-screen pt-24 pb-24">
      <div className="section-container">
        <div className="mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors">
            <FiArrowLeft size={14} /> Back to Blog
          </Link>
        </div>
        <div className="max-w-3xl animate-pulse">
          <div className="h-4 bg-white/5 rounded w-24 mb-6" />
          <div className="h-10 bg-white/5 rounded w-3/4 mb-3" />
          <div className="h-10 bg-white/5 rounded w-1/2 mb-8" />
          <div className="flex gap-4 mb-10">
            <div className="h-4 bg-white/5 rounded w-32" />
            <div className="h-4 bg-white/5 rounded w-24" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-white/5 rounded mb-3" style={{ width: `${85 + (i % 3) * 5}%` }} />
          ))}
        </div>
      </div>
    </div>
  )

  const headings = extractHeadings(post.content)
  const pageUrl = `https://saisridhartarra.com/blog/${post.slug}`

  return (
    <>
      <Helmet>
        <title>{post.title} | Sai Sridhar Tarra</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <ReadingProgress />

      <div className="relative min-h-screen pt-24 pb-24">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob w-96 h-96 bg-purple-600/8 -top-20 left-1/4 animate-blob" />
          <div className="grid-bg absolute inset-0 opacity-15" />
        </div>

        <div className="section-container relative z-10">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 1, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Blog
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 items-start">
            {/* Main article */}
            <motion.div
              initial={{ opacity: 1, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <header className="mb-10">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="tag">{post.category}</span>
                  {post.featured && (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-5">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-5 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
                        {post.author ? post.author.charAt(0) : 'S'}
                      </div>
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiCalendar size={13} />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiClock size={13} />
                      {post.readTime}
                    </span>
                  </div>
                  <SocialShare title={post.title} url={pageUrl} />
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </header>

              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-10" />

              {/* Content */}
              <article className="blog-article blog-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeSlug]}
                >
                  {post.content}
                </ReactMarkdown>
              </article>

              {/* Bottom actions */}
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <SocialShare title={post.title} url={pageUrl} />
                <Link to="/blog" className="btn-secondary text-sm">
                  ← More Articles
                </Link>
              </div>

              {/* Author card */}
              <div className="mt-8 glass rounded-2xl border border-white/5 p-6 flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-lg font-black text-purple-300 flex-shrink-0">
                  S
                </div>
                <div>
                  <h4 className="text-white font-semibold">{post.author}</h4>
                  <p className="text-zinc-500 text-sm mb-3">
                    Data Analyst & ML Engineer. Passionate about building intelligent systems, time-series forecasting, and production AI.
                  </p>
                  <div className="flex gap-3">
                    <a href="https://github.com/sai-sridhar-repo-07" target="_blank" rel="noopener noreferrer" className="text-purple-400 text-xs hover:text-purple-300 transition-colors">GitHub ↗</a>
                    <a href="https://linkedin.com/in/saisridhartarra" target="_blank" rel="noopener noreferrer" className="text-purple-400 text-xs hover:text-purple-300 transition-colors">LinkedIn ↗</a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* TOC sidebar */}
            <motion.aside
              initial={{ opacity: 1, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="hidden lg:block"
            >
              <TableOfContents headings={headings} activeId={activeHeading} />
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  )
}
