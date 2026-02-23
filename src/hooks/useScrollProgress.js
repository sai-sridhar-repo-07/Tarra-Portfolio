import { useState, useEffect } from 'react'

/**
 * Returns scroll progress as a value from 0 to 1.
 * 0 = top of page, 1 = bottom of page.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setProgress(Math.min(1, Math.max(0, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initialize
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

/**
 * Returns scroll progress as a percentage (0–100).
 */
export function useScrollPercentage() {
  const progress = useScrollProgress()
  return Math.round(progress * 100)
}

/**
 * Returns true if the user has scrolled past the given threshold (in pixels).
 */
export function useScrolledPast(threshold = 80) {
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolledPast(window.scrollY > threshold)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolledPast
}
