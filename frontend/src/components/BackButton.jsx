"use client";

import { useRouter } from "next/navigation";

// Tarayıcı geçmişinde bir önceki sayfaya döner. Doğrudan bu sayfaya
// gelinmişse (geçmiş yoksa) ana sayfaya yönlendirir.
export default function BackButton({ fallback = "/" }) {
  const router = useRouter();

  function handleClick() {
    router.back();
    window.setTimeout(() => {
      if (document.referrer === "") router.replace(fallback);
    }, 120);
  }

  return (
    <button type="button" className="back-button" onClick={handleClick}>
      <span aria-hidden="true">←</span> Geri dön
    </button>
  );
}
