import { fetchProducts } from "@/lib/data/server";
import { PreOrderClient } from "./PreOrderClient";

export default async function PreOrderPage() {
  const products = await fetchProducts();
  return <PreOrderClient products={products} />;
}
