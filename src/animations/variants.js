// ─── Easing Curves ─────────────────────────────────────────────────────────
export const ease = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.34, 1.56, 0.64, 1],
  snappy: [0.77, 0, 0.175, 1],
  expo: [0.16, 1, 0.3, 1],
  silk: [0.33, 1, 0.68, 1],
}

// ─── Fade Animations ────────────────────────────────────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5, ease: ease.smooth },
}

export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.6, ease: ease.expo },
}

export const fadeInDown = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.6, ease: ease.expo },
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.6, ease: ease.expo },
}

export const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.6, ease: ease.expo },
}

// ─── Scale Animations ───────────────────────────────────────────────────────
export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.5, ease: ease.bounce },
}

export const scaleInUp = {
  initial: { opacity: 0, scale: 0.8, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -10 },
  transition: { duration: 0.5, ease: ease.bounce },
}

// ─── Stagger Container ──────────────────────────────────────────────────────
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFast = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
}

export const staggerContainerSlow = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

// ─── Child Items (for stagger) ──────────────────────────────────────────────
export const staggerItem = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.expo },
  },
}

export const staggerItemLeft = {
  initial: { opacity: 0, x: -30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: ease.expo },
  },
}

export const staggerItemRight = {
  initial: { opacity: 0, x: 30 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: ease.expo },
  },
}

// ─── Text Reveal (clip-path) ────────────────────────────────────────────────
export const textRevealContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

export const textRevealWord = {
  initial: { y: '110%', opacity: 0 },
  animate: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.7, ease: ease.silk },
  },
}

export const textRevealChar = {
  initial: { y: '110%', opacity: 0 },
  animate: {
    y: '0%',
    opacity: 1,
    transition: { duration: 0.5, ease: ease.silk },
  },
}

// ─── Page Transitions ───────────────────────────────────────────────────────
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.smooth } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: ease.snappy } },
}

export const slidePageTransition = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.expo } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.35, ease: ease.snappy } },
}

// ─── Card Hover ─────────────────────────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -6, transition: { duration: 0.3, ease: ease.smooth } },
}

export const glowHover = {
  rest: { boxShadow: '0 0 0px rgba(139, 92, 246, 0)' },
  hover: { boxShadow: '0 0 30px rgba(139, 92, 246, 0.35)' },
}

// ─── Modal ──────────────────────────────────────────────────────────────────
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
}

export const modalContent = {
  initial: { opacity: 0, scale: 0.9, y: 40 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: ease.bounce },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.25, ease: ease.snappy },
  },
}

// ─── Number Counter ─────────────────────────────────────────────────────────
export const counterVariant = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.expo },
  },
}

// ─── Skill Bar ──────────────────────────────────────────────────────────────
export const skillBarVariant = (level) => ({
  initial: { width: 0, opacity: 0 },
  animate: {
    width: `${level}%`,
    opacity: 1,
    transition: { duration: 1.2, ease: ease.silk, delay: 0.2 },
  },
})

// ─── Scroll Indicator ───────────────────────────────────────────────────────
export const scrollIndicator = {
  animate: {
    y: [0, 8, 0],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
}
