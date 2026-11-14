import Link from "next/link";
import LegalShell from "@/components/common/LegalShell";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Términos del servicio",
  alternates: { canonical: "/terminos" },
};
export default function Page() {
  return (
    <LegalShell
      title="Términos del servicio"
      intro="Información para solicitar, cotizar y coordinar servicios de seguridad electrónica."
    >
      <section>
        <h2>1. Solicitudes y contratación</h2>
        <p>
          Puedes explorar los servicios sin crear una cuenta. El registro y la
          solicitud de visita no equivalen por sí solos a una compra ni
          confirman una instalación. La confirmación de una cita se consulta en
          el portal o se acuerda por el canal de atención. La contratación exige
          conocer el alcance y aceptar la propuesta correspondiente.
        </p>
      </section>
      <section>
        <h2>2. Cotizaciones, precios y pagos</h2>
        <p>
          Cuando el precio aparezca como “Por cotizar”, se definirá después de
          evaluar el lugar. Antes de aceptar, solicita el detalle de equipos,
          cantidades, mano de obra, impuestos aplicables, desplazamientos, valor
          total en pesos colombianos, vigencia de la oferta y fecha estimada de
          ejecución. Los trabajos adicionales requieren aceptación previa.
        </p>
        <p>
          Los pagos solo se ofrecen cuando estén habilitados, exista un importe
          y se hayan configurado los datos del destinatario. Comprueba el
          titular y la cuenta antes de transferir. Reportar un comprobante no
          significa que el pago ya esté confirmado.
        </p>
      </section>
      <section>
        <h2>3. Agenda y cambios</h2>
        <p>
          Los horarios publicados corresponden a Colombia y dependen de la
          duración del servicio y la disponibilidad. Puedes solicitar un cambio
          o cancelación desde tu cuenta o comunicarte con el equipo. Si existe
          un anticipo, su devolución o aplicación se revisará según el trabajo
          ejecutado, el acuerdo y los derechos legales del consumidor. No se
          presume una penalidad automática.
        </p>
      </section>
      <section>
        <h2>4. Garantía, retracto y reversión</h2>
        <p>
          La garantía legal y los derechos del consumidor se conservan. Las
          condiciones particulares y los plazos de equipos e instalación deben
          entregarse en la cotización o soporte de venta; no se limitan
          únicamente a lo que ofrezca el fabricante.
        </p>
        <p>
          En ventas a distancia, el retracto puede ejercerse dentro de los cinco
          días hábiles previstos por la ley cuando resulte aplicable. Existen
          excepciones, entre ellas servicios cuya ejecución haya comenzado con
          acuerdo del consumidor. Solicita su evaluación por el canal de
          atención con el soporte de la operación. Para reversión de pagos
          electrónicos por las causales legales, actúa dentro del plazo legal
          aplicable y comunícate también con el emisor del instrumento de pago
          cuando corresponda. El procedimiento depende del medio utilizado.
        </p>
      </section>
      <section>
        <h2>5. Uso responsable y privacidad</h2>
        <p>
          Debes aportar datos veraces, proteger tus credenciales, contar con
          autorización para intervenir el inmueble y comunicar condiciones de
          acceso o riesgo. La instalación de cámaras debe respetar los derechos
          de terceros. El servicio no constituye una garantía de prevención de
          delitos ni un servicio de vigilancia o monitoreo permanente contratado
          por este portal.
        </p>
      </section>
      <section>
        <h2>6. Atención y derechos del consumidor</h2>
        <p>
          Puedes presentar solicitudes de soporte, garantía, devolución o
          reclamos en <Link href="/atencion">Atención al cliente</Link>. Estos
          términos no implican renuncia a derechos irrenunciables ni restringen
          el acceso a autoridades competentes. Se aplica la legislación
          colombiana.
        </p>
        <p>
          Consulta el{" "}
          <a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306">
            Estatuto del Consumidor
          </a>{" "}
          y la{" "}
          <a href="https://www.sic.gov.co/">
            Superintendencia de Industria y Comercio
          </a>
          .
        </p>
      </section>
    </LegalShell>
  );
}
