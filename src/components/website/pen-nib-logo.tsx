"use client";

import { motion } from "framer-motion";

export function PenNibLogo({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <motion.path
        d="M32 6L38 22H54L41 32L46 48L32 38L18 48L23 32L10 22H26L32 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.4 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      <motion.path
        d="M32 22V52"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: "easeInOut" }}
      />
      <motion.circle
        cx="32"
        cy="18"
        r="2.5"
        fill="#C4A35A"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
      />
    </motion.svg>
  );
}
