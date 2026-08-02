import { Suspense } from "react";
import { fetchActiveAddons, fetchProducts, fetchCategories } from "@/lib/data/server";
import { MenuClient } from "./MenuClient";

export const metadata = {
  title: "Menu",
  description: "Browse Yummilicious full menu — breakfasts, shawarmas, paratha rolls, chai & more.",
};

export default async function MenuPage() {
  const [products, categories, addons] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchActiveAddons(),
  ]);

  return (
    <Suspense>
      <MenuClient products={products} categories={categories} addons={addons} />
    </Suspense>
  );
}
