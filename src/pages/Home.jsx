import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Projects from '../components/sections/Projects'
import Experience from '../components/sections/Experience'
import Testimonials from '../components/sections/Testimonials'
import Contact from '../components/sections/Contact'
import { personal } from '../data/personal'

export default function Home() {
  const location = useLocation()

  // ── Handle cross-page anchor navigation ──────────────────────────────────
  // When the Navbar navigates from /blog → / with { state: { scrollTo: 'about' } },
  // we read that state here after the home page mounts and smoothly scroll to the target.
  useEffect(() => {
    const target = location.state?.scrollTo
    if (!target) return

    // Small delay: give AnimatePresence page-transition + section render time to settle
    const timer = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
    }, 550)

    return () => clearTimeout(timer)
  }, [location.state])

  return (
    <>
      <Helmet>
        <title>{personal.name} | ML & AI Engineer</title>
        <meta name="description" content={`${personal.name} — ${personal.title}. ${personal.bio}`} />
        <meta property="og:title" content={`${personal.name} | ML & AI Engineer`} />
        <meta property="og:description" content={personal.bio} />
        <link rel="canonical" href="https://saisridhartarra.com/" />
      </Helmet>

      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Testimonials />
      <Contact />
    </>
  )
}
