# Entrega de Innovar Security

Actualización: 14 de noviembre de 2026. Sitio: https://innovar-security1.vercel.app

## Preparado
- Inicio renovado con vista ilustrativa y orientación por tipo de espacio.
- Centro de confianza: /confianza; privacidad: /privacidad; términos: /terminos; cookies: /cookies; atención: /atencion.
- Canal de atención prepara mensajes para WhatsApp. No es un radicador: el cliente debe enviar el mensaje y solicitar recepción.
- Panel /admin/legal para completar datos públicos del prestador y consultar pendientes.
- Registro con aceptación separada de condiciones, autorización de datos y declaración de mayoría de edad. Guarda fecha y versión para cuentas nuevas; no inventa autorizaciones históricas.
- Agenda editable con prevención de cruces y cálculo por duración del servicio.
- Pagos condicionados a habilitación, cuenta configurada e importe positivo.

## Pendiente del responsable
- Confirmar razón social o persona prestadora, NIT/identificación, dirección de notificación y correo real. Contacto informado: Yeison Fabián Rodríguez Ríos; teléfono confirmado: 304 445 1436. La existencia y nombre de la empresa no se han verificado.
- Validar con asesoría jurídica los textos y obligaciones aplicables a su actividad. Una página web no registra una empresa ni certifica cumplimiento.
- Definir precios, alcance, impuestos, desplazamientos, garantías y condiciones de instalación en la propuesta comercial.
- Publicar horarios reales y verificar destinatarios antes de activar pagos.
- Definir administrador definitivo y cambiar la contraseña temporal mediante el flujo de cuenta correspondiente. No incluir claves en documentos de entrega.
- Verificar dominio y correo saliente, recuperación de contraseña, facturación y registros que correspondan; no se consideran habilitados por esta entrega.
- Verificar plan de backups de la base de datos y demostrar restauración antes de dar por cerrada la operación. No se ha realizado una restauración de producción.
- Revisar contratos de proveedores (Vercel/Prisma), ubicación de tratamiento y requisitos de transmisiones internacionales. No prometer un país de almacenamiento sin verificarlo.
- Confirmar proceso operativo para responder consultas, reclamos, garantías, retracto y devoluciones, conservar soportes y revisar solicitudes de eliminación de datos.

## Referencias oficiales revisadas
- Ley 1581 de 2012: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981
- Ley 1480 de 2011: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=44306
- Decreto 1074 de 2015, tratamiento de datos: https://cancilleria.gov.co/sites/default/files/Normograma/docs/decreto_1074_2015_pr025.htm

## Comprobación
Ejecutar npm run build y npx tsx --test tests/*.test.ts. Comprobar enlaces legales, cambio de espacio, vista móvil, sesión de administrador y rechazo de registro sin autorizaciones. Las pruebas en producción no deben crear clientes o citas ficticios.
