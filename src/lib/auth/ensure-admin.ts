import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/models/Admin";

/**
 * On serverless deploys, seed often never runs against Atlas.
 * If zero admins exist, create one from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
export async function ensureAdminFromEnv(): Promise<void> {
  await connectDB();
  const count = await Admin.countDocuments();
  if (count > 0) return;

  const email = (process.env.ADMIN_EMAIL || "admin@yummilicious.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "YummiAdmin@123";

  if (password.length < 6) {
    console.error("[auth] ADMIN_PASSWORD too short — cannot bootstrap admin");
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await Admin.create({
    name: "Yummilicious Admin",
    email,
    password: hashed,
    role: "superadmin",
    isActive: true,
  });
  console.info(`[auth] Bootstrapped admin user: ${email}`);
}
