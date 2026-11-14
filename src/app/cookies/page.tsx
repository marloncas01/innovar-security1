import Link from "next/link";
import LegalShell from "@/components/common/LegalShell";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cookies y almacenamiento",
  alternates: { canonical: "/cookies" },
};
export default function Page() {
  return (
    <LegalShell
      title="Cookies y almacenamiento"
      intro="Información clara sobre lo que guarda este sitio en tu navegador."
    >
      <section>
        <h2>Lo necesario para usar tu cuenta</h2>
        <p>
          Se utilizan cookies técnicas de NextAuth para mantener la sesión y
          proteger el inicio de sesión, como next-auth.session-token,
          next-auth.csrf-token y next-auth.callback-url. En conexiones seguras
          sus nombres pueden incluir los prefijos __Secure- o __Host-. La cookie
          de sesión persiste según su vencimiento o hasta cerrar sesión; las
          demás apoyan el proceso de acceso.
        </p>
      </section>
      <section>
        <h2>Preferencias locales</h2>
        <p>
          El navegador guarda el cierre de este aviso bajo cookie_notice_v2.
          Puede existir cookie_consent de una versión anterior del sitio. Este
          almacenamiento no constituye autorización para publicidad. Puedes
          eliminarlo desde los ajustes del navegador.
        </p>
      </section>
      <section>
        <h2>Analítica y publicidad</h2>
        <p>
          Esta versión de la aplicación no incorpora herramientas opcionales de
          analítica ni publicidad. Por eso se muestra un aviso informativo y no
          un botón de “aceptar todo” para tecnologías que no están instaladas.
          Si se añaden herramientas opcionales, deberán explicarse y habilitarse
          según las preferencias y reglas aplicables antes de utilizarlas.
        </p>
      </section>
      <section>
        <h2>Control y servicios externos</h2>
        <p>
          Puedes bloquear o borrar cookies desde tu navegador; bloquear las de
          sesión puede impedir el acceso a tu cuenta. Los enlaces a WhatsApp y
          otros sitios externos están sujetos a las políticas de esos servicios.
          Consulta también nuestra{" "}
          <Link href="/privacidad">política de datos</Link>.
        </p>
      </section>
    </LegalShell>
  );
}
