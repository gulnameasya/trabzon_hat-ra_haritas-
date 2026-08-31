import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Trabzon Hatıra Haritası` : "Trabzon Hatıra Haritası";
  }, [title]);
}
