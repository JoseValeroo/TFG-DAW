# Lure — Backend (API)

API REST de la red social **Lure**, construida con **NestJS + TypeORM + MySQL**.
Primera iteración: **autenticación** (registro, login y usuario actual) con JWT y
contraseñas hasheadas con bcrypt.

## Requisitos

- Node.js 18+
- MySQL en local (o accesible por red)

## Puesta en marcha

```bash
cd 03_Desarrollo/backend
npm install

# 1) Configura el entorno
cp .env.example .env       # y edita DB_USER / DB_PASSWORD / JWT_SECRET

# 2) Crea la base de datos (las TABLAS las crea TypeORM solo con synchronize=true)
#    En tu cliente MySQL:
#    CREATE DATABASE lure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3) Arranca en desarrollo (hot reload)
npm run start:dev
```

La API queda en `http://localhost:3000/api`.

> ⚠️ `DB_SYNCHRONIZE=true` es solo para desarrollo (crea/actualiza tablas
> automáticamente). En producción debe ser `false` y usar migraciones.

## Endpoints

| Método | Ruta | Cuerpo | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | `{ username, email, password }` | Crea usuario y devuelve `{ token, user }` |
| `POST` | `/api/auth/login` | `{ username, password }` | Valida credenciales y devuelve `{ token, user }` |
| `GET` | `/api/auth/me` | — (header `Authorization: Bearer <token>`) | Devuelve el usuario autenticado |

### Ejemplos

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jose","email":"jose@example.com","password":"secreto123"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jose","password":"secreto123"}'

curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <TOKEN>"
```

## Estructura

```
src/
├── main.ts                 # bootstrap: prefijo /api, CORS, ValidationPipe global
├── app.module.ts           # ConfigModule + TypeOrm (MySQL) + Users + Auth
├── users/
│   ├── user.entity.ts      # tabla users (id, username, email, password_hash, created_at)
│   ├── users.service.ts    # acceso a datos
│   └── users.module.ts
└── auth/
    ├── auth.controller.ts   # /auth/register, /auth/login, /auth/me
    ├── auth.service.ts      # bcrypt + emisión de JWT
    ├── auth.module.ts       # JwtModule + Passport
    ├── jwt.strategy.ts      # validación del Bearer token
    ├── jwt-auth.guard.ts    # guard de rutas protegidas
    ├── current-user.decorator.ts
    └── dto/                 # validación de entrada (class-validator)
```

## Seguridad

- Contraseñas hasheadas con **bcrypt** (10 rounds); nunca se devuelve el hash.
- **JWT** firmado con `JWT_SECRET` (configúralo fuerte y único por entorno).
- Validación estricta de entrada (`whitelist` + `forbidNonWhitelisted`).
- Secretos solo en `.env` (gitignored), nunca en el repositorio.
