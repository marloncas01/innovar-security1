# Innovar Security - Plataforma Web

Plataforma profesional de gestión de servicios de cámaras de seguridad.

## Inicio Rápido

### Requisitos
- Node.js v24+ 
- npm v11+

### Instalación

```bash
# Clonar el repositorio
cd "C:\innovar security"

# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Crear base de datos SQLite (desarrollo)
npx prisma db push

# Poblar base de datos con datos iniciales
npx tsx prisma/seed.ts

# Iniciar servidor de desarrollo
npm run dev
```

### URLs
- **Pública:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
- **Login Admin:** http://localhost:3000/login

### Credenciales de Desarrollo
- **Email:** admin@innovarsecurity.com
- **Contraseña:** admin123456

> ⚠️ CAMBIAR LA CONTRASEÑA EN PRODUCCIÓN

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Construir para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Verificar código |
| `npx prisma generate` | Generar Prisma Client |
| `npx prisma db push` | Sincronizar esquema con BD |
| `npx prisma studio` | Abrir Prisma Studio |
| `npx tsx prisma/seed.ts` | Poblar BD con datos iniciales |
| `npx prisma migrate dev` | Crear migración |

## Estructura del Proyecto

```
innovar-security/
├── prisma/              # Esquema de BD, seeds, backups
├── src/
│   ├── app/             # Rutas de Next.js (App Router)
│   │   ├── (public)/    # Páginas públicas
│   │   ├── (client)/    # Área del cliente
│   │   ├── admin/       # Panel administrativo
│   │   └── api/         # API Routes
│   ├── components/      # Componentes React
│   │   ├── ui/          # Componentes base
│   │   ├── layout/      # Navbar, Footer, Sidebar
│   │   ├── public/      # Componentes públicos
│   │   ├── client/      # Componentes del cliente
│   │   └── admin/       # Componentes del admin
│   ├── lib/             # Utilidades, auth, prisma
│   ├── services/        # Lógica de negocio
│   ├── hooks/           # Custom React hooks
│   ├── types/           # Tipos TypeScript
│   └── middleware.ts    # Protección de rutas
├── public/              # Archivos estáticos
├── uploads/             # Archivos subidos
└── .env.local           # Variables de entorno
```

## Base de Datos

- **Desarrollo:** SQLite (`prisma/dev.db`)
- **Producción:** PostgreSQL (requiere configurar `DATABASE_URL`)

### Migrar a PostgreSQL

1. Instalar PostgreSQL
2. Actualizar `.env` con la URL de PostgreSQL
3. Actualizar `prisma/schema.prisma`: cambiar `provider = "sqlite"` a `provider = "postgresql"`
4. Ejecutar: `npx prisma db push`
5. Ejecutar seed: `npx tsx prisma/seed.ts`

## Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

- `DATABASE_URL` - URL de conexión a la base de datos
- `NEXTAUTH_SECRET` - Secreto para sesiones
- `NEXTAUTH_URL` - URL base de la aplicación
- `APP_NAME` - Nombre de la aplicación
- `UPLOAD_MAX_SIZE` - Tamaño máximo de archivos (bytes)

## Technologías

- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript 5.7.2
- **Database:** Prisma 5.22.0 + SQLite (desarrollo)
- **Auth:** NextAuth.js 4.24.15
- **Styling:** Tailwind CSS 3.4.17
- **Forms:** React Hook Form + Zod
- **UI:** shadcn/ui (por implementar)

## Producción

### Docker

```bash
# Construir imagen
docker build -t innovar-security .

# Ejecutar con Docker Compose
docker-compose up -d
```

### Variables de Producción

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/innovar_security
NEXTAUTH_URL=https://innovarsecurity.com
NEXTAUTH_SECRET=secreto-seguro-aqui
NODE_ENV=production
```

## Backups

```bash
# Ejecutar backup manual
npx tsx prisma/backup.ts

# Backup automático (agregar a crontab)
0 2 * * * cd "C:\innovar security" && npx tsx prisma/backup.ts
```

## Licencia

Propietario: Yeison Fabian Rodriguez Rios
Teléfono: 304 4451436
Ubicación: Fómeque, Cundinamarca, Colombia
