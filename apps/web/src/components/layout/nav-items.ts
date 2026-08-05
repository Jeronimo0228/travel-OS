export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Panel de Control", icon: "dashboard" },
  { href: "/crm", label: "CRM Inteligente", icon: "group" },
  { href: "/cotizador", label: "Cotizador", icon: "chat_bubble" },
  { href: "/itinerario", label: "Itinerario", icon: "map" },
  { href: "/agentes", label: "Centro de Agentes", icon: "smart_toy" },
];
