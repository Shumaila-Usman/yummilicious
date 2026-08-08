import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Customer } from "@/models/Customer";
import { GalleryImage } from "@/models/GalleryImage";
import { Testimonial } from "@/models/Testimonial";
import { Faq } from "@/models/Faq";
import { Settings } from "@/models/Settings";
import { serialize } from "@/lib/api/helpers";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const baseFilter = { isDeleted: false, status: { $ne: "cancelled" } };

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      revenueAgg,
      recentOrders,
      bestSellers,
      lowStock,
      salesChart,
      allProducts,
      categories,
      productCount,
      customerCount,
      galleryCount,
      testimonialCount,
      faqCount,
      settings,
    ] = await Promise.all([
      Order.countDocuments(baseFilter),
      Order.countDocuments({ ...baseFilter, createdAt: { $gte: startOfToday } }),
      Order.countDocuments({
        ...baseFilter,
        status: { $in: ["received", "confirmed", "preparing", "ready", "out_for_delivery"] },
      }),
      Order.countDocuments({ ...baseFilter, status: "delivered" }),
      Order.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber customer status total createdAt paymentMethod")
        .lean(),
      Order.aggregate([
        { $match: baseFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.lineTotal" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),
      Product.find({
        isDeleted: false,
        "inventory.track": true,
        $expr: { $lte: ["$inventory.quantity", "$inventory.lowStockThreshold"] },
      })
        .select("name slug inventory featuredImage")
        .limit(20)
        .lean(),
      Order.aggregate([
        {
          $match: {
            ...baseFilter,
            createdAt: { $gte: fourteenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            orders: { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ isDeleted: false }).select("_id categories name").lean(),
      Category.find({ isActive: true }).select("_id name slug").lean(),
      Product.countDocuments({ isDeleted: false }),
      Customer.countDocuments(),
      GalleryImage.countDocuments({ isActive: true }),
      Testimonial.countDocuments({ isActive: true }),
      Faq.countDocuments({ isActive: true }),
      Settings.findOne().select("storeOpen brandName businessHours").lean(),
    ]);

    const productCategoryMap = new Map(
      allProducts.map((p) => [
        p._id.toString(),
        p.categories.map((c: { toString(): string }) => c.toString()),
      ])
    );

    const categoryOrders = await Order.aggregate([
      { $match: baseFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          revenue: { $sum: "$items.lineTotal" },
          quantity: { $sum: "$items.quantity" },
        },
      },
    ]);

    const categoryStats = new Map<string, { revenue: number; quantity: number }>();
    for (const row of categoryOrders) {
      const catIds = productCategoryMap.get(row._id) ?? [];
      for (const catId of catIds) {
        const existing = categoryStats.get(catId) ?? { revenue: 0, quantity: 0 };
        existing.revenue += row.revenue;
        existing.quantity += row.quantity;
        categoryStats.set(catId, existing);
      }
    }

    const categoryPerformance = categories
      .map((cat) => ({
        categoryId: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        ...(categoryStats.get(cat._id.toString()) ?? { revenue: 0, quantity: 0 }),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const chartDays: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = salesChart.find((s: { _id: string }) => s._id === key);
      chartDays.push({
        date: key,
        orders: found?.orders ?? 0,
        revenue: found?.revenue ?? 0,
      });
    }

    return NextResponse.json(
      serialize({
        stats: {
          totalOrders,
          todayOrders,
          pendingOrders,
          completedOrders,
          revenue: revenueAgg[0]?.total ?? 0,
          productCount,
          categoryCount: categories.length,
          customerCount,
          galleryCount,
          testimonialCount,
          faqCount,
          storeOpen: settings?.storeOpen ?? true,
        },
        bestSellers,
        recentOrders,
        lowStock,
        salesChart: chartDays,
        categoryPerformance,
      })
    );
  } catch (err) {
    console.error("GET /api/dashboard:", err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
