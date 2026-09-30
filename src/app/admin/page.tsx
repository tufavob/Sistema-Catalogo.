import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { Category, ProductWithCategory } from "@/types/database";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, title, brand, model, storage, color, price, stock, status, image_url, description, category_id, created_at, categories(id, name, slug)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug, created_at")
      .order("name"),
  ]);

  const products = (productsResult.data ??
    []) as unknown as ProductWithCategory[];
  const categories = (categoriesResult.data ?? []) as unknown as Category[];

  return (
    <div>
      <AdminHeader userEmail={user.email} />
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <AdminDashboard initialProducts={products} categories={categories} />
      </div>
    </div>
  );
}