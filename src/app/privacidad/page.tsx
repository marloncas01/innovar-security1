import Link from "next/link";
import LegalShell from "@/components/common/LegalShell";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Política de tratamiento de datos",
  alternates: { canonical: "/privacidad" },
};
export default function Page() {
  return (
    <LegalShell
      title="Política de tratamiento de datos"
      intro="Conoce qué información usamos, para qué la necesitamos y cómo ejercer tus derechos."
    >
      <section>
        <h2>1. Alcance y finalidades</h2>
        <p>
          Esta política cubre los datos que entregas al crear una cuenta,
          solicitar una visita, gestionar una cotización o comunicarte con
          Innovar Security. Se utilizan para atender tu solicitud, coordinar
          servicios, gestionar pagos cuando estén habilitados, brindar soporte y
          cumplir obligaciones legales. No se autoriza el envío de publicidad
          por el solo hecho de crear una cuenta.
        </p>
      </section>
      <section>
        <h2>2. Información que tratamos</h2>
        <p>
          Nombre, correo y teléfono; dirección y referencias del lugar del
          servicio; historial de citas y cotizaciones; fotografías que decidas
          aportar y comprobantes de pago. La identificación puede ser necesaria
          para facturación o para verificar una solicitud sobre datos
          personales. Evita enviar documentos, datos sensibles o imágenes de
          terceros que no sean necesarios.
        </p>
        <p>
          Este portal no ofrece acceso a grabaciones de cámaras ni
          reconocimiento facial. Las imágenes del inmueble son aportadas por el
          usuario para evaluar el servicio.
        </p>
      </section>
      <section>
        <h2>3. Autorización y derechos</h2>
        <p>
          Antes de registrarte se solicita tu autorización para estas
          finalidades. Puedes conocer, consultar gratuitamente, actualizar y
          corregir tus datos; pedir prueba de la autorización e información
          sobre su uso; y solicitar su eliminación o revocar la autorización
          cuando no exista un deber legal o contractual de conservarlos. Los
          datos sensibles y las respuestas sobre ellos son facultativos. Este
          portal está dirigido a personas mayores de edad.
        </p>
      </section>
      <section>
        <h2>4. Cómo presentar una consulta o reclamo</h2>
        <p>
          Utiliza el canal de{" "}
          <Link href="/atencion">peticiones y reclamos</Link>. Indica tu nombre,
          un medio de respuesta, el derecho que deseas ejercer y los hechos.
          Verificaremos tu identidad por un medio proporcional a la solicitud.
          No envíes contraseñas ni códigos de acceso.
        </p>
        <p>
          Las consultas se atienden en hasta 10 días hábiles desde su recepción;
          si se requiere prórroga, se informará la causa y una nueva fecha, con
          hasta 5 días hábiles adicionales. Los reclamos completos se atienden
          en hasta 15 días hábiles contados desde el día siguiente a su
          recepción, con posible prórroga informada de hasta 8 días hábiles. Si
          falta información se solicitará completarla conforme a la ley. Antes
          de acudir a la SIC por protección de datos, debe agotarse la consulta
          o reclamo ante el responsable o encargado.
        </p>
      </section>
      <section>
        <h2>5. Proveedores, conservación y seguridad</h2>
        <p>
          La aplicación utiliza Vercel para alojamiento y Prisma Postgres para
          la base de datos. Al elegir WhatsApp, pasas a un servicio externo
          sujeto a sus políticas. El uso de proveedores tecnológicos puede
          implicar tratamiento fuera de Colombia; el responsable debe verificar
          las condiciones contractuales y las reglas aplicables a transmisiones
          o transferencias internacionales.
        </p>
        <p>
          Se conserva la información durante la gestión del servicio y el tiempo
          necesario para atender obligaciones legales o contractuales. Después
          procede su eliminación o anonimización según corresponda. Las
          contraseñas se almacenan mediante hash; el acceso a información de
          clientes requiere autenticación. Ningún sistema elimina por completo
          los riesgos.
        </p>
      </section>
      <section>
        <h2>6. Vigencia y cambios</h2>
        <p>
          Esta versión se publica el 14 de noviembre de 2026. Los cambios
          sustanciales de finalidad o de responsable deben comunicarse antes de
          su implementación y requerir una nueva autorización cuando
          corresponda. La información de identificación pendiente debe
          completarse para cerrar la entrega legal.
        </p>
        <p>
          Referencia:{" "}
          <a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981">
            Ley 1581 de 2012
          </a>{" "}
          y Decreto 1074 de 2015.
        </p>
      </section>
    </LegalShell>
  );
}
