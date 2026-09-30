import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { Category, ProductWithCategory } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let user = null;

  try {
    supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
  }

  if (!user || !supabase) {
    redirect("/admin/login");
  }

  let products: ProductWithCategory[] = [];
  let categories: Category[] = [];

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, title, brand, model, storage, color, price, stock, status, image_url, description, category_id, created_at, categories(id, name, slug)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id, name, slug, created_at")
        .order("name"),
    ]);

    products = (productsResult.data ?? []) as unknown as ProductWithCategory[];
    categories = (categoriesResult.data ?? []) as unknown as Category[];
  } catch (error) {
    console.error("Error al cargar productos y categorías:", error);
  }

  return (
    <div>
      <AdminHeader userEmail={user.email} />
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <AdminDashboard initialProducts={products} categories={categories} />
      </div>
    </div>
  );
}
