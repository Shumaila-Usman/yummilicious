"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[95vw]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = "md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-brown/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-t-3xl border border-gold/30 bg-cream shadow-warm sm:rounded-3xl",
              "max-h-[min(92dvh,920px)]",
              sizes[size],
              className
            )}
          >
            <div className="paper-texture">
              <div className="flex items-center justify-between border-b border-burgundy/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 sm:pt-4">
                  {title ? (
                    <h2 id="modal-title" className="min-w-0 flex-1 truncate font-display text-lg font-bold text-burgundy sm:text-xl">
                      {title}
                    </h2>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="focus-ring ml-2 shrink-0 rounded-full p-2 text-brown/70 hover:bg-burgundy/10 hover:text-burgundy"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              <div className="relative z-[2] max-h-[min(85dvh,80vh)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] sm:p-0">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
