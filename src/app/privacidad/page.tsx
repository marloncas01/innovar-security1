import Link from "next/link";
import { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";

export const metadata: Metadata = {
  title: "Política de Privacidad | Innovar Security",
  description: "Política de tratamiento de datos personales de Innovar Security de conformidad con la Ley 1581 de 2012 de Colombia.",
};

export default function PrivacidadPage() {
  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--color-black)] pt-24 pb-16 text-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-2">Legal</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Política de Tratamiento de Datos Personales</h1>
            <p className="text-metal-400 text-sm">
              Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="space-y-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-10 leading-relaxed text-sm sm:text-base text-metal-300">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Responsable del Tratamiento de Datos</h2>
              <p>
                Innovar Security, con sede de operaciones en Fómeque, Cundinamarca, Colombia (contacto@innovarsecurity.com, teléfono 304 445 1436), en cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia, es el responsable del tratamiento de los datos personales suministrados por los titulares.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. Datos Recolectados</h2>
              <p>
                Para prestar nuestros servicios de seguridad electrónica, agendamiento de visitas técnicas y atención comercial, recolectamos los siguientes datos:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-metal-300">
                <li><strong className="text-white">Datos de identificación y contacto:</strong> Nombres, apellidos, número de cédula o NIT, correo electrónico y número de teléfono móvil.</li>
                <li><strong className="text-white">Datos de ubicación:</strong> Dirección física de instalación, municipio, referencias del inmueble y notas de acceso.</li>
                <li><strong className="text-white">Imágenes e información del entorno:</strong> Fotografías del inmueble cargadas voluntariamente por el titular para evaluar viabilidad técnica y cotizar equipos.</li>
                <li><strong className="text-white">Información de transacciones:</strong> Historial de citas agendadas, comprobantes de pago y estado de cotizaciones.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. Finalidades del Tratamiento</h2>
              <p>Los datos personales recolectados serán utilizados exclusivamente para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-metal-300">
                <li>Gestionar, coordinar y ejecutar visitas técnicas e instalaciones de cámaras de seguridad.</li>
                <li>Emitir cotizaciones detalladas y procesar pagos asociados a los servicios.</li>
                <li>Enviar notificaciones y recordatorios relativos a citas agendadas o cambios de estado.</li>
                <li>Brindar soporte técnico y atención posventa a clientes.</li>
                <li>Cumplir con las obligaciones fiscales, contables y legales pertinentes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. Derechos de los Titulares (Habeas Data)</h2>
              <p>
                De acuerdo con la legislación colombiana, todo titular de datos personales tiene derecho a:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-metal-300">
                <li>Conocer, actualizar y rectificar sus datos personales frente a Innovar Security.</li>
                <li>Solicitar prueba de la autorización otorgada para el tratamiento.</li>
                <li>Ser informado sobre el uso que se ha dado a sus datos.</li>
                <li>Revocar la autorización o solicitar la supresión del dato cuando no exista un deber legal o contractual de conservarlo.</li>
                <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Seguridad de la Información</h2>
              <p>
                Innovar Security adopta medidas técnicas, administrativas y humanas razonables para proteger la información contra adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento. Las contraseñas de acceso al sistema se almacenan cifradas mediante algoritmos de hash criptográfico de alta seguridad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. Procedimiento para Ejercer sus Derechos</h2>
              <p>
                Para ejercer sus derechos de consulta, rectificación o supresión de datos personales, el titular puede enviar una comunicación escrita al correo electrónico <strong className="text-accent">contacto@innovarsecurity.com</strong> o llamar al <strong className="text-accent">304 445 1436</strong> indicando su nombre, número de documento y la solicitud específica. Las solicitudes serán atendidas dentro de los plazos fijados por la Ley 1581 de 2012.
              </p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-light text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Inicio
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[var(--color-black)] border-t border-[var(--color-border)] py-8 text-center">
        <p className="text-sm text-metal-500">
          © {new Date().getFullYear()} Innovar Security. Todos los derechos reservados.
        </p>
      </footer>
    </>
  );
}
