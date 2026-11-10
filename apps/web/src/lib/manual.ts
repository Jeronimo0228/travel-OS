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
      "Vincula la cotización a un prospecto con el selector del encabezado y genera el PDF.",
      "Pulsa «Enviar por WhatsApp»: se abre WhatsApp con las alternativas y sus precios; eliges el contacto del cliente y adjuntas el PDF.",
      "Si el destino no está en tu catálogo, el sistema lo avisa en lugar de inventar precios.",
    ],
  },
  {
    id: "conocimiento",
    title: "4. Enseñarle a la IA cómo habla tu agencia",
    roles: ["Admin", "Gerente"],
    image: "/manual/11-base-conocimiento.png",
    steps: [
      "Entra a «Base IA» en el menú principal (o desde el aviso del cotizador cuando falta información).",
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
      "Agrega actividades por día al itinerario. Con la «Biblioteca del catálogo» añades hoteles y actividades de tu catálogo eligiendo el día y la hora.",
      "Cada actividad tiene «Editar» y «Eliminar». En «Documentos» puedes subir el voucher o el tiquete (PDF, JPG o PNG de hasta 4 MB) y el viajero lo ve en su portal.",
      "Pulsa «Generar enlace del portal» y envíalo con los botones de WhatsApp o correo. El enlace dura 24 horas y generar uno nuevo invalida el anterior.",
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
    id: "asistente",
    title: "7. Preguntarle al asistente IA",
    roles: ["Admin", "Gerente", "Asesor"],
    image: "/manual/12-asistente-ia.png",
    steps: [
      "Toca el botón redondo de la esquina inferior derecha o «Análisis IA» en la barra superior.",
      "Pregunta en tus palabras, por ejemplo: «¿Tengo seguimientos vencidos?» o «¿Cómo creo una cotización?». También puedes tocar una de las preguntas sugeridas.",
      "El asistente responde con las cifras de tu agencia (un asesor solo ve las suyas) y te deja enlaces a la pantalla indicada.",
      "Es de solo lectura: no cambia ni envía datos. Si hace muchas preguntas seguidas, espera un minuto.",
    ],
  },
  {
    id: "agentes",
    title: "8. Centro de Agentes",
    roles: ["Admin", "Gerente", "Asesor"],
    image: "/manual/13-centro-agentes.png",
    steps: [
      "En la barra lateral entra a «Centro de Agentes» para ver los tres agentes de IA, qué reciben, qué entregan y sus reglas de seguridad.",
      "El administrador ve además el estado de la IA: proveedor principal, llaves disponibles por agente y proveedores de respaldo (nunca las llaves).",
    ],
  },
  {
    id: "catalogo",
    title: "9. Mantener el catálogo",
    roles: ["Admin", "Gerente"],
    steps: [
      "En la barra lateral entra a «Catálogo». Verás los hoteles y actividades que usa el cotizador, con su precio por noche o por persona.",
      "«Nuevo ítem» agrega un producto; «Editar» cambia nombre, destino, descripción o precio. La descripción ayuda a la IA a elegir.",
      "«Archivar» saca un producto de las nuevas cotizaciones sin borrar las que ya lo usan; «Mostrar archivados» y «Restaurar» lo devuelven.",
      "«Importar CSV»: descarga la plantilla, llénala en Excel o Google Sheets y súbela. Si una fila tiene error, el sistema dice cuál y no importa nada.",
    ],
  },
  {
    id: "usuarios",
    title: "10. Invitar a tu equipo y gestionar accesos",
    roles: ["Admin"],
    steps: [
      "Entra a «Usuarios». Escribe el correo y el rol (asesor, gerente o administrador) y pulsa «Invitar».",
      "La persona recibe el enlace por correo; también puedes copiarlo o enviarlo por WhatsApp. Vence en 7 días y sirve una sola vez.",
      "Cambia el rol desde la lista. «Desactivar» impide entrar y cierra de inmediato sus sesiones abiertas; «Reactivar» lo devuelve.",
      "Si alguien olvidó su contraseña, pulsa «Enlace de contraseña» y envíaselo (vence en 30 minutos). También puede usar «¿Olvidaste tu contraseña?» en el inicio de sesión.",
    ],
  },
  {
    id: "red",
    title: "11. Red mayorista",
    roles: ["Admin", "Gerente", "Asesor"],
    steps: [
      "Agencia aliada: en «Red mayorista» → «Mis mayoristas» el administrador acepta la invitación del mayorista.",
      "En «Programas disponibles» ves la tarifa neta, tu comisión y los cupos de cada salida. Elige la salida, escribe el viajero y los pasajeros y pulsa «Solicitar cupos».",
      "En «Mis reservas» sigues el estado (solicitada, confirmada o cancelada) y puedes cancelar mientras el mayorista no la confirme.",
      "Mayorista: el administrador activa «Operar también como mayorista». Luego crea programas con sus salidas y cupos, los publica, invita agencias por su identificador con un porcentaje de comisión y confirma las reservas en «Reservas recibidas».",
    ],
  },
  {
    id: "admin",
    title: "12. Configuración de la agencia",
    roles: ["Admin", "Gerente"],
    steps: [
      "«Marca blanca»: sube el logo y elige el color principal de tu agencia.",
      "«Auditoría» (solo Admin): consulta quién hizo cada cambio, incluidos los accesos al portal.",
    ],
  },
];
