"use client";

import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brown/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-burgundy/20 bg-cream p-6 shadow-xl">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-full p-1 text-brown/60 hover:bg-burgundy/10 hover:text-brown"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="font-display text-xl font-bold text-brown">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
