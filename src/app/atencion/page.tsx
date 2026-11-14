import type { Metadata } from "next";
import LegalShell from "@/components/common/LegalShell";
import AttentionForm from "@/components/common/AttentionForm";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Atención, peticiones y reclamos",
  alternates: { canonical: "/atencion" },
};
export default function Page() {
  return (
    <LegalShell
      title="Estamos para escucharte."
      intro="Prepara una consulta, solicitud de garantía, reclamo o petición sobre tus datos. El canal disponible es WhatsApp al 304 445 1436."
    >
      <section>
        <h2>Envía tu solicitud</h2>
        <p>
          Este formulario prepara el mensaje en tu navegador. El envío y la
          recepción se realizan en WhatsApp; no genera un número de radicado
          automático.
        </p>
        <AttentionForm />
      </section>
      <section>
        <h2>Seguimiento y derechos</h2>
        <p>
          Pide confirmación de recepción y conserva los soportes. Las consultas
          y reclamos sobre datos personales se atienden en los términos de la
          política de privacidad. Los reclamos directos de consumo se responden
          dentro de los quince días hábiles siguientes a su recepción, conforme
          al artículo 58 de la Ley 1480 de 2011.
        </p>
        <p>
          Si necesitas acudir a la autoridad, consulta los canales oficiales de
          la{" "}
          <a
            href="https://www.sic.gov.co/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Superintendencia de Industria y Comercio
          </a>
          . Este canal no atiende emergencias ni monitorea cámaras en vivo.
        </p>
      </section>
    </LegalShell>
  );
}
