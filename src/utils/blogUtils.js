/**
 * Simple YAML frontmatter parser for the browser.
 * Handles strings, numbers, booleans, and simple arrays.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const yamlStr = match[1]
  const content = match[2]
  const data = {}

  yamlStr.split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) return
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim()

    if (!key) return

    // Boolean
    if (value === 'true') { data[key] = true; return }
    if (value === 'false') { data[key] = false; return }

    // Number
    if (!isNaN(value) && value !== '') { data[key] = Number(value); return }

    // Array (simple bracket notation): [tag1, tag2]
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/['"]/g, ''))
      return
    }

    // String (strip quotes)
    data[key] = value.replace(/^['"]|['"]$/g, '')
  })

  return { data, content }
}

/**
 * Calculates estimated reading time for markdown content.
 * Average adult reads ~238 words per minute.
 */
function estimateReadTime(content) {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 238)
  return `${minutes} min read`
}

/**
 * Extracts plain text from markdown for excerpt generation.
 */
function markdownToExcerpt(markdown, maxLength = 160) {
  const text = markdown
    .replace(/#{1,6}\s+/g, '')       // headings
    .replace(/\*\*|__/g, '')         // bold
    .replace(/\*|_/g, '')            // italic
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')  // images
    .replace(/>\s+/g, '')            // blockquotes
    .replace(/\n+/g, ' ')            // newlines
    .trim()

  return text.length > maxLength ? text.slice(0, maxLength).replace(/\s+\S*$/, '') + '…' : text
}

/**
 * Extracts headings from markdown for table of contents.
 * Returns array of { id, text, level }.
 */
export function extractHeadings(markdown) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/\*\*|__|`/g, '')
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    headings.push({ id, text, level })
  }

  return headings
}

/**
 * Processes all raw markdown modules from import.meta.glob.
 * Returns sorted array of blog post objects.
 */
export function processBlogPosts(modules) {
  const posts = Object.entries(modules).map(([path, raw]) => {
    const { data, content } = parseFrontmatter(raw)
    const slug = path.replace(/.*\/([^/]+)\.md$/, '$1')

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || '',
      author: data.author || 'Sai Sridhar Tarra',
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || 'General',
      coverImage: data.coverImage || null,
      featured: data.featured === true,
      draft: data.draft === true,
      readTime: estimateReadTime(content),
      excerpt: data.excerpt || markdownToExcerpt(content),
      content,
    }
  })

  // Sort by date descending, filter out drafts
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Formats a date string to a human-readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
