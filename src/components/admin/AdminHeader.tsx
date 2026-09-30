import Link from "next/link";
import { signOut } from "@/app/admin/actions";

export function AdminHeader({
  userEmail,
}: {
  userEmail: string | undefined;
}) {
  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-black text-white">
            N
          </span>
          <div className="leading-tight">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900">
              Panel de administración
            </p>
            {userEmail ? (
              <p className="text-xs text-zinc-500">{userEmail}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Ver Catálogo Público
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-zinc-700"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}