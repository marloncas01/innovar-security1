import Link from "next/link";
import { Metadata } from "next";
import PublicNavbar from "@/components/layout/PublicNavbar";

export const metadata: Metadata = {
  alternates: { canonical: "/terminos" },
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de la plataforma Innovar Security y prestación de servicios de seguridad electrónica.",
};

export default function TerminosPage() {
  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--color-black)] pt-24 pb-16 text-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider block mb-2">Legal</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Términos y Condiciones de Uso</h1>
            <p className="text-metal-400 text-sm">
              Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="space-y-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-10 leading-relaxed text-sm sm:text-base text-metal-300">
            <section>
              <h2 className="text-lg font-bold text-white mb-3">1. Identificación del Prestador</h2>
              <p>
                Innovar Security, con domicilio principal de operaciones en el municipio de Fómeque, Cundinamarca, Colombia (en adelante &quot;Innovar Security&quot; o &quot;la Empresa&quot;), pone a disposición de sus usuarios y clientes esta plataforma digital para la consulta, solicitud, agendamiento y seguimiento de servicios de videovigilancia y seguridad electrónica.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">2. Aceptación de los Términos</h2>
              <p>
                Al acceder, registrarse o utilizar cualquiera de las funciones de esta plataforma web, el usuario acepta de manera expresa, libre e informada los presentes Términos y Condiciones. Si no está de acuerdo con alguno de los puntos aquí descritos, deberá abstenerse de utilizar el servicio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">3. Descripción de los Servicios</h2>
              <p>
                Innovar Security presta servicios especializados que comprenden:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-metal-300">
                <li>Instalación y configuración de cámaras de seguridad CCTV y cámaras IP.</li>
                <li>Mantenimiento preventivo y correctivo de sistemas de videovigilancia.</li>
                <li>Visitas técnicas de diagnóstico, inspección del sitio y levantamiento de requerimientos.</li>
                <li>Emisión de cotizaciones personalizadas de equipos y mano de obra.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">4. Política de Citas, Confirmación y Pagos</h2>
              <p>
                Para garantizar la disponibilidad del personal técnico y evitar desplazamientos infructuosos, toda solicitud de visita o servicio técnico está sujeta a disponibilidad de agenda. Una solicitud sólo se considerará formalmente confirmada una vez se complete el procedimiento de confirmación o pago anticipado cuando corresponda.
              </p>
              <p className="mt-2">
                En caso de requerirse reprogramación, el cliente podrá solicitarla a través del portal de usuario con al menos veinticuatro (24) horas de anticipación a la fecha y hora agendada.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">5. Obligaciones y Declaraciones del Cliente</h2>
              <p>El cliente se compromete a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1.5 pl-2 text-metal-300">
                <li>Suministrar información veraz, completa y actualizada sobre su identidad, ubicación y características del inmueble.</li>
                <li>Garantizar el acceso seguro del personal técnico en la fecha y horario concertados.</li>
                <li>Informar oportunamente sobre riesgos eléctricos, trabajos en altura u otras condiciones particulares de la instalación.</li>
                <li>Respetar la legislación colombiana vigente en materia de privacidad y captura de imágenes en espacios públicos o privados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">6. Garantías y Limitación de Responsabilidad</h2>
              <p>
                Innovar Security garantiza la calidad de la mano de obra conforme a las buenas prácticas técnicas del sector. Las garantías sobre equipos y dispositivos electrónicos estarán sujetas a los términos y vigencias expedidas por los fabricantes o distribuidores autorizados.
              </p>
              <p className="mt-2">
                La Empresa no responderá por interrupciones en el servicio derivadas de fallas eléctricas ajenas, cortes de suministro de internet provisto por terceros o manipulación indebida de los equipos por personal no autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">7. Legislación Aplicable y Jurisdicción</h2>
              <p>
                Estos términos se rigen e interpretan conforme a las leyes de la República de Colombia. Cualquier controversia será dirimida prioritariamente mediante mecanismos de arreglo directo o centros de conciliación autorizados en Cundinamarca.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-3">8. Canales de Contacto</h2>
              <p>
                Para dudas, aclaraciones o soporte sobre estos términos, comuníquese a través de:
              </p>
              <div className="mt-3 p-4 bg-black/40 rounded-xl border border-metal-800 space-y-1 text-sm">
                <p><span className="text-metal-400 font-medium">Línea de atención:</span> 304 445 1436</p>
                <p><span className="text-metal-400 font-medium">Correo electrónico:</span> contacto@innovarsecurity.com</p>
                <p><span className="text-metal-400 font-medium">Ubicación:</span> Fómeque, Cundinamarca, Colombia</p>
              </div>
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
