import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from '../ui/CustomCursor'
import ScrollProgress from '../ui/ScrollProgress'
import NoiseOverlay from '../ui/NoiseOverlay'

/**
 * Root layout wrapper — wraps all pages with:
 * - Custom cursor
 * - Scroll progress bar
 * - Noise overlay texture
 * - Navbar
 * - Footer
 */
export default function Layout({ children }) {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <NoiseOverlay />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
