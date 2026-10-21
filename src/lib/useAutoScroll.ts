import { useEffect, useRef } from "react";

// Avanza solo un carrusel horizontal (en móvil, cuando hay scroll). Se pausa si la persona lo toca.
export function useAutoScroll<T extends HTMLElement>(every = 4000) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pausedUntil = 0;
    const pause = () => (pausedUntil = Date.now() + 8000);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("wheel", pause, { passive: true });
    el.addEventListener("mouseenter", pause);

    const id = setInterval(() => {
      const [a, b] = el.children as HTMLCollectionOf<HTMLElement>;
      if (!b || el.scrollWidth <= el.clientWidth + 1 || Date.now() < pausedUntil || document.hidden) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: b.offsetLeft - a.offsetLeft, behavior: "smooth" });
    }, every);

    return () => {
      clearInterval(id);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("wheel", pause);
      el.removeEventListener("mouseenter", pause);
    };
  }, [every]);

  return ref;
}
