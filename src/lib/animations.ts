// Animation variants and utilities for Framer Motion
import { Variants } from 'framer-motion';

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

export const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.5,
};

// Card animations
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Container animations for staggered children
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Stagger container (alias for containerVariants)
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Fade in up animation
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Item animations for staggered lists
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Modal animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
    },
  },
};

// Backdrop animations
export const backdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Button animations
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// Slide animations
export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// Fade animations
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Scale animations
export const scaleVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Loading animations
export const loadingVariants: Variants = {
  start: {
    rotate: 0,
  },
  end: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Bounce animation
export const bounceVariants: Variants = {
  idle: {
    scale: 1,
  },
  bounce: {
    scale: [1, 1.2, 1],
    transition: {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
};

// Pulse animation
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      type: 'tween',
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Text reveal animations
export const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Drawer animations
export const drawerVariants: Variants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

// Float animation
export const floatVariants: Variants = {
  float: {
    y: [-10, 10, -10],
    transition: {
      type: 'tween',
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Spring presets
export const springConfig = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const bouncySpring = {
  type: 'spring',
  stiffness: 400,
  damping: 10,
};

export const smoothSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
};