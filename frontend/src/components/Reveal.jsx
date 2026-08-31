"use client";

import { motion } from "framer-motion";

// Bir bölüm görünüm alanına (viewport) girdiğinde hafifçe yukarı kayarak
// beliren, tekrar kullanılabilir sarmalayıcı. `prefers-reduced-motion`
// desteği layout.jsx'teki <MotionConfig reducedMotion="user"> ile global
// olarak sağlanıyor — burada ek bir şey yapmaya gerek yok.
export default function Reveal({ children, delay = 0, as = "div", className }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
