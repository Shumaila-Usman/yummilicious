import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { contactSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ContactSubmission } from "@/models/ContactSubmission";
import { parsePagination, serialize, jsonValidationError } from "@/lib/api/helpers";
import { notifyContactSubmission } from "@/lib/email/templates";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return jsonValidationError(parsed.error.flatten());

    await connectDB();
    const submission = await ContactSubmission.create(parsed.data);

    notifyContactSubmission(parsed.data);

    return NextResponse.json(
      serialize({ id: submission._id.toString(), message: "Thank you! We'll get back to you soon." }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/contact:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const filter: Record<string, unknown> = {};
    if (searchParams.get("unread") === "true") filter.isRead = false;

    const [submissions, total] = await Promise.all([
      ContactSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ContactSubmission.countDocuments(filter),
    ]);

    return NextResponse.json(
      serialize({
        submissions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      })
    );
  } catch (err) {
    console.error("GET /api/contact:", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
