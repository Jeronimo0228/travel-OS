import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de tratamiento de datos personales",
  description: "Cómo Travel OS trata los datos personales de agencias, asesores y viajeros conforme a la Ley 1581 de 2012.",
  alternates: { canonical: "/privacidad" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de tratamiento de datos personales" updated="10 de noviembre de 2026">
      <p>
        Esta política explica cómo PDP Comunica (en adelante, «PDP»), responsable del software Travel OS, trata los datos
        personales conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas colombianas de protección de datos.
      </p>
      <h2>1. Roles</h2>
      <ul>
        <li>
          <b>La agencia o mayorista cliente</b> es responsable de los datos de sus prospectos y viajeros que carga en Travel OS.
        </li>
        <li>
          <b>PDP</b> actúa como encargado de ese tratamiento: guarda y procesa los datos solo para prestar el servicio y según
          las instrucciones de la agencia. PDP es responsable de los datos de los usuarios de la agencia (administradores,
          gerentes y asesores) necesarios para la cuenta.
        </li>
      </ul>
      <h2>2. Datos que tratamos</h2>
      <ul>
        <li>Usuarios de la agencia: nombre, correo, rol y registros de actividad (auditoría).</li>
        <li>Prospectos y viajeros: nombre, correo, teléfono, destino, notas, itinerario, documentos del viaje y mensajes del portal.</li>
        <li>Datos técnicos: dirección IP, fecha y hora de acceso, para seguridad y prevención de fraude.</li>
      </ul>
      <h2>3. Finalidades</h2>
      <ul>
        <li>Prestar las funciones contratadas: CRM, cotizaciones, itinerarios, portal del viajero y tablero.</li>
        <li>Generar sugerencias con inteligencia artificial (cotizaciones, priorización y asistente). A los proveedores de IA se les envía solo la información necesaria para cada tarea; el copiloto y el asistente no reciben correos ni teléfonos.</li>
        <li>Seguridad, auditoría, soporte y cumplimiento legal.</li>
      </ul>
      <p>PDP no vende datos personales ni los usa para publicidad de terceros.</p>
      <h2>4. Proveedores (encargados y transferencias)</h2>
      <p>
        Para operar el servicio PDP usa proveedores de nube e IA que pueden procesar datos fuera de Colombia, con garantías
        contractuales de seguridad: Vercel (alojamiento), Neon (base de datos), Google (Gemini), Groq y OpenRouter (respaldo de IA).
        Al aceptar el servicio, la agencia autoriza estas transmisiones internacionales.
      </p>
      <h2>5. Seguridad</h2>
      <p>
        Datos separados por agencia, roles y permisos, contraseñas cifradas, conexiones HTTPS, enlaces del portal con
        vencimiento de 24 horas, registro de auditoría y pruebas de seguridad automáticas en cada cambio del software.
      </p>
      <h2>6. Derechos de los titulares</h2>
      <p>
        Los titulares pueden conocer, actualizar, rectificar y suprimir sus datos, revocar la autorización y presentar quejas
        ante la Superintendencia de Industria y Comercio. Los viajeros y prospectos deben dirigirse primero a su agencia.
        Las solicitudes a PDP se envían a <b>contacto@pdpcomunica.com</b> y se responden en los plazos de ley: 10 días hábiles
        para consultas y 15 días hábiles para reclamos.
      </p>
      <h2>7. Conservación</h2>
      <p>
        Los datos se conservan mientras la agencia tenga el servicio activo. Al terminar, la agencia puede pedir la exportación;
        PDP elimina los datos dentro de los 90 días siguientes, salvo obligación legal de conservarlos.
      </p>
      <h2>8. Cambios</h2>
      <p>Publicaremos cualquier cambio en esta página con su fecha de actualización.</p>
    </LegalPage>
  );
}
