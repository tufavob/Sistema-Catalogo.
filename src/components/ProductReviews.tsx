"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import type { Review } from "@/types/database";
import { StarIcon } from "@/components/icons";

type FormData = {
  customer_name: string;
  rating: number;
  comment: string;
};

const EMPTY_FORM: FormData = {
  customer_name: "",
  rating: 0,
  comment: "",
};

export function ProductReviews({ productId }: { productId: string }) {
  const supabase = getBrowserClient();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [hoverRating, setHoverRating] = useState(0);

  async function loadReviews() {
    try {
      setError(null);
      const { data, error: queryError } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error(queryError);
        setError(queryError.message);
        setReviews([]);
        return;
      }

      setReviews((data ?? []) as Review[]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error al cargar reseñas");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetch() {
      if (ignore) return;
      await loadReviews();
    }

    void fetch();

    return () => {
      ignore = true;
    };
  }, [productId, supabase]);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : Number(
          (
            reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
            totalReviews
          ).toFixed(1),
        );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customer_name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (form.rating < 1 || form.rating > 5) {
      setError("Selecciona una calificación de 1 a 5 estrellas");
      return;
    }
    if (!form.comment.trim()) {
      setError("El comentario es obligatorio");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { error: insertError } = await supabase.from("reviews").insert({
        product_id: productId,
        customer_name: form.customer_name.trim(),
        rating: form.rating,
        comment: form.comment.trim(),
      });

      if (insertError) {
        console.error(insertError);
        setError(insertError.message);
        return;
      }

      setForm(EMPTY_FORM);
      setHoverRating(0);
      await loadReviews();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error al enviar reseña");
    } finally {
      setSubmitting(false);
    }
  };

  function renderStars(
    rating: number,
    interactive = false,
    onRate?: (r: number) => void,
    onHover?: (r: number) => void,
    onLeave?: () => void,
  ) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const active =
            hoverRating > 0 && interactive
              ? star <= hoverRating
              : star <= rating;
          return (
            <button
              key={star}
              type={interactive ? "button" : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRate?.(star)}
              onMouseEnter={() => interactive && onHover?.(star)}
              onMouseLeave={() => interactive && onLeave?.()}
              className="p-0.5"
            >
              <StarIcon
                className={`h-5 w-5 ${
                  active ? "fill-amber-400 text-amber-400" : "text-zinc-300"
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6 border-t border-zinc-200 pt-6">
      <div>
        <h3 className="text-base font-semibold text-zinc-900">
          Reseñas del producto
        </h3>

        {loading ? (
          <div className="mt-4 animate-pulse space-y-3">
            <div className="h-6 w-40 rounded bg-zinc-200" />
            <div className="h-20 w-full rounded bg-zinc-100" />
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-zinc-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-zinc-500">/ 5.0</span>
              </div>
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-zinc-500">
                {totalReviews === 0
                  ? "Sin reseñas"
                  : `${totalReviews} opinión${totalReviews === 1 ? "" : "es"}`}
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Sé el primero en dejar una reseña sobre este producto.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900">
                          {review.customer_name}
                        </span>
                        {review.is_verified ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Verificada
                          </span>
                        ) : null}
                      </div>
                      <time className="text-xs text-zinc-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "es-PE",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </time>
                    </div>
                    <div className="mt-2">{renderStars(review.rating)}</div>
                    {review.comment ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                        {review.comment}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-900">Deja tu reseña</h4>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Tu nombre
          </label>
          <input
            type="text"
            value={form.customer_name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, customer_name: e.target.value }))
            }
            placeholder="Ej. Juan Pérez"
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Calificación
          </label>
          {renderStars(
            form.rating,
            true,
            (r) => setForm((prev) => ({ ...prev, rating: r })),
            (r) => setHoverRating(r),
            () => setHoverRating(0),
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Comentario
          </label>
          <textarea
            value={form.comment}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="¿Qué te pareció este producto?"
            rows={3}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            disabled={submitting}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Enviando..." : "Enviar reseña"}
        </button>
      </form>
    </div>
  );
}
