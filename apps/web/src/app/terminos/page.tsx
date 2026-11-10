import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Condiciones de uso del software Travel OS para agencias de viajes y mayoristas.",
  alternates: { canonical: "/terminos" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Términos de uso" updated="10 de noviembre de 2026">
      <p>
        Estos términos regulan el uso de Travel OS, software en la nube de PDP Comunica («PDP») para agencias de viajes y
        mayoristas. Al crear una cuenta o usar el servicio, la agencia los acepta.
      </p>
      <h2>1. El servicio</h2>
      <p>
        Travel OS ofrece CRM, cotizador con inteligencia artificial, itinerarios, portal del viajero, tablero gerencial y
        asistente. Las funciones marcadas como «Próximamente» no hacen parte del servicio hasta que se publiquen.
      </p>
      <h2>2. Cuentas y seguridad</h2>
      <ul>
        <li>La agencia administra sus usuarios y roles, y responde por el uso de sus cuentas.</li>
        <li>Las contraseñas son personales. Avísanos de inmediato si sospechas un acceso no autorizado.</li>
      </ul>
      <h2>3. Uso de la inteligencia artificial</h2>
      <p>
        Las sugerencias de la IA son una ayuda. Los precios y totales los calcula el sistema con el catálogo de la agencia,
        pero la agencia debe revisar cada cotización antes de enviarla y responde por la información que entrega a sus
        viajeros.
      </p>
      <h2>4. Datos</h2>
      <p>
        Los datos que la agencia carga son de la agencia. PDP los trata como encargado según la{" "}
        <Link href="/privacidad" className="text-secondary underline">
          política de tratamiento de datos
        </Link>
        . La agencia declara tener la autorización de sus prospectos y viajeros para cargar sus datos.
      </p>
      <h2>5. Uso aceptable</h2>
      <p>
        No está permitido usar el servicio para actividades ilegales, enviar spam, intentar acceder a datos de otras agencias,
        probar vulnerabilidades sin autorización escrita o sobrecargar el sistema. Los reportes de seguridad se reciben en
        contacto@pdpcomunica.com.
      </p>
      <h2>6. Disponibilidad y soporte</h2>
      <p>
        PDP hace esfuerzos razonables para mantener el servicio disponible y hace copias de seguridad de la base de datos.
        El soporte se presta por correo y WhatsApp en horario hábil de Colombia.
      </p>
      <h2>7. Precio y terminación</h2>
      <p>
        El precio y la forma de pago se acuerdan en la propuesta comercial de cada agencia. La agencia puede terminar el
        servicio en cualquier momento y pedir la exportación de sus datos.
      </p>
      <h2>8. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República de Colombia.</p>
    </LegalPage>
  );
}
