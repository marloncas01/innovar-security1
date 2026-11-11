# PLAN MAESTRO DE DESARROLLO — INNOVAR SECURITY

**Proyecto:** Innovar Security — Plataforma de Gestión de Cámaras de Seguridad  
**Propietario:** Yeison Fabian Rodriguez Rios  
**Teléfono:** 304 4451436  
**Ubicación:** Fómeque, Cundinamarca, Colombia  
**Carpeta raíz:** `C:\innovar security`  
**Fecha de elaboración:** 12 de Septiembre de 2026  
**Estado:** PLAN MAESTRO PARA REVISIÓN — SIN IMPLEMENTACIÓN INICIADA

---

## A. RESUMEN DEL PROYECTO

Innovar Security es un negocio independiente de cámaras de seguridad que requiere una plataforma web profesional para digitalizar y organizar todo su ciclo de atención al cliente. Actualmente, el negocio pierde tiempo y recursos desplazándose a ubicaciones donde el cliente no está disponible, no confirmó el servicio, o las condiciones del lugar no fueron previamente conocidas.

La plataforma pretende resolver este problema creando un flujo completo digital:

**Solicitud → Recopilación de información → Selección de disponibilidad → Cálculo de costos → Pago → Confirmación → Recordatorio → Visita técnica → Evaluación → (Opcional) Cotización**

El sistema tendrá dos áreas claramente diferenciadas:

- **Área Pública / Cliente:** Experiencia web para conocer el negocio, solicitar servicios, gestionar citas, y recibir seguimiento.
- **Área Administrativa:** Panel de control completo para gestionar clientes, citas, servicios, cámaras, pagos, zonas, contenido y configuración.

**Principio fundamental:** El desarrollador construye el sistema; el administrador administra el negocio. El administrador NO debe depender del código para modificar precios, servicios, horarios, fotografías ni información comercial.

---

## B. PROBLEMA QUE RESUELVE

### Problema actual del negocio:

1. **Desplazamientos innecesarios:** Se visita un lugar sin confirmación formal, y el cliente no está.
2. **Falta de confirmación:** No existe un mecanismo de confirmación previa de la visita.
3. **Información incompleta:** El técnico llega sin conocer las condiciones del lugar, distancia, riesgos o necesidades específicas.
4. **Sin historial:** No hay registro de visitas previas, solicitudes, ni estado de servicios.
5. **Sin control de disponibilidad:** No se saben los horarios disponibles, generando sobreposición de citas.
6. **Sin flujo de pago:** No existe un proceso formal de cobro o confirmación por pago.
7. **Sin base de datos de clientes:** La información de clientes no está organizada ni accesible.
8. **Sin seguimiento:** No hay mecanismo de recordatorios ni notificaciones.

### Solución que aporta la plataforma:

| Problema | Solución |
|----------|----------|
| Desplazamientos innecesarios | Formulario con información previa + pago de confirmación antes de la visita |
| Falta de confirmación | Sistema de citas con estados: Pendiente → Pagada → Confirmada → Realizada |
| Información incompleta | Formulario inteligente por etapas + subida de fotografías + preguntas condicionales |
| Sin historial | Ficha completa de cada cita con todo el historial |
| Sin control de disponibilidad | Calendario con horarios configurables, bloqueo automático al confirmar |
| Sin flujo de pago | Arquitectura de pagos preparada para pasarela real |
| Sin base de datos | CRM integrado con perfil completo de cada cliente |
| Sin seguimiento | Sistema de recordatorios y notificaciones (preparado para múltiples canales) |

---

## C. USUARIOS Y ROLES

### Modelo de Roles

```
ROL: ADMINISTRADOR
- Acceso completo a toda la plataforma
- Gestión de todo el contenido, servicios, citas, clientes, pagos
- Configuración general del negocio
- Dashboard con métricas del negocio

ROL: CLIENTE
- Acceso al área pública
- Solicitar servicios y citas
- Gestionar sus propias citas (reprogramar, cancelar dentro del plazo)
- Ver su historial
- Perfil personal
- Contactar al negocio

ROL: TÉCNICO (futuro, arquitectura preparada)
- Ver sus asignaciones
- Marcar visitas como realizadas
- Registrar observaciones
- Fotografías de la visita
```

### Tabla de Permisos

| Recurso | Administrador | Cliente | Técnico |
|---------|:------------:|:-------:|:-------:|
| Dashboard | ✅ | ❌ | ❌ |
| Ver servicios públicos | ✅ | ✅ | ❌ |
| Crear/editar servicios | ✅ | ❌ | ❌ |
| Gestionar cámaras/equipos | ✅ | ❌ | ❌ |
| Ver catálogo público | ✅ | ✅ | ❌ |
| Solicitar cita | ❌ | ✅ | ❌ |
| Ver todas las citas | ✅ | Solo las propias | Solo las asignadas |
| Gestionar citas (cancelar/reprogramar) | ✅ | Solo las propias | Solo las asignadas |
| Ver ficha completa de cita | ✅ | Solo la propia | Solo la asignada |
| Gestionar clientes | ✅ | Solo el propio | Solo los asignados |
| Gestionar pagos | ✅ | Ver sus pagos | ❌ |
| Gestionar cotizaciones | ✅ | Ver las propias | ❌ |
| Gestionar zonas y tarifas | ✅ | ❌ | ❌ |
| Gestionar horarios | ✅ | ❌ | ❌ |
| Gestionar contenido web | ✅ | ❌ | ❌ |
| Gestionar chatbot | ✅ | ❌ | ❌ |
| Configuración general | ✅ | ❌ | ❌ |
| Ver notificaciones | ✅ | Las propias | Las propias |
| Gestionar fotografías | ✅ | Subir en sus citas | Solo las de sus citas |

### Principio de Seguridad

- **Nunca confiar solo en el frontend.** Todos los controles de acceso deben verificarse en el backend.
- Cada usuario solo puede acceder a sus propios datos (principio de menor privilegio).
- Los endpoints administrativos deben tener autenticación y autorización verificadas en cada petición.

---

## D. FUNCIONALIDADES

### Módulo 1: Área Pública (Cliente)

| # | Funcionalidad | Descripción | Estado |
|---|---------------|-------------|--------|
| 1 | Página de inicio | Presentación del negocio, servicios destacados, CTA principal | POR DEFINIR |
| 2 | Catálogo de servicios | Listado de servicios disponibles con descripción y precio | POR DEFINIR |
| 3 | Catálogo de cámaras/equipos | Listado de equipos con información técnica | POR DEFINIR |
| 4 | Cómo funciona | Guía paso a paso del proceso de solicitud | POR DEFINIR |
| 5 | Preguntas frecuentes | FAQ configurable desde administración | POR DEFINIR |
| 6 | Solicitar servicio | Formulario paso a paso para solicitar un servicio | POR DEFINIR |
| 7 | Selección de servicio | El cliente elige tipo de servicio | POR DEFINIR |
| 8 | Formulario de información | Preguntas inteligentes según el servicio seleccionado | POR DEFINIR |
| 9 | Selección de ubicación | Municipio, dirección, referencia | POR DEFINIR |
| 10 | Subida de fotografías | Hasta N fotos del lugar con descripción opcional | POR DEFINIR |
| 11 | Preguntas sobre condiciones | Trabajo en altura, riesgos, acceso complicado | POR DEFINIR |
| 12 | Selección de fecha y horario | Calendario con horarios disponibles | POR DEFINIR |
| 13 | Cálculo de costos | Costo del servicio + costo de desplazamiento (si aplica) | POR DEFINIR |
| 14 | Pago | Proceso de pago con arquitectura preparada | POR INTEGRAR |
| 15 | Confirmación de cita | Resumen con todos los detalles + confirmación | POR DEFINIR |
| 16 | Área del cliente | Login/Registro/Recuperación | POR DEFINIR |
| 17 | Mis citas | Listado de citas con estados | POR DEFINIR |
| 18 | Detalle de cita | Ficha completa | POR DEFINIR |
| 19 | Solicitar reprogramación | Solo si faltan ≥24 horas (configurable) | POR DEFINIR |
| 20 | Cancelar cita | Con reglas de política configurable | POR DEFINIR |
| 21 | Notificaciones | Recordatorios por email/SMS (arquitectura preparada) | POR INTEGRAR |
| 22 | Chatbot | Asistente con FAQs y orientación | POR DEFINIR |
| 23 | Contacto | Formulario + información de contacto | POR DEFINIR |
| 24 | Perfil | Datos personales, historial, direcciones guardadas | POR DEFINIR |

### Módulo 2: Área Administrativa

| # | Funcionalidad | Descripción | Estado |
|---|---------------|-------------|--------|
| 1 | Dashboard | Métricas: citas del mes, pendientes, pagadas, canceladas, ingresos | POR DEFINIR |
| 2 | Gestión de clientes | CRUD completo + búsqueda + filtros | POR DEFINIR |
| 3 | Gestión de citas | Listado, filtrado, detalle, acciones (confirmar, cancelar, reprogramar) | POR DEFINIR |
| 4 | Calendario | Vista mensical/semanal/día con citas | POR DEFINIR |
| 5 | Gestión de horarios | Días disponibles, bloques horarios, excepciones | POR DEFINIR |
| 6 | Gestión de servicios | CRUD completo + activar/desactivar + orden | POR DEFINIR |
| 7 | Catálogo de cámaras | CRUD completo de equipos | POR DEFINIR |
| 8 | Gestión de fotografías | Visualizar fotos de citas | POR DEFINIR |
| 9 | Gestión de cotizaciones | Ver, crear (futuro), aceptar/rechazar | POR DEFINIR |记账 |
| 10 | Gestión de pagos | Ver estado de pagos, confirmar | POR DEFINIR |
| 11 | Zonas de cobertura | Municipios, distancias, tarifas | POR DEFINIR |
| 12 | Tarifas de desplazamiento | Configurar costos por zona/distancia | POR DEFINIR |
| 13 | Políticas | Reglas de reprogramación, cancelación, confirmación | POR DEFINIR |
| 14 | Configuración general | Información del negocio, contacto, logo, colores | POR DEFINIR |
| 15 | Contenido de la página | Editar páginas públicas (inicio, servicios, cómo funciona, etc.) | POR DEFINIR |
| 16 | Chatbot | Mensajes, FAQs, respuestas | POR DEFINIR |
| 17 | Notificaciones | Ver historial de notificaciones enviadas | POR DEFINIR |
| 18 | Trabajos realizados | Historial de visitas completadas | POR DEFINIR |
| 19 | Reportes | Exportación de datos, estadísticas | POR DEFINIR |

---

## E. FLUJO COMPLETO DEL CLIENTE

### Flujo Principal: Solicitud de Servicio con Cita

```
┌─────────────────┐
│ 1. INICIO        │ Cliente conoce Innovar Security
│ (Página pública) │ → Ve servicios, cámaras, cómo funciona
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. REGISTRO      │ Cliente crea cuenta (email + contraseña)
│ O INICIO DE SESIÓN│    O inicia sesión si ya tiene cuenta
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. SOLICITAR     │ Cliente hace clic en "Solicitar Servicio"
│ SERVICIO         │ → Selecciona tipo de servicio
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. FORMA 1       │ Información del servicio
│ (PASO 1/4)       │ → Qué necesita, cantidad de cámaras, tipo de instalación
│                  │ → Preguntas condicionales según servicio
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. FORMA 2       │ Ubicación
│ (PASO 2/4)       │ → Municipio, dirección, referencia
│                  │ → Mapa opcional para verificar zona/costo de desplazamiento
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. FORMA 3       │ Fotografías y condiciones
│ (PASO 3/4)       │ → Subir fotos del lugar (con descripción opcional)
│                  │ → ¿Trabajo en altura? ¿Acceso complicado? ¿Riesgos?
│                  │ → Campo libre: "¿Alguna condición especial?"
│                  │ → ⚠️ ADVERTENCIA: Las condiciones serán verificadas
│                  │    por el técnico durante la visita
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. FORMA 4       │ Fecha y horario
│ (PASO 4/4)       │ → Calendario con fechas disponibles
│                  │ → Horarios disponibles del día seleccionado
│                  │ → Costo estimado (servicio + desplazamiento)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 8. REVISIÓN      │ Resumen completo antes de confirmar
│ Y PAGO           │ → Toda la información resumida
│                  │ → Costo total
│                  │ → Opción de pago
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 9. PAGO          │ Proceso de pago
│                  │ → Arquitectura preparada para pasarela
│                  │ → Estado: Pendiente de pago → En proceso → Pagada
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 10. CONFIRMACIÓN │ Cita confirmada
│                  │ → Email/SMS de confirmación
│                  │ → Cita en estado "Pagada/Confirmada"
│                  │ → Horario bloqueado en calendario
│                  │ → Recordatorio automático programado
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 11. SEGUIMIENTO  │ El cliente puede:
│                  │ → Ver estado de su cita
│                  │ → Solicitar reprogramación (≥24h antes)
│                  │ → Recibir recordatorios
│                  │ → Ver ficha completa de su cita
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 12. VISITA       │ El técnico realiza la visita
│ TÉCNICA          │ → Evalúa condiciones
│                  │ → Registra observaciones
│                  │ → Marca como "Realizada"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 13. (FUTURO)     │ Cotización
│ COTIZACIÓN       │ → Después de la visita, el administrador
│                  │   puede generar una cotización
│                  │ → Cliente acepta o rechaza
└─────────────────┘
```

### Flujo Alternativo: Reprogramación

```
Cliente solicita reprogramación
         │
         ▼
¿Faltan ≥ 24 horas? ──SÍ──→ Mostrar formulario de reprogramación
         │                        → Nueva fecha + nuevo horario + motivo
         │                        → Estado: "Solicitud de reprogramación"
         │                        → Administrador recibe notificación
         │                        → Administrador aprueba/rechaza
         │                        → Cliente recibe confirmación
         │
         │NO
         ▼
Mostrar mensaje: "El plazo de reprogramación automática ha terminado"
         │
         ▼
Opción: "Contactar al administrador para intervención manual"
```

### Flujo Alternativo: Cancelación

```
Cliente solicita cancelación
         │
         ▼
¿Política de cancelación aplica? → Configurable desde administración
         │
         ▼
Devolución de pago: POR DEFINIR (según política configurada)
         │
         ▼
Cita marcada como "Cancelada"
         │
         ▼
Horario liberado en el calendario
```

---

## F. FLUJO COMPLETO DEL ADMINISTRADOR

### Flujo de Gestión Diaria

```
┌─────────────────┐
│ 1. LOGIN         │ Administrador entra al panel
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. DASHBOARD     │ Vista general del negocio
│                  │ → Citas hoy, esta semana, próximas
│                  │ → Estado de pagos del mes
│                  │ → Citas pendientes
│                  │ → Clientes nuevos
│                  │ → Ingresos del período
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. GESTIÓN       │ Selecciona módulo a gestionar
└────────┬────────┘
         │
         ├──► CITAS: Ver, filtrar, confirmar, cancelar, reprogramar
         ├──► CLIENTES: Ver, buscar, editar, exportar
         ├──► SERVICIOS: Crear, editar, activar/desactivar, ordenar
         ├──► CÁMARAS: Agregar, editar, publicar, categorizar
         ├──► CALENDARIO: Ver citas en vista calendario
         ├──► HORARIOS: Configurar bloques disponibles, excepciones
         ├──► ZONAS: Configurar cobertura, distancias, tarifas
         ├──► PAGOS: Ver historial, confirmar pagos
         ├──► COTIZACIONES: Ver, generar (futuro)
         ├──► CONTENIDO: Editar páginas públicas
         ├──► CHATBOT: Configurar respuestas y FAQs
         ├──► POLÍTICAS: Configurar reglas de cancelación/reprogramación
         ├──► CONFIGURACIÓN: Datos del negocio, contacto, branding
         └──► NOTIFICACIONES: Ver historial de envíos
```

---

## G. MAPA DE PÁGINAS/PANTALLAS

### Área Pública (SEO optimizada, URLs limpias)

| URL | Página | Descripción | Estado |
|-----|--------|-------------|--------|
| `/` | Inicio | Presentación del negocio, servicios destacados | POR DEFINIR |
| `/servicios` | Servicios | Catálogo completo de servicios | POR DEFINIR |
| `/cameras` | Cámaras | Catálogo de equipos | POR DEFINIR |
| `/como-funciona` | Cómo funciona | Guía paso a paso | POR DEFINIR |
| `/servicios/[slug]` | Detalle de servicio | Página individual de cada servicio | POR DEFINIR |
| `/cameras/[slug]` | Detalle de cámara | Página individual de cada equipo | POR DEFINIR |
| `/solicitar` | Solicitar servicio | Formulario paso a paso | POR DEFINIR |
| `/solicitar/[servicioId]` | Solicitar (pre-filtrado) | Formulario con servicio preseleccionado | POR DEFINIR |
| `/citas` | Mis citas | Listado de citas del cliente | POR DEFINIR |
| `/citas/[id]` | Detalle de cita | Ficha completa | POR DEFINIR |
| `/citas/[id]/reprogramar` | Reprogramar | Formulario de reprogramación | POR DEFINIR |
| `/login` | Inicio de sesión | Login de cliente | POR DEFINIR |
| `/registro` | Registro | Creación de cuenta | POR DEFINIR |
| `/recuperar` | Recuperar contraseña | Reset de contraseña | POR DEFINIR |
| `/contacto` | Contacto | Formulario + información | POR DEFINIR |
| `/preguntas-frecuentes` | FAQ | Listado de preguntas | POR DEFINIR |
| `/chatbot` | Chatbot | Interfaz de chat (inline) | POR DEFINIR |
| `/perfil` | Mi perfil | Datos personales, historial | POR DEFINIR |
| `/admin` | Panel administrativo | Login de administrador | POR DEFINIR |
| `/admin/dashboard` | Dashboard admin | Métricas y resumen | POR DEFINIR |
| `/admin/citas` | Gestión de citas | Listado y filtros | POR DEFINIR |
| `/admin/citas/[id]` | Detalle de cita admin | Ficha completa con toda la información | POR DEFINIR |
| `/admin/clientes` | Gestión de clientes | CRUD + búsqueda | POR DEFINIR |
| `/admin/calendario` | Calendario | Vista de calendario | POR DEFINIR |
| `/admin/servicios` | Gestión de servicios | CRUD | POR DEFINIR |
| `/admin/camaras` | Catálogo de cámaras | CRUD | POR DEFINIR |
| `/admin/horarios` | Configuración de horarios | Bloques, excepciones | POR DEFINIR |
| `/admin/zonas` | Zonas y tarifas | Configuración de cobertura | POR DEFINIR |
| `/admin/pagos` | Pagos | Historial y estado | POR DEFINIR |
| `/admin/cotizaciones` | Cotizaciones | Gestión | POR DEFINIR |
| `/admin/contenido` | Contenido web | Edición de páginas | POR DEFINIR |
| `/admin/chatbot` | Chatbot | Configuración de mensajes | POR DEFINIR |
| `/admin/politica` | Políticas | Reglas de cancelación/reprogramación | POR DEFINIR |
| `/admin/configuracion` | Configuración | Datos del negocio, contacto | POR DEFINIR |

### Errores comunes

| URL | Descripción |
|-----|-------------|
| `/404` | Página no encontrada |
| `/500` | Error del servidor |
| `/mantenimiento` | Mantenimiento (si aplica) |

---

## H. ARQUITECTURA PROPUESTA

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                   │
│              (Next.js App Router - Frontend)              │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ Páginas   │  │ Cliente   │  │ Admin Dashboard     │  │
│  │ Públicas  │  │ UI        │  │ UI                  │  │
│  └───────────┘  └───────────┘  └─────────────────────┘  │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ Chatbot   │  │ Formularios│ │ Tablas/Calendario   │  │
│  │ UI        │  │ con steps │ │ Componentes         │  │
│  └───────────┘  └───────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    CAPA DE RUTAS API                      │
│              (Next.js API Routes)                         │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ Auth      │  │ Citas     │  │ Servicios           │  │
│  │ Routes    │  │ Routes    │  │ Routes              │  │
│  └───────────┘  └───────────┘  └─────────────────────┘  │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ Pagos     │  │ Clientes  │  │ Admin Routes        │  │
│  │ Routes    │  │ Routes    │  │ (protegidos)        │  │
│  └───────────┘  └───────────┘  └─────────────────────┘  │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ Archivos  │  │ Notifica- │  │ Zonas/Tarifas       │  │
│  │ Upload    │  │ ciones    │  │ Routes              │  │
│  └───────────┘  │ Routes    │  └─────────────────────┘  │
│                 └───────────┘                            │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    CAPA DE LÓGICA DE NEGOCIO              │
│              (Librerías/services internos)                │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ - Validación de solicitudes                       │   │
│  │ - Cálculo de costos de desplazamiento             │   │
│  │ - Verificación de disponibilidad                  │   │
│  │ - Lógica de estados de cita                       │   │
│  │ - Reglas de reprogramación                        │   │
│  │ - Gestión de sesiones y permisos                  │   │
│  │ - Procesamiento de archivos                       │   │
│  │ - Generación de notificaciones                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    CAPA DE DATOS                          │
│                  (PostgreSQL + Prisma ORM)                │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌─────────────────────┐  │
│  │ users     │  │ services  │  │ appointments        │  │
│  │ clients   │  │ cameras   │  │ payments            │  │
│  │ zones     │  │ photos    │  │ quotes              │  │
│  │ schedules │  │ messages  │  │ notifications       │  │
│  │ settings  │  │ faqs      │  │ ...                 │  │
│  └───────────┘  └───────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Principios Arquitectónicos

1. **Separación de responsabilidades:** Frontend, API, y Data están claramente separados.
2. **Modularidad:** Cada módulo (citas, servicios, pagos, etc.) es independiente.
3. **Preparación para escalabilidad:** La separación entre empresa, usuario, servicio, cita, etc. permite evolucionar a multiempresa.
4. **API-first:** Las rutas API están diseñadas para ser consumidas tanto por el frontend como potencialmente por un futuro frontend móvil.
5. **Base de datos relacional:** PostgreSQL con Prisma ORM garantiza integridad referencial y consultas eficientes.
6. **Sin secreto en código:** Todas las credenciales y configuraciones sensibles usan variables de entorno.

---

## I. TECNOLOGÍAS RECOMENDADAS

### Stack Tecnológico Principal

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Framework Frontend** | **Next.js 14+ (App Router)** | SSR/SSG para SEO, rendimiento excelente, API routes integradas, ecosistema maduro, soporte TypeScript nativo |
| **Lenguaje** | **TypeScript** | Tipado estático que previene errores en tiempo de ejecución, mejor refactorización, documentación implícita |
| **Styling** | **Tailwind CSS** | Utility-first, rápido de iterar, consistente, excelente para diseño responsive, fácil de mantener con diseño por componentes |
| **Base de Datos** | **PostgreSQL** | Base de datos relacional profesional, excelente para datos estructurados (citas, clientes, pagos), soporte para JSON, integridad referencial |
| **ORM** | **Prisma** | Type-safe, autocompletado, migraciones automáticas, excelente documentación, evolucionó mucho en la última versión |
| **Autenticación** | **NextAuth.js** | Integración nativa con Next.js, soporte de sesiones JWT y basadas en base de datos, fácil extensión |
| **Formularios** | **React Hook Form + Zod** | Validación type-safe con Zod, rendimiento excelente (sin re-renders innecesarios), fácil manejo de formularios multi-paso |
| **UI Components** | **shadcn/ui** | Componentes accesibles, modernos, construidos sobre Radix UI, altamente personalizables, excelentes para dashboards |
| **Calendario** | **Custom + date-fns** | Implementación propia para control total sobre disponibilidad y reglas de negocio, date-fns para manipulación de fechas |
| **Upload de archivos** | **Next.js API Routes + local** | Inicialmente local, arquitectura preparada para migrar a S3/Cloudflare R2 cuando se defina |
| **Pagos** | **Arquitectura preparada** | No se implementa pasarela ahora. Se define interface para Stripe, Nequi Business, PSE, etc. |
| **Notificaciones** | **Arquitectura preparada** | Interface para email (Resend/SendGrid), WhatsApp (Twilio/Twilio WhatsApp), SMS, Push |
| **Chatbot** | **Chatbot UI básico** | Flujo basado en reglas con mensajes configurables desde administración. IA como evolución futura. |
| **Variables de entorno** | **`.env.local`** | Prisma + Next.js support nativo, nunca commit de credenciales |
| **Deployment** | **Docker + VPS** | Docker Compose para PostgreSQL + Next.js, despliegue en VPS con Nginx reverse proxy |
| **Linting/Typecheck** | **ESLint + TypeScript strict** | Código limpio y sin errores de tipo |

### Tecnologías NO seleccionadas (y por qué)

| Tecnología | Razón para no seleccionar |
|------------|--------------------------|
| React Vanilla (Create React App) | Next.js ofrece SSR, SEO, API routes nativas; CRA no |
| Vue.js / Nuxt | Menor ecosistema para este tipo de proyectos en el mercado actual |
| MongoDB | No es ideal para datos relacionales (citas ↔ clientes ↔ servicios ↔ pagos) |
| Firebase | Vendor lock-in, menos control, escalabilidad limitada para este modelo |
| Laravel | PHP, menos ecosistema frontend integrado |
| Django | Python, menos integración frontend que Next.js |
| Angular | Más complejidad de la necesaria para este proyecto |
| Supabase | Aunque excelente, se prefiere PostgreSQL puro + Prisma para máximo control |

### Versiones y Configuración Inicial

```json
// package.json dependencies (previsión)
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "prisma": "^5.18.0",
  "@prisma/client": "^5.18.0",
  "next-auth": "^4.24.0",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.4.0",
  "zod": "^3.23.0",
  "react-hook-form": "^7.51.0",
  "@hookform/resolvers": "^3.6.0",
  "date-fns": "^3.6.0",
  "uuid": "^9.0.0"
}
```

---

## J. ESTRUCTURA DE CARPETAS

```
C:\innovar security\
│
├── prisma/                          # Configuración de Prisma
│   ├── schema.prisma                # Esquema de base de datos
│   ├── seed.ts                      # Datos semilla para desarrollo
│   └── migrations/                  # Migraciones generadas
│
├── src/
│   ├── app/                         # App Router de Next.js
│   │   ├── layout.tsx               # Layout raíz global
│   │   ├── page.tsx                 # Página de inicio
│   │   ├── globals.css              # Estilos globales + variables Tailwind
│   │   ├── not-found.tsx            # Página 404
│   │   ├── error.tsx                # Página de error general
│   │   │
│   │   ├── (public)/                # Grupo de rutas públicas
│   │   │   ├── layout.tsx           # Layout para área pública
│   │   │   ├── page.tsx             # Inicio
│   │   │   ├── servicios/
│   │   │   │   ├── page.tsx         # Listado de servicios
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Detalle de servicio
│   │   │   ├── cameras/
│   │   │   │   ├── page.tsx         # Listado de cámaras
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Detalle de cámara
│   │   │   ├── como-funciona/
│   │   │   │   └── page.tsx         # Guía del proceso
│   │   │   ├── contacto/
│   │   │   │   └── page.tsx         # Página de contacto
│   │   │   ├── preguntas-frecuentes/
│   │   │   │   └── page.tsx         # FAQ
│   │   │   ├── chatbot/
│   │   │   │   └── page.tsx         # Chatbot inline
│   │   │   │
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login de cliente
│   │   │   ├── registro/
│   │   │   │   └── page.tsx         # Registro de cliente
│   │   │   ├── recuperar/
│   │   │   │   └── page.tsx         # Recuperar contraseña
│   │   │   │
│   │   │   ├── solicitar/
│   │   │   │   ├── page.tsx         # Formulario paso a paso
│   │   │   │   └── [servicioId]/
│   │   │   │       └── page.tsx     # Formulario pre-filtrado
│   │   │   │
│   │   │   └── api/                 # ← API Routes
│   │   │       ├── auth/            # Rutas de autenticación
│   │   │       │   ├── [...nextauth]/
│   │   │       │   │   └── route.ts
│   │   │       │   └── callback/
│   │   │       │       └── route.ts
│   │   │       ├── servicios/
│   │   │       │   └── route.ts
│   │   │       ├── citas/
│   │   │       │   ├── route.ts     # POST (crear cita)
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts # GET/PUT/DELETE
│   │   │       ├── pagos/
│   │   │       │   └── route.ts
│   │   │       ├── archivos/
│   │   │       │   └── route.ts     # Upload de fotos
│   │   │       └── chatbot/
│   │   │           └── route.ts
│   │   │
│   │   ├── (cliente)/               # Grupo de rutas del cliente autenticado
│   │   │   ├── layout.tsx           # Layout con auth check
│   │   │   ├── citas/
│   │   │   │   ├── page.tsx         # Mis citas
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Detalle de cita
│   │   │   ├── citas/
│   │   │   │   └── [id]/
│   │   │   │       └── reprogramar/
│   │   │   │           └── page.tsx # Solicitar reprogramación
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx         # Mi perfil
│   │   │   ├── notificaciones/
│   │   │   │   └── page.tsx         # Mis notificaciones
│   │   │   └── api/
│   │   │       ├── citas/
│   │   │       │   └── route.ts     # GET propias citas
│   │   │       └── cliente/
│   │   │           └── route.ts     # GET/PUT perfil
│   │   │
│   │   └── (admin)/                 # Grupo de rutas administrativas (protegidas)
│   │       ├── layout.tsx           # Layout con admin auth check + sidebar
│   │       ├── layout-admin.tsx     # Layout con navegación lateral
│   │       │
│   │       ├── dashboard/
│   │       │   └── page.tsx         # Dashboard principal
│   │       │
│   │       ├── citas/
│   │       │   ├── page.tsx         # Listado de citas
│   │       │   └── [id]/
│   │       │       └── page.tsx     # Ficha completa de cita
│   │       │
│   │       ├── clientes/
│   │       │   ├── page.tsx         # Listado de clientes
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx     # Detalle de cliente
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx     # Crear cliente
│   │       │   └── [id]/
│   │       │       └── editar/
│   │       │           └── page.tsx # Editar cliente
│   │       │
│   │       ├── calendario/
│   │       │   └── page.tsx         # Vista de calendario
│   │       │
│   │       ├── servicios/
│   │       │   ├── page.tsx         # Listado de servicios
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx     # Crear servicio
│   │       │   └── [id]/
│   │       │       └── editar/
│   │       │           └── page.tsx # Editar servicio
│   │       │
│   │       ├── camaras/
│   │       │   ├── page.tsx         # Listado de cámaras
│   │       │   ├── nuevo/
│   │       │   │   └── page.tsx     # Crear cámara
│   │       │   └── [id]/
│   │       │       └── editar/
│   │       │           └── page.tsx # Editar cámara
│   │       │
│   │       ├── horarios/
│   │       │   └── page.tsx         # Configuración de horarios
│   │       │
│   │       ├── zonas/
│   │       │   └── page.tsx         # Zonas y tarifas
│   │       │
│   │       ├── pagos/
│   │       │   └── page.tsx         # Gestión de pagos
│   │       │
│   │       ├── cotizaciones/
│   │       │   └── page.tsx         # Cotizaciones
│   │       │
│   │       ├── contenido/
│   │       │   └── page.tsx         # Editar contenido web
│   │       │
│   │       ├── chatbot/
│   │       │   └── page.tsx         # Configurar chatbot
│   │       │
│   │       ├── politica/
│   │       │   └── page.tsx         # Políticas de cancelación/reprogramación
│   │       │
│   │       ├── configuracion/
│   │       │   └── page.tsx         # Configuración general del negocio
│   │       │
│   │       └── api/
│   │           ├── citas/
│   │           │   ├── route.ts     # GET todas las citas (admin)
│   │           │   └── [id]/
│   │           │       └── route.ts # Admin actions
│   │           ├── servicios/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       └── route.ts
│   │           ├── clientes/
│   │           │   ├── route.ts
│   │           │   └── [id]/
│   │           │       └── route.ts
│   │           ├── pagos/
│   │           │   └── route.ts
│   │           ├── zonas/
│   │           │   └── route.ts
│   │           ├── horarios/
│   │           │   └── route.ts
│   │           ├── contenido/
│   │           │   └── route.ts
│   │           └── chatbot/
│   │               └── route.ts
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── ui/                      # Componentes base (shadcn/ui custom)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── StepForm.tsx         # Componente de formulario multi-paso
│   │   │   ├── ProgressBar.tsx      # Indicador de progreso
│   │   │   └── Badge.tsx            # Estado badges
│   │   │
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx          # Sidebar del admin
│   │   │   ├── SidebarNav.tsx       # Navegación del sidebar
│   │   │   └── AdminLayout.tsx
│   │   │
│   │   ├── public/                  # Componentes del área pública
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ServiceCard.tsx
│   │   │   ├── CameraCard.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ChatbotWidget.tsx
│   │   │   └── FooterPublic.tsx
│   │   │
│   │   ├── client/                  # Componentes del área del cliente
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── AppointmentDetail.tsx
│   │   │   ├── ReprogramarForm.tsx
│   │   │   └── NotificationList.tsx
│   │   │
│   │   └── admin/                   # Componentes del área administrativa
│   │       ├── DashboardStats.tsx
│   │       ├── CalendarView.tsx
│   │       ├── AppointmentTable.tsx
│   │       ├── ClientTable.tsx
│   │       ├── ServiceForm.tsx
│   │       ├── CameraForm.tsx
│   │       ├── ScheduleConfig.tsx
│   │       ├── ZoneConfig.tsx
│   │       ├── PaymentTable.tsx
│   │       └── ContentEditor.tsx
│   │
│   ├── lib/                         # Librerías y utilidades
│   │   ├── prisma.ts                # Singleton de Prisma client
│   │   ├── auth.ts                  # Configuración de NextAuth
│   │   ├── utils.ts                 # Utilidades generales
│   │   ├── validators.ts            # Esquemas Zod para validación
│   │   ├── dates.ts                 # Funciones de fecha
│   │   ├── format.ts                # Funciones de formato (moneda, fechas)
│   │   ├── constants.ts             # Constantes de la aplicación
│   │   └── env.ts                   # Validación de variables de entorno
│   │
│   ├── services/                    # Capa de servicios (lógica de negocio)
│   │   ├── cita.service.ts
│   │   ├── cliente.service.ts
│   │   ├── servicio.service.ts
│   │   ├── pago.service.ts
│   │   ├── zona.service.ts
│   │   ├── horario.service.ts
│   │   ├── archivo.service.ts
│   │   ├── notificacion.service.ts
│   │   └── chatbot.service.ts
│   │
│   ├── hooks/                       # Custom hooks de React
│   │   ├── useAuth.ts
│   │   ├── useCitass.ts
│   │   ├── useFormStep.ts
│   │   └── useNotifications.ts
│   │
│   ├── types/                       # Tipos TypeScript
│   │   ├── cita.ts
│   │   ├── cliente.ts
│   │   ├── servicio.ts
│   │   ├── pago.ts
│   │   ├── zona.ts
│   │   └── index.ts
│   │
│   ├── stores/                      # Estado global (si se necesita)
│   │   └── app.store.ts
│   │
│   └── middleware.ts                # Next.js middleware (auth protection)
│
├── public/                          # Archivos estáticos
│   ├── images/                      # Imágenes del sitio
│   │   ├── logos/
│   │   ├── servicios/
│   │   ├── camaras/
│   │   └── pages/
│   ├── fonts/                       # Fuentes personalizadas
│   ├── icons/                       # Iconos
│   └── files/                       # Archivos generados
│
├── uploads/                         # Directorio de uploads temporales
│   └── citas/                       # Fotos subidas por clientes
│
├── .env.local                       # Variables de entorno (NUNCA en git)
├── .env.example                     # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── prisma.config.ts
├── Dockerfile
├── docker-compose.yml
├── README.md
└── PLAN_MAESTRO.md                  # Este archivo
```

---

## K. MODELO DE BASE DE DATOS

### Entidades y Relaciones

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    USER      │────1:N│    CLIENT        │────1:N│   APPOINTMENT    │
│              │     │                  │     │                  │
│ id           │     │ id               │     │ id               │
│ email        │     │ userId           │     │ clientId         │
│ password     │     │ name             │     │ serviceId        │
│ role         │     │ phone            │     │ scheduledDate    │
│ name         │     │ address          │     │ scheduledTime    │
│ createdAt    │     │ notes            │     │ status           │
│ updatedAt    │     │ city             │     │ cost             │
│              │     │                  │     │ locationRef      │
└──────────────┘     └──────────────────┘     │ paymentId        │
                                               │ notes            │
                                               │ conditionNotes   │
                                               │ createdAt        │
                                               │ updatedAt        │
                                               └────────┬─────────┘
                                                        │
                                          ┌─────────────┼─────────────┐
                                          │             │             │
                                    ┌─────▼──┐   ┌─────▼──┐   ┌─────▼──┐
                                    │PAYMENT │   │QUOTE   │   │REPROGRAM│
                                    │        │   │        │   │ REQUEST │
                                    └────────┘   └────────┘   └─────────┘
```

### Modelo Detallado de Entidades (Prisma Schema Preview)

#### 1. `User` (Usuario del sistema)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  role          Role      @default(CLIENT)
  phone         String?
  active        Boolean   @default(true)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  client       Client?
  appointments Appointment[]
  payments     Payment[]

  @@map("users")
}

enum Role {
  ADMIN
  CLIENT
  TECHNICIAN
}
```

#### 2. `Client` (Datos extendidos del cliente)

```prisma
model Client {
  id          String   @id @default(uuid())
  userId      String   @unique
  name        String
  phone       String
  email       String
  identification String?
  address     String?
  city        String?
  municipality String?
  department  String?
  zipCode     String?
  notes       String?
  preferredAddress String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  appointments Appointment[]

  @@map("clients")
}
```

#### 3. `Service` (Servicio ofrecido)

```prisma
model Service {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  price       Float?
  duration    Int?         // minutos
  imageUrl    String?
  features    String[]   // ¿Qué incluye?
  exclusions  String[]   // ¿Qué no incluye?
  requiresVisit Boolean @default(false) // Requiere visita previa
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  appointments Appointment[]
  quotes       Quote[]

  @@map("services")
}
```

#### 4. `Appointment` (Cita)

```prisma
model Appointment {
  id              String   @id @default(uuid())
  clientId        String
  serviceId       String
  scheduledDate   DateTime
  scheduledTime   DateTime
  estimatedEnd    DateTime?
  status          AppointmentStatus @default(PENDING)
  cost            Float?
  discount        Float?     @default(0)
  totalCost       Float?
  locationMunicipality String?
  locationAddress String?
  locationReference String?
  locationNotes   String?
  conditionNotes  String?
  hasHeightWork   Boolean  @default(false)
  hasElectricRisk Boolean  @default(false)
  hasComplicatedAccess Boolean @default(false)
  hasSpecialConditions Boolean @default(false)
  specialConditionsDescription String?
  adminNotes      String?
  technicianNotes String?
  clientNotAvailable Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  confirmedAt     DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?

  client        Client    @relation(fields: [clientId], references: [id])
  service       Service   @relation(fields: [serviceId], references: [id])
  payment       Payment?
  quotes        Quote[]
  photos        Photo[]
  reprogramRequests ReprogramRequest[]
  historyItems  AppointmentHistory[]

  @@map("appointments")
}

enum AppointmentStatus {
  PENDING         // Solicitud inicial, sin pagar
  PAYMENT_PENDING // Esperando pago
  PAYMENT_PROCESSING // Proceso de pago en curso
  PAID            // Pagada
  CONFIRMED       // Confirmada (pagada + bloqueada en calendario)
  REPROGRAMMED    // Reprogramada
  CANCELLED       // Cancelada
  COMPLETED       // Realizada por el técnico
  CLIENT_NO_SHOW  // Cliente no disponible
  NO_SHOW         // No asistió
}
```

#### 5. `AppointmentHistory` (Historial de cambios de cita)

```prisma
model AppointmentHistory {
  id            String   @id @default(uuid())
  appointmentId String
  action        String   // "CREATED", "PAYMENT", "CONFIRMED", "REPROGRAMMED", "CANCELLED"
  details       String?
  performedBy   String   // userId
  performedAt   DateTime @default(now())

  appointment   Appointment @relation(fields: [appointmentId], references: [id])

  @@map("appointment_history")
}
```

#### 6. `Payment` (Pago)

```prisma
model Payment {
  id            String   @id @default(uuid())
  appointmentId String   @unique
  amount        Float
  currency      String   @default("COP")
  method        String?   // "stripe", "nequi", "pse", "efectivo"
  status        PaymentStatus @default(PENDING)
  reference     String?   // Referencia de pago
  transactionId String?   // ID de transacción de pasarela
  metadata      Json?     // Datos adicionales de la pasarela
  paidAt        DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  appointment   Appointment @relation(fields: [appointmentId], references: [id])

  @@map("payments")
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  REFUNDED
}
```

#### 7. `Photo` (Fotografía del lugar)

```prisma
model Photo {
  id            String   @id @default(uuid())
  appointmentId String
  url           String
  description   String?
  fileName      String
  mimeType      String
  fileSize      Int
  order         Int      @default(0)
  uploadedAt    DateTime @default(now())

  appointment   Appointment @relation(fields: [appointmentId], references: [id])

  @@map("photos")
}
```

#### 8. `ReprogramRequest` (Solicitud de reprogramación)

```prisma
model ReprogramRequest {
  id              String   @id @default(uuid())
  appointmentId   String
  newDate         DateTime?
  newTime         DateTime?
  reason          String?
  status          ReprogramStatus @default(PENDING)
  adminNotes      String?
  adminRespondedAt DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  appointment   Appointment @relation(fields: [appointmentId], references: [id])

  @@map("reprogram_requests")
}

enum ReprogramStatus {
  PENDING     // Solicitada, esperando respuesta del admin
  APPROVED    // Aprobada, la cita se reprograma
  REJECTED    // Rechazada, la cita mantiene su fecha original
}
```

#### 9. `Quote` (Cotización)

```prisma
model Quote {
  id            String   @id @default(uuid())
  appointmentId String   @unique
  clientId      String
  items         Json     // Lista de items (cámaras, cable, mano de obra, etc.)
  subtotal      Float
  displacement  Float?
  total         Float
  observations  String?
  status        QuoteStatus @default(PENDING)
  acceptedAt    DateTime?
  rejectedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  appointment   Appointment @relation(fields: [appointmentId], references: [id])
  client        Client      @relation(fields: [clientId], references: [id])

  @@map("quotes")
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}
```

#### 10. `Camera` (Cámara/Equipo)

```prisma
model Camera {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  brand       String?
  model       String?
  type        String?  // "interior", "exterior", "balcón", "flebótica", "PTZ"
  description String?
  specifications Json?  // Resolución, visión nocturna, etc.
  imageUrl    String?
  price       Float?
  features    String[]
  recommendedUse String?
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("cameras")
}
```

#### 11. `Schedule` (Horario configurado)

```prisma
model Schedule {
  id          String   @id @default(uuid())
  dayOfWeek   Int      // 0=Dom, 1=Lun, ..., 6=Sáb
  startTime   DateTime // Hora de inicio
  endTime     DateTime // Hora de fin
  blockDuration Int?   // Duración de bloque en minutos (ej: 60)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("schedules")
}
```

#### 12. `ScheduleException` (Excepción de horario)

```prisma
model ScheduleException {
  id          String   @id @default(uuid())
  date        DateTime // Fecha específica
  description String?
  type        ExceptionType // "BLOCKED" | "OVERRIDE"
  startTime   DateTime?
  endTime     DateTime?
  notes       String?
  createdAt   DateTime @default(now())

  @@map("schedule_exceptions")
}

enum ExceptionType {
  BLOCKED   // Día bloqueado completamente
  OVERRIDE  // Horarios especiales para ese día
}
```

#### 13. `Zone` (Zona de cobertura)

```prisma
model Zone {
  id          String   @id @default(uuid())
  name        String
  municipality String?
  department  String?
  baseDistance Float?   // Distancia base desde Fómeque en km
  ratePerKm   Float?   // Tarifa por km adicional
  flatRate    Float?   // Tarifa plana (si aplica)
  notes       String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  appointments Appointment[]

  @@map("zones")
}
```

#### 14. `Notification` (Notificación)

```prisma
model Notification {
  id          String   @id @default(uuid())
  type        NotificationType
  title       String
  message     String
  recipientId String
  recipientType String // "CLIENT" | "ADMIN" | "TECHNICIAN"
  channel     String?  // "EMAIL", "SMS", "WHATSAPP", "IN_APP"
  status      NotificationStatus @default(PENDING)
  sentAt      DateTime?
  createdAt   DateTime @default(now())

  @@map("notifications")
}

enum NotificationType {
  APPOINTMENT_CONFIRMED
  APPOINTMENT_REMINDER
  APPOINTMENT_DAY_OF
  PAYMENT_CONFIRMED
  REPURGRAMATION_APPROVED
  REPURGRAMATION_REJECTED
  CANCELLATION
  NEW_APPOINTMENT
  QUOTE_AVAILABLE
}

enum NotificationStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
}
```

#### 15. `Content` (Contenido de la página)

```prisma
model Content {
  id          String   @id @default(uuid())
  section     String   @unique // "hero", "about", "services", "how_it_works", "contact", "footer"
  title       String?
  subtitle    String?
  description String?
  imageUrl    String?
  buttonText  String?
  buttonUrl   String?
  seoTitle    String?
  seoDescription String?
  metadata    Json?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("content")
}
```

#### 16. `FAQ` (Preguntas frecuentes)

```prisma
model FAQ {
  id          String   @id @default(uuid())
  question    String
  answer      String
  category    String?
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("faqs")
}
```

#### 17. `ChatbotMessage` (Mensajes del chatbot)

```prisma
model ChatbotMessage {
  id          String   @id @default(uuid())
  type        String   // "QUESTION" | "ANSWER" | "OPTION" | "ACTION"
  question    String?
  answer      String?
  options     String[]? // Opciones de respuesta rápida
  actionUrl   String?   // URL a la que redirigir
  sortOrder   Int      @default(0)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("chatbot_messages")
}
```

#### 18. `Setting` (Configuración general)

```prisma
model Setting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  description String?
  type        SettingType // "STRING", "NUMBER", "BOOLEAN", "JSON", "FILE"
  group       String? // "general", "business", "payment", "notifications"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("settings")
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
  FILE
}
```

### Diagrama de Relaciones (Resumen Visual)

```
User (1) ──────── (1) Client
User (1) ──────── (0..N) Appointment
Client (1) ────── (0..N) Appointment
Service (1) ───── (0..N) Appointment
Appointment (1) ─ (0..1) Payment
Appointment (1) ─ (0..N) Photo
Appointment (1) ─ (0..1) Quote
Appointment (1) ─ (0..N) ReprogramRequest
Appointment (1) ─ (0..N) AppointmentHistory
Quote (1) ─────── (1) Client
Quote (1) ─────── (1) Appointment
```

---

## L. SEGURIDAD

### Capas de Seguridad

#### 1. Autenticación

| Aspecto | Implementación |
|---------|---------------|
| Registro | Email + contraseña con validación Zod |
| Login | NextAuth.js con credenciales |
| Contraseñas | Hasheado con bcrypt (próxima a NextAuth config) |
| Sesiones | JWT + sesión en base de datos (opcional) |
| Recuperación | Email con token temporal (POR INTEGRAR) |
| Protección de ruta | Next.js Middleware + Guards por rol |

#### 2. Autorización

| Verificación | Dónde |
|-------------|-------|
| ¿Es admin? | Middleware + API Routes |
| ¿Es dueño del recurso? | API Routes (cada endpoint) |
| ¿Tiene permiso para la acción? | Servicio de autorización |

#### 3. Validación de Datos

| Capa | Tecnología |
|------|-----------|
| Frontend | Zod + React Hook Form |
| Backend | Prisma Validation + Zod |
| Base de datos | Constraints de Prisma + PostgreSQL |

#### 4. Protección contra Inyección

| Tipo | Protección |
|------|-----------|
| SQL Injection | Prisma ORM (queries parametrizadas) |
| XSS | Sanitización de entrada + Next.js escaping automático |
| CSRF | NextAuth.js protege contra CSRF |
| Clickjacking | Headers de seguridad configurados |

#### 5. Subida de Archivos

| Aspecto | Protección |
|---------|-----------|
| Tipos permitidos | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| Tamaño máximo | 5MB por archivo (configurable) |
| Validación | Por extensión + MIME + tamaño |
| Almacenamiento | Local con nombres aleatorios, sin acceso directo a ruta |
| Escalabilidad | Arquitectura preparada para S3/Cloudflare R2 |

#### 6. Variables de Entorno

| Archivo | Contenido |
|---------|-----------|
| `.env.local` | Contraseñas, claves API, credentials (NUNCA en git) |
| `.env.example` | Plantilla sin valores reales |
| Código | Nunca hardcodea credenciales |

Variables requeridas (todas `POR DEFINIR` o `POR INTEGRAR`):

```env
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://innovarsecurity.com"
NEXTAUTH_SECRET="(generar con openssl)"

# Pasarela de pagos (POR INTEGRAR)
PAYMENT_PROVIDER="stripe"
STRIPE_SECRET_KEY="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."

# Email (POR INTEGRAR)
EMAIL_PROVIDER="resend"
EMAIL_API_KEY="..."

# WhatsApp (POR INTEGRAR)
WHATSAPP_TOKEN="..."
WHATSAPP_PHONE_ID="..."

# Application
APP_NAME="Innovar Security"
UPLOAD_MAX_SIZE=5242880
```

#### 7. Seguridad de Rutas Administrativas

| Protección | Implementación |
|-----------|---------------|
| Acceso a `/admin/*` | Next.js Middleware verifica rol ADMIN |
| Protección de API | Cada route verifica autenticación + rol |
| IP restrict | Opcional: configurar IP permitida |
| Rate limiting | Protección contra brute force |
| Logging | Registro de acciones administrativas |

#### 8. Datos Sensibles

| Regla | Detalle |
|-------|---------|
| Datos bancarios | **NUNCA** almacenar. Solo referencias de pago. |
| Número Nequi | Información de configuración, NO en código |
| Contraseñas | Hasheadas con bcrypt |
| Sesiones | Tokens con expiración |
| Logs | Sin datos sensibles |

---

## M. SISTEMA DE CITAS

### Estados de una Cita (Flujo de Estado)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO DE ESTADOS                          │
│                                                                   │
│  CREATED ──→ PAYMENT_PENDING ──→ PAYMENT_PROCESSING ──→ PAID   │
│       │                                           │            │
│       │                                      (falla) │            │
│       │                                           ▼            │
│       │                                      FAILED             │
│       │                                                           │
│       └──→ CANCELLED (si se cancela antes de pagar)              │
│                                                                   │
│       ▼                                                           │
│  CONFIRMED ──→ COMPLETED (visita realizada)                       │
│       │                                                           │
│       ├──→ CANCELLED (cancelada después de confirmada)             │
│       ├──→ REPROGRAMMED (se reprograma)                           │
│       └──→ CLIENT_NO_SHOW (cliente no asiste)                     │
│                                                                   │
│  REPROGRAMMED ──→ CONFIRMED (con nueva fecha)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Reglas de Estado

| Transición | Condición |
|------------|-----------|
| CREATED → PAYMENT_PENDING | Creada la solicitud |
| PAYMENT_PENDING → PAYMENT_PROCESSING | Cliente inicia pago |
| PAYMENT_PROCESSING → PAID | Pago exitoso |
| PAYMENT_PROCESSING → FAILED | Pago fallido |
| PAID → CONFIRMED | Sistema confirma automáticamente |
| CONFIRMED → COMPLETED | Técnico marca como realizada |
| CONFIRMED → CANCELLED | Cancelación por cualquier motivo |
| CONFIRMED → REPROGRAMMED | Solicitud aprobada |
| CONFIRMED → CLIENT_NO_SHOW | El cliente no asiste |
| REPROGRAMMED → CONFIRMED | Con la nueva fecha/hora |

### Disponibilidad

```typescript
// Lógica de disponibilidad (pseudocódigo)
function getAvailableSlots(date: Date): TimeSlot[] {
  // 1. Obtener horarios configurados para ese día de la semana
  const schedules = getSchedulesForDay(date.getDay());
  
  // 2. Verificar excepciones (día bloqueado)
  const exception = getExceptionForDate(date);
  if (exception?.type === 'BLOCKED') return [];
  
  // 3. Obtener citas existentes para ese día
  const existingAppointments = getAppointmentsForDate(date);
  
  // 4. Calcular slots disponibles
  const availableSlots = schedules.flatMap(schedule => {
    const blockedTimes = existingAppointments.map(a => ({
      start: a.scheduledTime,
      end: a.estimatedEnd || addMinutes(a.scheduledTime, schedule.blockDuration)
    }));
    
    return getFreeIntervals(
      { start: schedule.startTime, end: schedule.endTime },
      blockedTimes,
      schedule.blockDuration
    );
  });
  
  // 5. Filtrar por zona/distancia si es necesario
  return filterByZoneAvailability(availableSlots);
}
```

### Reglas de Bloqueo de Horario

| Regla | Detalle |
|-------|---------|
| Confirmación automática | Al pagar, el slot se bloquea inmediatamente |
| Duración del bloque | Configurable por servicio |
| Buffer entre citas | Configurable (ej: 15 min entre citas) |
| Cancelación libera slot | Inmediatamente al confirmar cancelación |
| Reprogramación | Libera el slot original, reserva el nuevo |

---

## N. SISTEMA DE PAGOS

### Arquitectura de Pagos

**Estado actual: POR INTEGRAR**

El sistema está diseñado para soportar múltiples pasarelas. La interfaz es abstracta para poder cambiar el proveedor sin modificar la lógica del negocio.

```typescript
// Interfaz de proveedor de pagos (abstracción)
interface PaymentProvider {
  initializePayment(amount: number, appointmentId: string): Promise<PaymentInit>;
  verifyPayment(reference: string): Promise<PaymentVerify>;
  refundPayment(reference: string): Promise<PaymentRefund>;
  getStatus(reference: string): Promise<PaymentStatus>;
}

// Implementaciones futuras
// StripeProvider implements PaymentProvider
// NequiBusinessProvider implements PaymentProvider
// PSEProvider implements PaymentProvider
// EfectivoProvider implements PaymentProvider
```

### Flujo de Pago

```
┌─────────────────┐
│ Cita creada      │ Estado: PENDING
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Se muestra costo │ Servicio + Desplazamiento
│ total            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cliente elige    │ Método de pago
│ método de pago   │ (cuando se defina)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Proceso de pago  │ Estado: PROCESSING
│ iniciado         │
└────────┬────────┘
         │
         ├──► ÉXITO ──→ Estado: PAID → CONFIRMED
         │                Slot bloqueado
         │                Recordatorio enviado
         │
         └──► FALLO ──→ Estado: FAILED
                          Opción de reintentar
                          Opción de cancelar
```

### Reglas de Pago

| Regla | Estado Actual |
|-------|--------------|
| Pasarela | POR INTEGRAR |
| Métodos de pago | POR DEFINIR |
| Moneda | COP (PENDIENTE - considerar USD si aplica) |
| Refunds | POR DEFINIR (según política) |
| Confirmación | Automática al recibir pago exitoso |
| Validez de pago | Configurable (ej: pago válido por 24h) |

### Número de Nequi

- El número de Nequi del negocio se almacenará como un **Setting** en la base de datos
- Accesible desde el panel administrativo
- **NUNCA** codificado en el código fuente
- Variable de entorno para referencia en desarrollo

---

## O. SISTEMA DE FOTOGRAFÍAS

### Flujo de Fotos

```
┌────────────────────┐
│ Cliente sube       │
│ fotografía         │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Validación:        │
│ ✅ Tipo: JPG, PNG  │
│ ✅ Tamaño: ≤5MB    │
│ ❌ Si falla → Error│
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Renombrar archivo  │
│ (UUID + timestamp) │
│ Ej: abc123-         │
│    1700000000.jpg  │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Guardar metadatos  │
│ en BD:             │
│ - URL              │
│ - Descripción      │
│ - AppointmentId    │
│ - Orden            │
│ - Tamaño           │
│ - MIME             │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Guardar archivo    │
│ en filesystem:     │
│ /uploads/citas/    │
│    [appointmentId]/│
│    [filename]      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Administrador      │
│ puede ver desde    │
│ ficha de cita      │
└────────────────────┘
```

### Reglas de Fotografías

| Regla | Valor |
|-------|-------|
| Tipos permitidos | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| Tamaño máximo por archivo | 5MB (configurable) |
| Máximo de fotos por cita | POR DEFINIR (sugerido: 10-15) |
| Descripción | Opcional, texto libre |
| Visibilidad | Solo administrador y dueño de la cita |
| Orden | Configurable por el cliente durante la solicitud |
| Escalabilidad | Arquitectura preparada para S3/Cloudflare R2 |

### Metadatos de Foto en BD

```typescript
interface Photo {
  id: string;
  appointmentId: string;
  url: string;           // Ruta relativa o URL de CDN
  description: string | null;
  fileName: string;      // Nombre original del archivo
  mimeType: string;      // Para validación y renderizado
  fileSize: number;      // En bytes
  order: number;         // Orden de visualización
  uploadedAt: DateTime;
}
```

---

## P. SISTEMA DE NOTIFICACIONES

### Arquitectura de Notificaciones

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA DE NOTIFICACIONES                  │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐ │
│  │  Trigger     │───→│  Servicio    │───→│  Channels      │ │
│  │  de Eventos  │    │  de Envío    │    │                │ │
│  └──────────────┘    └──────────────┘    └────────────────┘ │
│                                                           │   │
│  Eventos:                                              ┌────┼────┐
│  - CITA_CREADA                                 │ Email │ SMS │
│  - CITA_CONFIRMADA                           │  │    │  │
│  - PAGO_CONFIRMADO                           │  │    │  │
│  - CITA_REPROGRAMADA                         │  │    │  │
│  - CITA_CANCELADA                           │  │    │  │
│  - RECORDATORIO_24H                          │  │    │  │
│  - RECORDATORIO_DIA                          │  │    │  │
│  └──────────────────────────────────────────┘  │    │  │
│                                           ┌────┴────┴────┘
│                                           │
│                                     ┌─────▼──────┐
│                                     │   BD       │
│                                     │Notifications│
│                                     └─────────────┘
└─────────────────────────────────────────────────────────────┘
```

### Tipos de Notificaciones

| Trigger | Destinatario | Tipo | Momento |
|---------|-------------|------|---------|
| Cita creada | Cliente | In-app + Email | Inmediato |
| Cita confirmada | Cliente | In-app + Email + SMS | Inmediato |
| Pago confirmado | Cliente | In-app + Email | Inmediato |
| Recordatorio 24h | Cliente | In-app + Email + SMS | 24h antes |
| Recordatorio día | Cliente | In-app + Email + SMS | Mañana del día |
| Reprogramación aprobada | Cliente | In-app + Email | Inmediato |
| Reprogramación rechazada | Cliente | In-app + Email | Inmediato |
| Cancelación | Cliente | In-app + Email | Inmediato |
| Nueva solicitud | Administrador | In-app + Email | Inmediato |
| Pago recibido | Administrador | In-app + Email | Inmediato |
| Cita completada | Administrador | In-app + Email | Inmediato |

### Canales (POR INTEGRAR)

| Canal | Estado | Proveedor |
|-------|--------|-----------|
| Email | POR INTEGRAR | Resend / SendGrid |
| SMS | POR INTEGRAR | Twilio |
| WhatsApp | POR INTEGRAR | Twilio WhatsApp API |
| In-app | POR DEFINIR | Base de datos |

### Reglas

| Regla | Detalle |
|-------|---------|
| No spam | Máximo 1 notificación por evento |
| Opt-out | Cliente puede desactivar notificaciones |
| Idempotencia | No enviar duplicados |
| Logging | Todo intento de envío se registra |
| Retry | Reintentar en caso de fallo |

---

## Q. SISTEMA DE REPROGRAMACIÓN

### Reglas de Reprogramación

| Regla | Valor |
|-------|-------|
| Plazo mínimo | **24 horas** antes de la cita |
| Fuente del plazo | Variable desde configuración administrativa |
| Solicitud | Cliente solicita → Admin aprueba/rechaza |
| Costo de reprogramación | POR DEFINIR |
| Máximas reprogramaciones | POR DEFINIR |
| Notificación | Admin recibe notificación de solicitud |

### Flujo de Reprogramación

```
Cliente clic en "Solicitar Reprogramación"
         │
         ▼
¿Faltan ≥ 24 horas?
    │
    ├── NO ──→ Mostrar mensaje: "El plazo ha expirado"
    │           Opción: "Contactar al administrador manualmente"
    │
    └── SÍ ──→ Mostrar formulario
                → Nueva fecha (solo disponibles)
                → Nuevo horario (solo disponibles)
                → Motivo (campo libre)
                → Enviar solicitud
                │
                ▼
        Estado: "Solicitud Pendiente"
        Admin recibe notificación
        │
        ▼
    Admin revisa
    │
    ├── APROBAR ──→ Cita se reprograma
    │                Nueva fecha confirmada
    │                Slot anterior liberado
    │                Cliente notificado
    │                Horario bloqueado en nueva fecha
    │
    └── RECHAZAR ──→ Solicitud denegada
                     Cliente notificado con motivo
                     Cita mantiene fecha original
```

### Modelo de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador |
| appointmentId | UUID | Referencia a la cita |
| newDate | DateTime | Nueva fecha propuesta |
| newTime | DateTime | Nuevo horario propuesto |
| reason | String | Motivo de la solicitud |
| status | Enum | PENDING, APPROVED, REJECTED |
| adminNotes | String | Observaciones del admin |
| adminRespondedAt | DateTime | Cuándo se respondió |

---

## R. COTIZACIONES

### Arquitectura Preparada

**Estado actual: POR DEFINIR (base de datos lista, lógica pendiente)**

Las tablas de cotización ya están diseñadas en la base de datos. La lógica de generación y aceptación se implementará en una fase posterior.

### Flujo Previsional

```
Visita técnica realizada
         │
         ▼
Administrador genera cotización
         │
         ▼
Cotización asociada a la cita
         │
         ▼
Cliente recibe notificación
         │
         ▼
Cliente ve cotización
         │
         ├── ACEPTAR ──→ Estado: ACCEPTED → Se puede convertir en servicio/instalación
         │
         └── RECHAZAR ──→ Estado: REJECTED
                           Opción de solicitar nueva cotización
                           Opción de contactar al negocio
```

### Estructura de Cotización

| Campo | Tipo | Descripción |
|-------|------|-------------|
| items | JSON | Lista de items (cámaras, cable, materiales, mano de obra) |
| subtotal | Float | Costo de items |
| displacement | Float | Costo de desplazamiento |
| total | Float | Total final |
| observations | String | Notas adicionales |
| status | Enum | PENDING, ACCEPTED, REJECTED, EXPIRED |

### Items de Cotización (Estructura JSON Previsional)

```json
{
  "items": [
    {
      "type": "camera",
      "cameraId": "uuid",
      "name": "Cámara IP Exterior",
      "quantity": 4,
      "unitPrice": 0,
      "subtotal": 0
    },
    {
      "type": "material",
      "name": "Cable de red",
      "quantity": 100,
      "unit": "metros",
      "unitPrice": 0,
      "subtotal": 0
    },
    {
      "type": "labor",
      "name": "Mano de obra",
      "quantity": 1,
      "unit": "servicio",
      "unitPrice": 0,
      "subtotal": 0
    }
  ]
}
```

---

## S. ESCALABILIDAD FUTURA

### Preparación para Producto SaaS

Aunque actualmente el sistema es para Innovar Security, la arquitectura permite evolucionar:

#### Separaciones Clave

| Separación | Implementación Actual | Evolución Futura |
|------------|----------------------|------------------|
| Empresa | `settings` con prefijo `innovar_` | Tabla `companies` con relación 1:N |
| Usuario | `users` con `role` | Tabla `users` con `companyId` |
| Cliente | `clients` | `clients` con `companyId` |
| Servicio | `services` | `services` con `companyId` |
| Cita | `appointments` | `appointments` con `companyId` |
| Configuración | `settings` | Tabla `company_settings` |

#### Decisiones de Arquitectura que Facilitan SaaS

1. **Sin hardcodeo de empresa:** Nombre, logo, colores, contacto son todos configurable desde el panel.
2. **Sin hardcodeo de negocio:** La base de Fómeque se guarda como setting.
3. **Sin hardcodeo de precios:** Todo precio está en la BD, no en el código.
4. **Sin hardcodeo de horarios:** Configurables desde admin.
5. **ORM con migraciones:** Prisma permite agregar `companyId` a todas las tablas fácilmente.
6. **Separación de frontend/backend:** API routes son independientes del frontend.
7. **Sin vendor lock-in:** Tecnologías estándar (PostgreSQL, Next.js, TypeScript).

#### Estructura de Multiempresa (Preparada)

```
Future migration:

users.companyId     →  companies.id
clients.companyId   →  companies.id  
services.companyId  →  companies.id
appointments.companyId → companies.id
...
```

### Escalabilidad Técnica

| Escalabilidad | Preparación |
|---------------|-------------|
| Base de datos | PostgreSQL puede manejar miles de registros |
| Archivos | Preparado para S3/Cloudflare R2 |
| Cache | Redis puede agregarse fácilmente |
| CDN | Configuración preparada |
| Load balancer | Docker permite escalar contenedores |
| Monitoreo | Estructura lista para integración de herramientas |
| Mobile app | API REST puede servir a app móvil |

---

## T. INFORMACIÓN PENDIENTE

La siguiente información **NO** está definida y debe ser proporcionada por el propietario del negocio o completada desde el panel administrativo:

### Datos del Negocio

| Dato | Estado | Dónde se Configurará |
|------|--------|----------------------|
| Nombre del negocio | Innovar Security | ✅ CONFIGURADO |
| Propietario | Yeison Fabian Rodriguez Rios | ✅ CONFIGURADO |
| Teléfono | 304 4451436 | ✅ CONFIGURADO |
| Ubicación | Fómeque, Cundinamarca | ✅ CONFIGURADO |
| Email comercial | PENDIENTE | Panel admin → Configuración |
| Dirección exacta | PENDIENTE | Panel admin → Configuración |
| Logo | PENDIENTE | Panel admin → Configuración |
| Favicon | PENDIENTE | Panel admin → Configuración |

### Servicios

| Dato | Estado |
|------|--------|
| Lista de servicios | PENDIENTE |
| Descripción de cada servicio | PENDIENTE |
| Precio de cada servicio | PENDIENTE |
| Duración estimada de cada servicio | PENDIENTE |
| Imagen de cada servicio | PENDIENTE |

### Cámaras/Equipos

| Dato | Estado |
|------|--------|
| Lista de cámaras | PENDIENTE |
| Marcas | PENDIENTE |
| Modelos | PENDIENTE |
| Precios | PENDIENTE |
| Especificaciones técnicas | PENDIENTE |
| Fotografías | PENDIENTE |

### Tarifas y Costos

| Dato | Estado |
|------|--------|
| Tarifa base de visita | PENDIENTE |
| Costo de desplazamiento por km | PENDIENTE |
| Zonas de cobertura | PENDIENTE |
| Distancia desde Fómeque | PENDIENTE |
| Recargo por zona lejana | PENDIENTE |

### Horarios

| Dato | Estado |
|------|--------|
| Horarios laborales | PENDIENTE |
| Días disponibles | PENDIENTE |
| Duración de bloques | PENDIENTE |
| Días no disponibles | PENDIENTE |
| Excepciones | PENDIENTE |

### Políticas

| Dato | Estado |
|------|--------|
| Plazo de reprogramación (actual: 24h) | POR DEFINIR |
| Política de cancelación | PENDIENTE |
| Política de reembolso | PENDIENTE |
| Costo de reprogramación | PENDIENTE |
| Máximo de reprogramaciones | PENDIENTE |

### Pasarela de Pagos

| Dato | Estado |
|------|--------|
| Proveedor de pagos | POR INTEGRAR |
| Número de Nequi | PENDIENTE (configuración) |
| Moneda principal | POR DEFINIR |
| Métodos de pago | PENDIENTE |
| Tasa de comisión | PENDIENTE |

### Canales de Notificación

| Dato | Estado |
|------|--------|
| Proveedor de email | POR INTEGRAR |
| Proveedor de SMS | POR INTEGRAR |
| Proveedor de WhatsApp | POR INTEGRAR |
| Email de envío | PENDIENTE |

### Contenido Web

| Dato | Estado |
|------|--------|
| Texto de la página de inicio | PENDIENTE |
| Texto de la página de servicios | PENDIENTE |
| Texto de la página de cámaras | PENDIENTE |
| Texto de la página de contacto | PENDIENTE |
| Texto de FAQ | PENDIENTE |
| Texto de chatbot | PENDIENTE |
| Eslogan | PENDIENTE |
| Descripción meta (SEO) | PENDIENTE |

### Redes Sociales

| Dato | Estado |
|------|--------|
| Facebook | PENDIENTE |
| Instagram | PENDIENTE |
| WhatsApp | PENDIENTE |
| YouTube | PENDIENTE |
| TikTok | PENDIENTE |

### Datos Adicionales

| Dato | Estado |
|------|--------|
| Color secundario (adicional al negro/azul/blanco) | PENDIENTE |
| Tipografía secundaria | PENDIENTE |
| Fotografías del negocio | PENDIENTE |
| Certificaciones | PENDIENTE |
| Alianzas | PENDIENTE |

---

## U. FASES DE DESARROLLO

### Visión General

Se planean **7 fases** de desarrollo, cada una con un objetivo claro, entregable concreto y criterio de aprobación antes de continuar.

---

### FASE 0: Preparación del Entorno (Semana 1)

**Objetivo:** Tener el entorno de desarrollo configurado, estructura base del proyecto, y poder comenzar a codificar sin fricción.

**Entregables:**
- [ ] Estructura de carpetas creada
- [ ] `package.json` configurado con todas las dependencias
- [ ] `tsconfig.json` con TypeScript strict
- [ ] `tailwind.config.ts` configurado
- [ ] `prisma/schema.prisma` con modelo base
- [ ] `.env.example` creado
- [ ] `Dockerfile` y `docker-compose.yml` creados
- [ ] PostgreSQL corriendo en Docker
- [ ] Primera página funcionando (Hello World)
- [ ] ESLint + Prettier configurados
- [ ] README.md con instrucciones de setup

**Criterio de Aprobación:**
- `npm run dev` funciona sin errores
- Base de datos conectada y accesible
- Estructura de carpetas organizada

**No se implementa funcionalidad de negocio en esta fase.**

---

### FASE 1: Fundación y Autenticación (Semana 2-3)

**Objetivo:** Tener el sistema de autenticación funcional, la base de datos completa, y la estructura de diseño implementada.

**Entregables:**
- [ ] Prisma schema completo con todas las tablas
- [ ] Migraciones de Prisma ejecutadas
- [ ] NextAuth.js configurado con login de admin
- [ ] Login/Registro de cliente funcional
- [ ] Protección de rutas (middleware)
- [ ] Tailwind configurado con colores (negro, azul metálico, blanco)
- [ ] Componentes base de UI (Button, Input, Card, Modal)
- [ ] Layout público con Navbar y Footer
- [ ] Layout admin con Sidebar
- [ ] Variables de entorno `.env.local` funcionando
- [ ] Seed de datos para desarrollo (admin demo)

**Criterio de Aprobación:**
- Admin puede hacer login
- Cliente puede registrarse e iniciar sesión
- Rutas protegidas funcionan correctamente
- UI base consistente

---

### FASE 2: Área Pública Básica (Semana 4-5)

**Objetivo:** Tener las páginas públicas funcionales para que el cliente pueda conocer el negocio y el proceso.

**Entregables:**
- [ ] Página de inicio (`/`) con información básica
- [ ] Página de servicios (`/servicios`) con listado de PENDIENTE
- [ ] Página de cámaras (`/cameras`) con listado de PENDIENTE
- [ ] Página de cómo funciona (`/como-funciona`) con guía
- [ ] Página de contacto (`/contacto`)
- [ ] Página de FAQ (`/preguntas-frecuentes`)
- [ ] Página de cómo funciona del proceso de citas
- [ ] Chatbot básico inline
- [ ] SEO básico implementado (metadata, Open Graph)
- [ ] Responsive verificado en móvil y desktop
- [ ] Contenido configurado desde panel admin (Content)

**Criterio de Aprobación:**
- Todas las páginas públicas accesibles
- Responsive funcionando en todos los breakpoints
- SEO metadata configurado
- Chatbot navegable

---

### FASE 3: Sistema de Solicitud de Servicio (Semana 6-8)

**Objetivo:** El cliente puede solicitar un servicio completo con formulario multi-paso, selección de ubicación, fotos, y vista de costos.

**Entregables:**
- [ ] Formulario multi-paso con componente `StepForm`
- [ ] Paso 1: Selección de servicio
- [ ] Paso 2: Información del servicio (preguntas condicionales)
- [ ] Paso 3: Ubicación (municipio, dirección, referencia)
- [ ] Paso 4: Fotografías del lugar (upload + descripción)
- [ ] Paso 5: Condiciones y riesgos
- [ ] Paso 6: Fecha y horario con calendario
- [ ] Cálculo de costos (servicio + desplazamiento)
- [ ] Resumen antes de confirmar
- [ ] API de creación de citas
- [ ] Validación completa con Zod
- [ ] Subida de archivos funcional
- [ ] Calendario de disponibilidad funcional
- [ ] Zona de cobertura configurable (PENDIENTE)

**Criterio de Aprobación:**
- Cliente puede completar todo el proceso de solicitud
- Fotos se suben correctamente
- Calendario muestra horarios disponibles
- Costo se calcula correctamente
- Cita se crea en la base de datos con estado PENDING

---

### FASE 4: Sistema de Pagos y Confirmación (Semana 9-11)

**Objetivo:** El cliente puede pagar y confirmar su cita. Se implementa la arquitectura de pagos.

**Entregables:**
- [ ] Arquitectura de pagos (interfaz abstracta)
- [ ] Estado de cita: PENDING → PAYMENT_PENDING → PAID → CONFIRMED
- [ ] Pantalla de resumen y pago
- [ ] Interface para pasarela de pagos (STUB)
- [ ] Configuración de pasarela lista (STRIPE o la que se defina)
- [ ] Registro de pago en BD
- [ ] Confirmación de cita (email/SMS)
- [ ] Sistema de notificaciones básico
- [ ] Dashboard de citas para cliente
- [ ] Ficha completa de cita para cliente
- [ ] Configuración de zona/distancia/tarifas desde admin
- [ ] Panel de pagos para administrador

**Criterio de Aprobación:**
- Flujo de pago completo (con stubs si la pasarela no está)
- Cita confirmada al pagar
- Email de confirmación enviado
- Calendario actualizado con citas confirmadas
- Admin puede ver estado de pagos

---

### FASE 5: Área Administrativa Completa (Semana 12-15)

**Objetivo:** El administrador tiene control total sobre todo el sistema desde un panel profesional.

**Entregables:**
- [ ] Dashboard con métricas (citas, pagos, clientes)
- [ ] Gestión de citas (listado, filtrado, acciones)
- [ ] Calendario administrativo (vista mes/semana/día)
- [ ] Gestión de clientes (CRUD completo)
- [ ] Gestión de servicios (CRUD + activar/desactivar)
- [ ] Catálogo de cámaras (CRUD completo)
- [ ] Gestión de horarios (bloques, excepciones)
- [ ] Configuración de zonas y tarifas de desplazamiento
- [ ] Gestión de pagos (historial, confirmar)
- [ ] Ficha completa de cita administrativa
- [ ] Historial de cambios de citas
- [ ] Gestión de contenido web
- [ ] Gestión de chatbot (mensajes, FAQs)
- [ ] Gestión de políticas (cancelación, reprogramación)
- [ ] Configuración general del negocio
- [ ] Panel de notificaciones
- [ ] Reportes básicos

**Criterio de Aprobación:**
- Admin puede crear/editar/eliminar cualquier servicio
- Admin puede ver y gestionar todas las citas
- Calendario muestra todas las citas
- Dashboard muestra métricas correctas
- Todo contenido editable sin tocar código

---

### FASE 6: Funcionalidades Adicionales (Semana 16-18)

**Objetivo:** Implementar funcionalidades de seguimiento, reproducción, y mejoras de UX.

**Entregables:**
- [ ] Reprogramación de citas (flujo completo)
- [ ] Cancelación de citas con políticas
- [ ] Recordatorios automáticos (baseline)
- [ ] Área del cliente completa (perfil, citas, notificaciones)
- [ ] Sistema de notificaciones por email (integración real)
- [ ] Chatbot funcional con FAQs reales
- [ ] Optimización de rendimiento
- [ ] Testing de integración
- [ ] SEO avanzado (sitemap, robots, structured data)
- [ ] Accesibilidad (ARIA, contraste, navegación por teclado)
- [ ] Página 404 personalizada
- [ ] Página de mantenimiento (opcional)

**Criterio de Aprobación:**
- Cliente puede reprogramar citas dentro del plazo
- Recordatorios funcionan
- Todo accesible por teclado
- Rendimiento evaluado y optimizado

---

### FASE 7: Pruebas, Producción y Lanzamiento (Semana 19-20)

**Objetivo:** Sistema listo para producción con todas las pruebas necesarias.

**Entregables:**
- [ ] Test unitarios de servicios críticos
- [ ] Test de integración del flujo de citas
- [ ] Test de seguridad (auth, autorización, validación)
- [ ] Test de rendimiento (carga simulada)
- [ ] Docker Compose para producción
- [ ] Configuración de VPS con Nginx
- [ ] SSL/HTTPS configurado
- [ ] Variables de entorno de producción
- [ ] Backup strategy configurado
- [ ] Monitoreo básico configurado
- [ ] Documentación de usuario (admin)
- [ ] Documentación técnica (para futuros desarrolladores)
- [ ] Revisión final de contenido (reemplazar todos los PENDIENTE)
- [ ] Lanzamiento a producción

**Criterio de Aprobación:**
- Todas las pruebas pasan
- Sistema funcionando en producción
- Documentación completa
- Toda la información PENDIENTE reemplazada

---

### Resumen de Cronograma

| Fase | Duración | Semanas | Entregable Principal |
|------|----------|---------|---------------------|
| Fase 0: Entorno | 1 semana | 1 | Entorno listo |
| Fase 1: Auth y Base | 2 semanas | 2-3 | Login y estructura |
| Fase 2: Páginas Públicas | 2 semanas | 4-5 | Sitio público |
| Fase 3: Solicitud de Servicio | 3 semanas | 6-8 | Formulario completo |
| Fase 4: Pagos y Confirmación | 3 semanas | 9-11 | Pagos funcionales |
| Fase 5: Panel Admin | 4 semanas | 12-15 | Admin completo |
| Fase 6: Funcionalidades | 3 semanas | 16-18 | Reprogramación, notificaciones |
| Fase 7: Producción | 2 semanas | 19-20 | Sistema en producción |
| **TOTAL** | **17 semanas** | **~4 meses** | **Producto lista** |

---

## V. PRUEBAS NECESARIAS

### Plan de Pruebas por Capa

#### 1. Pruebas Unitarias

| Componente | Descripción | Herramienta |
|------------|-------------|-------------|
| Validación Zod | Cada esquema de formulario | Jest/Vitest |
| Servicios de negocio | Cálculo de costos, disponibilidad | Jest/Vitest |
| Funciones de fecha | Cálculo de plazos | Jest/Vitest |
| Utilidades | Formateo, conversión | Jest/Vitest |

#### 2. Pruebas de Integración

| Flujo | Descripción | Herramienta |
|-------|-------------|-------------|
| Flujo de citas | Crear → Pagar → Confirmar → Completar | Playwright/Cypress |
| Autenticación | Login → Acceder → Logout | Playwright/Cypress |
| Reprogramación | Solicitar → Aprobar → Confirmar | Playwright/Cypress |
| Pagos | Iniciar pago → Confirmar → Ver estado | Playwright/Cypress |
| Subida de archivos | Subir foto → Verificar en BD | Playwright/Cypress |

#### 3. Pruebas de Seguridad

| Prueba | Descripción |
|--------|-------------|
| Autenticación | ¿Puede un no autenticado acceder a `/admin/*`? |
| Autorización | ¿Puede el cliente A ver la cita del cliente B? |
| Inyección SQL | ¿Prisma protege contra inyección? |
| XSS | ¿Los inputs se sanitizan correctamente? |
| CSRF | ¿NextAuth protege contra CSRF? |
| Subida de archivos | ¿Se pueden subir archivos no-imagen? |
| Tamaño de archivos | ¿Se rechazan archivos >5MB? |
| Headers de seguridad | ¿CSP, HSTS, X-Frame-Options están configurados? |

#### 4. Pruebas de Rendimiento

| Prueba | Descripción |
|--------|-------------|
| Lighthouse | Puntuación >90 en rendimiento, SEO, accesibilidad |
| Carga de páginas | Tiempos de carga < 3 segundos |
| Imágenes | Lazy loading funcionando |
| Bundle size | Tree-shaking funcionando |
| Base de datos | Consultas optimizadas, índices correctos |

#### 5. Pruebas de UX/UI

| Prueba | Descripción |
|--------|-------------|
| Responsive | Todas las páginas en móvil, tablet, desktop |
| Accesibilidad | Navegación por teclado, lectores de pantalla |
| Usabilidad del formulario | Flujo sin fricción, errores claros |
| Calendario | Usable en móvil (touch-friendly) |
| Upload de fotos | Fácil en celular |

---

## W. RIESGOS TÉCNICOS

### Riesgos Identificados y Mitigación

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|:------------:|:-------:|------------|
| 1 | **Pasarela de pagos no definida** | Alta | Alto | Mantener arquitectura abstracta; definir pronto |
| 2 | **Información del negocio insuficiente** | Alta | Medio | Sistema diseñado para PENDIENTE/POR DEFINIR; admin puede completar |
| 3 | **Integración de notificaciones retrasada** | Media | Medio | Sistema de notificaciones con interface abstracta; se puede implementar después |
| 4 | **Rendimiento del upload de archivos** | Media | Bajo | Local storage inicial; migrar a S3 cuando sea necesario |
| 5 | **Calendario de disponibilidad complejo** | Media | Alto | Implementar paso a paso; comenzar con bloques simples |
| 6 | **Diseño responsive insuficiente** | Media | Alto | Mobile-first desde el inicio; testing continuo |
| 7 | **Seguridad comprometida** | Baja | Muy Alto | Validación en todas las capas; auditorías periódicas; Prisma ORM |
| 8 | **Prisa por completar el proyecto** | Alta | Alto | Seguir las fases estrictamente; no saltarse pasos |
| 9 | **Cambios en requisitos durante el desarrollo** | Media | Medio | Documentar cambios; evaluar impacto antes de modificar |
| 10 | **Dependencia de tecnologías externas** | Media | Medio | Mantener stubs para servicios externos; tener alternativas |
| 11 | **Base de datos crece mucho** | Baja | Bajo | PostgreSQL escala bien; índices optimizados; particionamiento si es necesario |
| 12 | **Diferencias de entorno de desarrollo** | Baja | Bajo | Docker Compose para entorno consistente |
| 13 | **Accesibilidad no cumplida** | Media | Medio | Auditoría de accesibilidad en cada fase |
| 14 | **Fotografías de baja calidad** | Alta | Bajo | Validación de tipo y tamaño; no de calidad |
| 15 | **Necesidad de traducir a otro idioma** | Baja | Medio | Textos separados de código; sistema de i18n listo para añadir |

### Información Crítica que Puede Bloquear el Proyecto

Estos son los items que **NECESITAN** definición antes o durante las primeras fases:

| # | Información | Fase donde se Necesita | Impacto si Falta |
|---|------------|----------------------|------------------|
| 1 | **Proveedor de pagos** | Fase 4 | No se puede completar el flujo de pago |
| 2 | **Email comercial** | Fase 1 | No se puede enviar notificaciones |
| 3 | **Horarios laborales** | Fase 3 | El calendario no funciona correctamente |
| 4 | **Lista de servicios con precios** | Fase 3 | El formulario de solicitud es incompleto |
| 5 | **Zonas y tarifas de desplazamiento** | Fase 3 | El cálculo de costos no es preciso |
| 6 | **Contraseña del admin inicial** | Fase 1 | No se puede acceder al panel |
| 7 | **Dominio / Hosting** | Fase 7 | No se puede desplegar |

---

## APÉNDICE: NOTAS TÉCNICAS

### Sobre la Estructura de Archivos

Todos los archivos se trabajarán bajo `C:\innovar security\` (accesible como `/mnt/c/innovar security/` en este entorno WSL2).

### Sobre el Uso de Prisma

Prisma ORM se elige por:
- Type safety total
- Autocompletado en el editor
- Migraciones automáticas
- Relaciones declarativas
- Fácil de usar con TypeScript
- No genera SQL injection

### Sobre Tailwind CSS

Tailwind se elige por:
- Construir diseño directamente en JSX
- Consistencia garantizada por clases predefinidas
- Responsive con breakpoints integrados
- Fácil personalización del tema (colores de Innovar Security)
- Sin CSS global que mantener
- Fácil de hacer dark mode si se necesita

### Sobre el Diseño Visual

Los tres colores principales se implementarán como variables CSS en Tailwind:

```css
:root {
  --color-primary: #000000;        /* Negro */
  --color-secondary: #1e3a5f;      /* Azul metálico */
  --color-accent: #2563eb;         /* Azul brillante (para CTAs) */
  --color-background: #ffffff;     /* Blanco */
  --color-text: #1a1a1a;           /* Casi negro para texto */
  --color-text-muted: #6b7280;     /* Gris para texto secundario */
  --color-border: #e5e7eb;         /* Borde sutil */
  --color-surface: #f9fafb;        /* Fondo de tarjetas */
}
```

*(Nota: El azul metálico exacto se definirá con el propietario del negocio. Este es un placeholder.)*

### Sobre el Formato de Archivos

- Todos los archivos de código usan TypeScript
- Todos los archivos de configuración son `.ts` o `.json`
- Los archivos `.env` nunca se commitean a git
- Los archivos de documentación se mantienen actualizados
- Cada fase se documenta con su propio README si es necesario

### Sobre el Control de Versiones

- Git configurado en `C:\innovar security\`
- Ramas por fase: `feature/fase-1-auth`, `feature/fase-3-solicitud`, etc.
- Commits descriptivos
- `.gitignore` que excluye `.env`, `node_modules`, `uploads/`, `prisma/migrations/`

---

## CONCLUSIÓN DEL PLAN

Este plan maestro define la arquitectura, tecnologías, estructura, modelos de datos, seguridad, flujos, fases de desarrollo, riesgos e información pendiente para la plataforma Innovar Security.

**Puntos clave:**

1. ✅ La carpeta raíz está vacía y lista para el proyecto
2. ✅ La arquitectura está diseñada para ser profesional y escalable
3. ✅ Las tecnologías están justificadas y son industriales
4. ✅ El modelo de datos cubre todas las entidades requeridas
5. ✅ La seguridad está planificada desde la base
6. ✅ Los flujos de usuario están documentados
7. ✅ Las fases de desarrollo son claras y verificables
8. ✅ La información pendiente está explícitamente identificada
9. ✅ No se ha inventado información comercial del negocio
10. ⏳ **Esperando aprobación del plan maestro para comenzar la implementación**

---

**Plan elaborado por:** Equipo de Desarrollo Innovar Security  
**Fecha:** 12 de Septiembre de 2026  
**Estado:** PENDIENTE DE APROBACIÓN  
**Próximo paso:** Esperar la aprobación del propietario antes de iniciar Fase 0
