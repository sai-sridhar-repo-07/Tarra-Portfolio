import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiGithub, FiLinkedin, FiTwitter, FiMail, FiMapPin } from 'react-icons/fi'
import SectionHeading from '../ui/SectionHeading'
import MagneticButton from '../ui/MagneticButton'
import { personal } from '../../data/personal'

const socials = [
  { icon: FiGithub, label: 'GitHub', href: personal.github, color: '#fff' },
  { icon: FiLinkedin, label: 'LinkedIn', href: personal.linkedin, color: '#0A66C2' },
  { icon: FiTwitter, label: 'Twitter', href: personal.twitter, color: '#1DA1F2' },
  { icon: FiMail, label: 'Email', href: `mailto:${personal.email}`, color: '#8B5CF6' },
]

// ─── Floating Label Input ─────────────────────────────────────────────────────
function FloatInput({ label, id, type = 'text', required, value, onChange }) {
  return (
    <div className="float-label-group">
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder=" "
        value={value}
        onChange={onChange}
        className="cursor-auto"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

function FloatTextarea({ label, id, required, value, onChange }) {
  return (
    <div className="float-label-group">
      <textarea
        id={id}
        name={id}
        required={required}
        placeholder=" "
        value={value}
        onChange={onChange}
        rows={5}
        className="resize-none cursor-auto"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'sent' | 'error'

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')

    // EmailJS integration — replace with your own Service ID, Template ID, Public Key
    try {
      // const emailjs = await import('@emailjs/browser')
      // await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form, 'YOUR_PUBLIC_KEY')

      // Simulate for demo
      await new Promise((r) => setTimeout(r, 1500))
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section id="contact" className="py-24 md:py-36 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-600/8 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-72 h-72 bg-cyan-600/8 blur-3xl rounded-full pointer-events-none" />

      <div className="section-container">
        <SectionHeading
          label="Contact"
          title="Let's Talk"
          subtitle="Have an exciting project or opportunity? I'd love to hear about it."
          centered
          className="mb-14"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
          {/* Left: Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/5">
                  <FiMail size={15} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Email</p>
                  <a href={`mailto:${personal.email}`} className="text-sm hover:text-purple-400 transition-colors">
                    {personal.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/5">
                  <FiMapPin size={15} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Location</p>
                  <p className="text-sm">{personal.location}</p>
                </div>
              </div>
            </div>

            {/* Availability badge */}
            <div className="glass rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-semibold">{personal.availability}</span>
              </div>
              <p className="text-zinc-500 text-xs">Usually responds within 24 hours.</p>
            </div>

            {/* Social links */}
            <div>
              <p className="text-zinc-500 text-sm mb-4 font-medium">Connect with me</p>
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, label, href }) => (
                  <MagneticButton key={label} strength={0.5} radius={60}>
                    <a
                      href={href}
                      target={href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 glass rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-purple-500/50 transition-all duration-200"
                    >
                      <Icon size={15} />
                    </a>
                  </MagneticButton>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/8 p-6 md:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatInput
                  label="Your Name"
                  id="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
                <FloatInput
                  label="Email Address"
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <FloatInput
                label="Subject"
                id="subject"
                value={form.subject}
                onChange={handleChange}
              />
              <FloatTextarea
                label="Your Message"
                id="message"
                required
                value={form.message}
                onChange={handleChange}
              />

              {/* Submit button */}
              <MagneticButton className="w-full">
                <motion.button
                  type="submit"
                  disabled={status === 'sending' || status === 'sent'}
                  whileTap={{ scale: 0.97 }}
                  className="w-full btn-primary justify-center py-4 text-sm relative overflow-hidden"
                >
                  {status === 'idle' && (
                    <span className="flex items-center gap-2">
                      Send Message <FiSend size={14} />
                    </span>
                  )}
                  {status === 'sending' && (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  )}
                  {status === 'sent' && (
                    <span className="flex items-center gap-2 text-green-300">
                      ✓ Message Sent!
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="text-red-300">Failed — try emailing directly</span>
                  )}
                </motion.button>
              </MagneticButton>

              <p className="text-zinc-600 text-xs text-center">
                Or email directly at{' '}
                <a href={`mailto:${personal.email}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                  {personal.email}
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
