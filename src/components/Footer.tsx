import { WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const footerMessage =
  "Hola, me gustaría pedir información sobre el catálogo de celulares Northumbria.";

const QUICK_LINKS = [
  { label: "Catálogo", href: "#catalogo" },
  { label: "Acceso Admin", href: "/admin" },
];

const STORE_DETAILS = [
  "Envíos a todo el Perú",
  "Equipos originales verificados",
  "Pagos por transferencia",
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-emerald-900/70 bg-emerald-950 text-zinc-300 sm:mt-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <Reveal>
            <div>
              <p className="text-lg font-black tracking-tight text-white">
                Northumbria
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-400">
                Buen Muchacho
              </p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-300">
                Celulares, accesorios y streetwear exclusivo con envío asegurado.
                Pedidos directos por WhatsApp, sin intermediarios.
              </p>
              <a
                href={buildWhatsAppLink(footerMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-5 h-11 min-h-11 px-5"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Escribir por WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <nav aria-label="Enlaces del sitio">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Navegación
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {QUICK_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={buildWhatsAppLink(footerMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </nav>
          </Reveal>

          <Reveal delay={180}>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Tienda
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {STORE_DETAILS.map((detail) => (
                  <li key={detail} className="text-zinc-300">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-300">
            © {new Date().getFullYear()} Northumbria · Buen Muchacho. Todos los
            derechos reservados.
          </p>
          <p className="text-xs text-zinc-400">
            Compra directa, sin vueltas.
          </p>
        </div>
      </div>
    </footer>
  );
}
