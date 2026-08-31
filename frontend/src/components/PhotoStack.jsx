"use client";

import { useState } from "react";
import "./PhotoStack.css";

// Hero'nun sağ tarafında, 5 dikdörtgen fotoğrafı yelpaze gibi üst üste
// gösterir: 3. fotoğraf ortada/önde, 2. ve 4. onun arkasında (1/3'ü
// görünür, biraz küçük), 1. ve 5. en arkada (1/3'ü görünür, daha da küçük).
// Fare üzerine gelince (mobilde dokununca) o kart saat yönünde dönerek
// ortaya gelir ve büyür. `images` dizisi tam olarak 5 eleman alır,
// her biri { src, alt }.
export default function PhotoStack({ images }) {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="photo-stack">
      {images.map((img, i) => (
        <div
          key={i}
          className={`photo-stack__frame photo-stack__frame--${i} ${
            activeIndex === i ? "is-active" : ""
          }`}
          onMouseEnter={() => setActiveIndex(i)}
          onMouseLeave={() => setActiveIndex((current) => (current === i ? null : current))}
          onClick={() => setActiveIndex(i)}
        >
          <img src={img.src} alt={img.alt || ""} />
        </div>
      ))}
    </div>
  );
}
