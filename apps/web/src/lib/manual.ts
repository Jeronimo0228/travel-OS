/** In-app user manual (Sprint 3). Screenshots live in /public/manual. */
export type ManualStep = { text: string };
export type ManualSection = {
  id: string;
  title: string;
  roles: string[];
  image?: string;
  steps: string[];
};

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: "ingreso",
    title: "1. Ingresar a TravelOS",
    roles: ["Admin", "Gerente", "Asesor"],
    image: "/manual/01-dashboard.png",
    steps: [
      "Abre https://travel-os.pdpcomunica.com e ingresa tu correo, contraseña y el identificador de tu agencia.",
      "El gerente llega al Panel de Control con ventas cerradas, conversión, embudo y desempeño por asesor.",
      "La campana superior muestra los follow-ups vencidos; «Marcar leído» baja el contador.",
    ],
  },
  {
    id: "crm",
    title: "2. Gestionar prospectos (CRM) y el copiloto IA",
    roles: ["Gerente", "Asesor"],
    image: "/manual/10-crm-copiloto.png",
    steps: [
      "Entra a «CRM Inteligente». Crea un prospecto con «Añadir Prospecto».",
      "Arrastra la tarjeta entre columnas para cambiar la etapa (Prospecto → Cotizando → En cierre → Ganado/Perdido).",
      "El panel «Co-Piloto IA» ordena los prospectos por probabilidad de cierre y explica la razón de cada puntaje.",
      "Usa el ícono de tareas para programar un seguimiento; si vence, aparece en la campana.",
    ],
  },
  {
    id: "cotizador",
    title: "3. Cotizar con IA en lenguaje natural",
    roles: ["Gerente", "Asesor"],
    image: "/manual/09-cotizador-ia.png",
    steps: [
      "Entra a «Cotizador» y escribe el pedido tal como lo dice el cliente, por ejemplo: «Pareja a Cartagena 5 días, hotel frente al mar».",
      "La IA arma 2 o 3 alternativas usando solo el catálogo y precios de tu agencia, en COP.",
      "Vincula la cotización a un prospecto con el selector del encabezado y genera el PDF para enviarlo.",
      "Si el destino no está en tu catálogo, el sistema lo avisa en lugar de inventar precios.",
    ],
  },
  {
    id: "conocimiento",
    title: "4. Enseñarle a la IA cómo habla tu agencia",
    roles: ["Admin", "Gerente"],
    image: "/manual/11-base-conocimiento.png",
    steps: [
      "En la barra lateral entra a «Base IA».",
      "Escribe el tono de comunicación, las políticas (anticipos, cancelación, qué incluye) y las preguntas frecuentes.",
      "Guarda. Las siguientes cotizaciones y el copiloto usarán ese contenido en títulos, resúmenes y razones.",
    ],
  },
  {
    id: "viajes",
    title: "5. Armar el viaje y compartir el portal",
    roles: ["Gerente", "Asesor"],
    image: "/manual/04-viaje-detalle.png",
    steps: [
      "Entra a «Viajes y Portal» y abre una reserva.",
      "Agrega actividades por día al itinerario y adjunta documentos (vouchers, tiquetes, seguro).",
      "Pulsa «Generar enlace del portal» y envíalo al viajero. El enlace dura 24 horas y generar uno nuevo invalida el anterior.",
      "Responde los mensajes del viajero desde el chat de la reserva.",
    ],
  },
  {
    id: "portal",
    title: "6. Portal del viajero (desde el celular)",
    roles: ["Viajero"],
    image: "/manual/05-portal-itinerario.png",
    steps: [
      "Abre el enlace que te envió la agencia; no necesitas crear cuenta.",
      "En «Itinerario» ves cada día del viaje; en «Documentos», tus vouchers; en «Chat», hablas con tu asesor.",
    ],
  },
  {
    id: "admin",
    title: "7. Configuración de la agencia",
    roles: ["Admin", "Gerente"],
    steps: [
      "«Marca blanca»: sube el logo y elige el color principal de tu agencia.",
      "«Auditoría» (solo Admin): consulta quién hizo cada cambio, incluidos los accesos al portal.",
    ],
  },
];
