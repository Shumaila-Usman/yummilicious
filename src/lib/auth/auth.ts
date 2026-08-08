import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/models/Admin";
import { authConfig } from "@/lib/auth/auth.config";
import { ensureAdminFromEnv } from "@/lib/auth/ensure-admin";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          await connectDB();
          await ensureAdminFromEnv();

          const admin = await Admin.findOne({
            email: parsed.data.email.toLowerCase().trim(),
            isActive: true,
          });
          if (!admin) return null;

          const valid = await bcrypt.compare(parsed.data.password, admin.password);
          if (!valid) return null;

          admin.lastLoginAt = new Date();
          await admin.save();

          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        } catch (err) {
          console.error("[auth] authorize failed:", err);
          return null;
        }
      },
    }),
  ],
});
