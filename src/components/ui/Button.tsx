"use client";

import { type ButtonHTMLAttributes, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-orange to-gold text-brown shadow-[var(--shadow-gold)] hover:brightness-105 border border-gold/40",
  secondary:
    "bg-burgundy text-cream hover:bg-burgundy-dark border border-burgundy-dark",
  ghost: "bg-transparent text-cream hover:bg-white/10",
  outline:
    "bg-transparent border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-cream",
  danger: "bg-burgundy-dark text-cream hover:bg-burgundy",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-10",
  md: "px-6 py-3 text-base min-h-12",
  lg: "px-5 py-3.5 text-base min-h-12 sm:px-8 sm:py-4 sm:text-lg sm:min-h-14",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  magnetic = false,
  loading,
  children,
  disabled,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!magnetic) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  };

  return (
    <motion.button
      type={type}
      style={magnetic ? { x: springX, y: springY } : undefined}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      suppressHydrationWarning
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
}
