export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ProductStatus = "available" | "out_of_stock" | "promo";

export type Product = {
  id: string;
  title: string;
  brand: string;
  model: string;
  storage: string | null;
  color: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  image_url: string | null;
  description: string | null;
  category_id: string | null;
  created_at: string;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type ProductInput = {
  title: string;
  brand: string;
  model: string;
  storage: string | null;
  color: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
};