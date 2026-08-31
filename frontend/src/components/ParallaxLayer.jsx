"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

// Sarmalanan içeriği, TAM OLARAK bulunduğu bölüm ekranda görünür durumdayken
// dikey olarak hareket ettirir (0 → `range` piksel). `useScroll`'u genel
// sayfa kaydırmasına değil, bu bileşenin kendi konumuna (`target: ref`)
// bağladığımız için efekt her ekran boyutunda tutarlı ve belirgin çalışır:
// bölüm görünüme girdiğinde animasyon 0'da başlar, bölüm ekrandan çıkarken
// tam olarak `range` değerine ulaşır.
//
// `range` ne kadar büyükse hareket o kadar belirgin olur. Metin gibi
// okunabilirliği önemli içerikler için küçük (örn. 20-30px), dekoratif
// görseller için daha büyük (örn. 100-150px) değerler kullanılmalı.
export default function ParallaxLayer({ children, range = 60, className }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, range]);

  return (
    <motion.div ref={ref} className={className} style={reduceMotion ? undefined : { y }}>
      {children}
    </motion.div>
  );
}
