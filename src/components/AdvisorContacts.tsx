import { ADVISORS } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

const DEFAULT_MESSAGE =
  "Hola, me gustaría pedir información sobre el catálogo de celulares Northumbria.";

export function AdvisorContacts({
  message = DEFAULT_MESSAGE,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <ul className={className ?? "mt-4 space-y-3"}>
      {ADVISORS.map((advisor) => (
        <li key={advisor.id}>
          <a
            href={buildWhatsAppLink(message, advisor)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escribir a ${advisor.name} por WhatsApp`}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left transition-colors hover:border-amber-400/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
              <WhatsAppIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">
                {advisor.name}
              </span>
              <span className="mt-0.5 block text-xs leading-4 text-zinc-300">
                {advisor.role}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
