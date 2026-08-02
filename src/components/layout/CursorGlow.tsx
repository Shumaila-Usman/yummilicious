"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorGlow() {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const isDesktop = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isDesktop || prefersReduced) return;

    setVisible(true);

    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[5] hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
      style={{
        left: springX,
        top: springY,
        background:
          "radial-gradient(circle, rgba(246,181,58,0.15) 0%, rgba(242,140,0,0.08) 40%, transparent 70%)",
      }}
      aria-hidden
    />
  );
}
