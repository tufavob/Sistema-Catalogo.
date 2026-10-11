export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ProductStatus = "available" | "out_of_stock" | "promo";

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number; // 1 a 5
  comment: string;
  is_verified?: boolean;
  created_at: string;
}

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
  color_galleries: string | Record<string, unknown> | null;
  description: string | null;
  category_id: string | null;
  created_at: string;
};

export type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type ProductColorGallery = Record<string, string[]>;

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
  color_galleries: string | null;
};
