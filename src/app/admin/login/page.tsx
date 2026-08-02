"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome back!");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-burgundy-dark via-burgundy to-orange p-4">
      <div className="w-full max-w-md rounded-2xl border border-cream/20 bg-cream p-8 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <Logo href={undefined} size={56} withText />
        </div>
        <h1 className="font-display mb-2 text-center text-2xl font-bold text-brown">Admin Login</h1>
        <p className="mb-6 text-center text-sm text-muted">Sign in to manage your store</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-brown">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-burgundy/20 bg-white px-4 py-3 text-brown focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              placeholder="admin@yummilicious.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-brown">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-burgundy/20 bg-white px-4 py-3 text-brown focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="secondary" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
