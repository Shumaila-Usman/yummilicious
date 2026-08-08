import { Suspense } from "react";
import { fetchActiveAddons, fetchProducts, fetchCategories } from "@/lib/data/server";
import { getPageFields } from "@/lib/cms/get-page";
import { MenuClient } from "./MenuClient";

export const metadata = {
  title: "Menu",
  description: "Browse Yummilicious full menu — breakfasts, shawarmas, paratha rolls, chai & more.",
};

export default async function MenuPage() {
  const [products, categories, addons, hero] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchActiveAddons(),
    getPageFields("menu", "hero"),
  ]);

  return (
    <Suspense>
      <MenuClient
        products={products}
        categories={categories}
        addons={addons}
        hero={hero}
      />
    </Suspense>
  );
}
