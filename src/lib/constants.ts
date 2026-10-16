export interface Advisor {
  id: string;
  name: string;
  role: string;
  phone: string;
  available: boolean;
}

export const ADVISORS: Advisor[] = [
  {
    id: "asesor-1",
    name: "Asesor 1",
    role: "Atención inmediata y pedidos",
    phone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51916196809",
    available: true,
  },
  {
    id: "asesor-2",
    name: "Asesor 2",
    role: "Atención y seguimiento de pedidos",
    phone: "51934988783",
    available: true,
  },
];
