interface ProductThumbProps {
  src?: string | null;
  alt: string;
}

export default function ProductThumb({ src, alt }: ProductThumbProps) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
        Sin foto
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-zinc-100">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}