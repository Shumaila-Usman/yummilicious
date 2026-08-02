"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function adminFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  }).then(async (res) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        error: (body as { error?: string }).error ?? "Request failed",
        status: res.status,
      };
    }
    return { data: body as T, status: res.status };
  });
}

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "bg-cream border border-burgundy/20 text-brown shadow-lg",
            success: "border-green/40",
            error: "border-burgundy",
          },
        }}
      />
    </SessionProvider>
  );
}
