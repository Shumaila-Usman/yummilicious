/**
 * Ensures admin login exists without wiping other data.
 * Usage: npx tsx scripts/ensure-admin.ts
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/yummilicious";
  const email = (process.env.ADMIN_EMAIL || "admin@yummilicious.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "YummiAdmin@123";

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No DB");

  const admins = db.collection("admins");
  const hash = await bcrypt.hash(password, 12);

  const existing = await admins.findOne({ email });
  if (existing) {
    await admins.updateOne(
      { email },
      {
        $set: {
          password: hash,
          isActive: true,
          name: existing.name || "Yummilicious Admin",
          role: existing.role || "superadmin",
          updatedAt: new Date(),
        },
      }
    );
    console.log("Updated password for existing admin:", email);
  } else {
    await admins.insertOne({
      name: "Yummilicious Admin",
      email,
      password: hash,
      role: "superadmin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("Created admin:", email);
  }

  console.log("Password set from ADMIN_PASSWORD in .env.local");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
