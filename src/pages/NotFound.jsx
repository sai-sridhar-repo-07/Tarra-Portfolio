import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { FiHome, FiArrowLeft } from 'react-icons/fi'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Sai Sridhar Tarra</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="blob w-96 h-96 bg-purple-600/15 top-1/4 left-1/4 animate-blob" />
          <div className="blob w-72 h-72 bg-cyan-600/10 bottom-1/4 right-1/4 animate-blob-delayed" />
          <div className="grid-bg absolute inset-0 opacity-20" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center px-6"
        >
          {/* 404 */}
          <motion.h1
            className="font-display font-black text-[clamp(5rem,20vw,14rem)] gradient-text leading-none mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            404
          </motion.h1>

          <h2 className="text-white text-2xl font-bold font-display mb-3">
            Lost in latent space.
          </h2>
          <p className="text-zinc-500 text-base mb-10 max-w-sm mx-auto">
            This page doesn't exist — or maybe it's just a hallucination. Either way, let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary flex items-center justify-center gap-2">
              <FiHome size={15} /> Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <FiArrowLeft size={15} /> Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
