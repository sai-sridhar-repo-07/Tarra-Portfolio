import { processBlogPosts } from '../utils/blogUtils'

// Import all markdown files as raw strings using Vite's import.meta.glob
const rawModules = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true })

// Process and export the blog posts
export const blogPosts = processBlogPosts(rawModules)

// Get a single post by slug
export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug) || null
}

// Get all unique tags
export function getAllTags() {
  const tags = new Set()
  blogPosts.forEach((p) => p.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}

// Get all unique categories
export function getAllCategories() {
  const cats = new Set(blogPosts.map((p) => p.category))
  return ['All', ...Array.from(cats).sort()]
}

// Get featured posts
export function getFeaturedPosts() {
  return blogPosts.filter((p) => p.featured)
}
