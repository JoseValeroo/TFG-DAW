# CLAUDE.md

Este archivo guía a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

> **Nota:** Ejecuta `/init` para que Claude analice el proyecto y mejore este archivo con información específica.

---

## @imports (Contexto Automático)

@_duran/ESTADO_PROYECTO.json
@_duran/SESION_ACTUAL.md
@_duran/DEPENDENCIAS.md
@_duran/FUNCIONALIDADES.md
@.claude/CLAUDE_BASE_COMILLAS.md

---

## Ecosistema STIC.IA

| Componente | Carpeta | Proposito |
|------------|---------|-----------|
| **STIC.IA** | `/` | Ecosistema completo: plantilla + comandos + skills + reglas |
| **DURAN** | `_duran/` | Memoria del proyecto: estado, sesiones, lecciones, historial |
| **ATLAS** | `_atlas/` | Base de conocimiento: indice de Documentos_Base, rules, patterns |

> Claude consulta **DURAN** para entender el estado actual del proyecto y **ATLAS** para acceder a documentacion de referencia.

---

## Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | TFG-DAW (`paquete-tfg`) — red social / portal multimedia "Lure" |
| **Versión** | 0.0.0 (desarrollo) |
| **Tipo** | App full-stack: SPA React (frontend) + API REST NestJS/MySQL (backend) |
| **Framework** | Frontend: React 18.3 + Vite 8 (JS/JSX). Backend: NestJS 11 + TypeORM + MySQL (TypeScript) |

> ⚠️ **CRÍTICO para Claude**: este **NO es un proyecto .NET**, pese a que la plantilla base
> (`CLAUDE_BASE_COMILLAS.md`, `.claude/rules/*.md`, los comandos) está orientada a .NET/C#.
> Las reglas .NET, los comandos `dotnet`, Clean Architecture y SQL Server **no aplican**.
> El código vivo está en **`03_Desarrollo/`**, dividido en dos proyectos:
> - **`03_Desarrollo/frontend/`** — SPA React + Vite (JavaScript).
> - **`03_Desarrollo/backend/`** — API REST NestJS + TypeORM + **MySQL** (TypeScript).
>
> La `src/` que git muestra como *deleted* en la raíz se movió a `03_Desarrollo/frontend/`.

---

## Glosario del Dominio

> **Propósito**: Definir términos de negocio específicos para que Claude entienda el contexto del proyecto.
> Completar durante `/onboarding` o manualmente. Evita redefinir términos en cada conversación.

| Término | Definición | Ejemplo de uso |
|---------|------------|----------------|
| Lure | Marca/nombre de la aplicación (logo `Logo.svg`, login/register) | "El logo de Lure aparece en el login" |
| CardPadre | Componente de tarjeta de artículo/noticia reutilizable (imagen + título + texto + fecha) | "El feed se compone de varios `CardPadre`" |
| CardPadre2 | Variante de tarjeta destacada (artículo principal de la columna izquierda) | "La `Mitad_Izquierda` muestra un `CardPadre2`" |
| MicroPerfil | Componente de mini-perfil de usuario | "El sidebar incluye un `MicroPerfil`" |
| Tarjeta expandida | Estado de `App` donde una `CardPadre` se abre a pantalla completa al hacer click (`expandedCard`) | "Al pulsar una tarjeta se renderiza la vista `expanded-card`" |

<!--
EJEMPLOS (eliminar al completar):

Para una aplicación de becas:
| Beca | Ayuda económica otorgada a estudiantes según criterios académicos o socioeconómicos | "El estudiante solicita una Beca de Excelencia" |
| Convocatoria | Periodo en que se pueden solicitar becas, con fechas de inicio y fin | "La Convocatoria 2026 abre el 1 de marzo" |
| Adjudicación | Proceso de asignar becas a solicitantes que cumplen requisitos | "La Adjudicación se realiza tras el cierre de la convocatoria" |

Para una aplicación de RRHH:
| Empleado | Persona con contrato laboral activo en la organización | "El Empleado solicita vacaciones" |
| Nómina | Documento mensual con el desglose salarial | "La Nómina se genera el día 25 de cada mes" |
| Fichaje | Registro de entrada/salida del empleado | "El Fichaje se realiza mediante tarjeta RFID" |

CATEGORÍAS COMUNES:
- Entidades principales (Usuario, Cliente, Producto, Pedido...)
- Estados y flujos (Pendiente, Aprobado, Rechazado...)
- Procesos de negocio (Facturación, Matriculación, Validación...)
- Roles (Administrador, Gestor, Solicitante...)
- Métricas (KPI, SLA, Cobertura...)
-->

---

## Comandos Comunes

> ⚠️ Node está instalado en `C:\Program Files\nodejs` pero **no en el PATH** de las shells.
> Para `npm` en PowerShell: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.

### Frontend (React + Vite) — desde `03_Desarrollo/frontend/`

```bash
cd 03_Desarrollo/frontend
npm install
npm run dev                # Vite dev server (HMR) — http://localhost:5173
npm run build              # Build de producción a dist/
npm run preview            # Servir el build localmente
npm run lint               # ESLint (0 errores, 0 warnings)
npm test                   # Vitest (jsdom + React Testing Library)
npm run test:watch         # Vitest en modo watch
```

### Backend (NestJS + MySQL) — desde `03_Desarrollo/backend/`

```bash
cd 03_Desarrollo/backend
npm install
cp .env.example .env       # editar credenciales MySQL + JWT_SECRET
# crear la BD una vez:  CREATE DATABASE lure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
npm run start:dev          # API en http://localhost:3000/api (hot reload)
npm run build              # Compila a dist/ (nest build)
npm test                   # Jest — tests unitarios (sin BD)
npm run test:e2e           # Jest e2e — flujo auth con SQLite en memoria (sin MySQL)
```

> **Tests**: backend con Jest (unit + e2e sobre SQLite en memoria), frontend con Vitest +
> React Testing Library. El e2e de auth **no requiere MySQL**. No usar `dotnet`.
> Para `start:dev`/producción el backend necesita **MySQL corriendo** + base de datos `lure`
> (las tablas las crea TypeORM solo con `DB_SYNCHRONIZE=true` en desarrollo).

---

## Workflows

### Crear/Modificar Endpoint API

Cuando crees o modifiques endpoints:

1. **Planificar** - Proponer cambios (método, ruta, payload) antes de implementar
2. **Confirmar** - Esperar aprobación del usuario
3. **Implementar** - Crear/modificar Controller, Service, Repository
4. **Documentar** - Actualizar archivo .http o Swagger
5. **Probar** - Ejecutar tests relacionados

### Nueva Funcionalidad

1. Ejecutar `/nuevo-evolutivo --spec "descripción"`
2. Crear spec en `_duran/specs/`
3. Implementar siguiendo la arquitectura existente
4. Añadir tests unitarios
5. Actualizar `_duran/FUNCIONALIDADES.md`
6. Ejecutar `/finalizar-evolutivo`

### Bug Fix

1. Identificar el archivo y línea del problema
2. Verificar si hay tests existentes
3. Crear test que reproduzca el bug
4. Implementar la corrección
5. Verificar que el test pasa
6. Actualizar `_duran/HISTORIAL_CAMBIOS.md`

### Pre-Commit

1. Ejecutar `/revision` para análisis de impacto
2. Verificar que todos los tests pasen
3. Ejecutar `/commit` para mensaje estructurado

---

## Orquestacion del Trabajo

> Principios que Claude debe seguir para organizar su trabajo de forma efectiva.

### Planificacion

- **Proponer antes de implementar** - En cambios no triviales, presentar un plan breve (archivos afectados, enfoque) y esperar confirmacion antes de escribir codigo.
- **Descomponer tareas grandes** - Dividir en pasos claros y ejecutar uno a uno, verificando cada paso antes de continuar.
- **Identificar dependencias** - Antes de empezar, revisar `_duran/DEPENDENCIAS.md` y la matriz de impacto para anticipar efectos colaterales.
- **Replanificar si falla** - Si un enfoque falla tras 2 intentos, detenerse y replantear la estrategia antes de seguir forzando.

### Verificacion

- **Compilar tras cada cambio significativo** - No acumular cambios sin verificar que el proyecto compila. Ejecutar `dotnet build` como checkpoint.
- **Revisar antes de entregar** - Releer el codigo generado con ojo critico antes de presentarlo. Buscar errores de sintaxis, imports faltantes, nombres inconsistentes.
- **Tests como validacion** - Ejecutar tests existentes despues de modificar codigo. Si no hay tests, proponer crearlos.
- **Comparar con main** - En refactors o cambios complejos, comparar el diff contra la rama principal para verificar que no se pierde comportamiento.

### Autonomia y Correccion

- **Corregir errores sin preguntar** - Si un build falla por un error evidente (typo, import faltante, parentesis), corregirlo directamente. Solo preguntar cuando la correccion implique una decision de diseno.
- **Documentar lo inesperado** - Si algo no funciona como se esperaba, documentarlo en `_duran/LECCIONES.md` para futuras sesiones.
- **Arreglar CI sin que te lo pidan** - Si los tests de CI fallan tras un cambio, identificar la causa y corregirla directamente.

### Elegancia y Simplicidad

- **Solucion minima viable** - Implementar lo que se pide, no mas. Evitar over-engineering, abstracciones prematuras o features no solicitados.
- **Codigo legible sobre codigo ingenioso** - Preferir claridad. Un bloque de 5 lineas claras es mejor que una linea críptica de LINQ encadenado.
- **Respetar patrones existentes** - Antes de crear algo nuevo, buscar como se ha resuelto algo similar en el proyecto. Mantener consistencia.

### Lecciones Aprendidas

- **Consultar `_duran/LECCIONES.md`** al inicio de cada sesion para evitar repetir errores conocidos.
- **Actualizar con `/sesion`** al final de cada sesion si se descubrio un patron util, se corrigio un error no trivial o se identifico una particularidad del proyecto.

---

## Estándares de Código

### C# / .NET

- **Indentación:** 4 espacios
- **Clases/Métodos:** `PascalCase`
- **Campos privados:** `_camelCase`
- **Variables locales:** `camelCase`
- **Interfaces:** `IPrefijo` (ej: `IUserService`)
- **Async:** Sufijo `Async` en métodos async
- **Comentarios:** XML docs en clases y métodos públicos

### Tests

- **Clase:** `<ClaseTesteada>Tests`
- **Método:** `<Método>_<Condición>_<ResultadoEsperado>`
- **Patrón:** Arrange, Act, Assert (comentar cada sección)

### Commits

- **Formato:** Conventional Commits
- **Tipos:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **Scope:** Nombre del módulo afectado

---

## Arquitectura

### Estructura de Carpetas (raíz = plantilla STIC; código real en `03_Desarrollo/`)

```
TFG-DAW/
├── CLAUDE.md, README.md       ← Plantilla STIC.IA (este archivo y docs base)
├── _duran/ _atlas/ .claude/   ← Ecosistema STIC.IA (memoria, conocimiento, comandos/reglas)
├── Documentos_Base/ 0X_*/     ← Carpetas de gestión/diseño/pruebas/CICD/doc del estándar STIC
└── 03_Desarrollo/             ← ⭐ CÓDIGO REAL (full-stack)
    ├── frontend/              # SPA React + Vite (JavaScript)
    │   ├── package.json vite.config.js eslint.config.js index.html
    │   ├── public/           # assets servidos en raíz (logo.svg = favicon)
    │   └── src/
    │       ├── main.jsx           # Bootstrap: <Router> + <AuthProvider> + <AppRouter>
    │       ├── router/router.jsx  # Rutas v6 + <ProtectedRoute> (/profilePage protegida)
    │       ├── App.jsx            # Home: grid de tarjetas (datos + .map), expansión al click
    │       ├── pages/             # login, register, profile, forgotpass, TarjetaMain
    │       ├── components/        # CardPadre, CardPadre2, CardMultimedia, Carrousel, MicroPerfil, boton
    │       ├── context/AuthContext.jsx  # sesión global (token JWT + user en localStorage)
    │       ├── services/api.js          # cliente fetch a la API (VITE_API_URL)
    │       └── assets/                  # iconos SVG e imágenes (WebP optimizadas)
    └── backend/              # API REST NestJS + TypeORM + MySQL (TypeScript)
        ├── .env(.example)    # config DB + JWT (.env gitignored)
        └── src/
            ├── main.ts             # prefijo /api, CORS, ValidationPipe
            ├── app.module.ts       # ConfigModule + TypeOrm(MySQL) + Users + Auth
            ├── users/              # User entity + service (tabla users)
            └── auth/               # register/login/me, bcrypt, JWT, Passport
```

### Arquitectura del frontend

- **SPA con React Router v6**: `main.jsx` → `BrowserRouter` + `AuthProvider` + `AppRouter`.
  `App.jsx` es la ruta `/` (home con feed de tarjetas). `/profilePage` está protegida con `<ProtectedRoute>`.
- **Componentes**: una carpeta por componente con `.jsx` + `.css` co-localizados (CSS plano, no Modules).
  Patrón funcional con props + `useState`; datos en arrays + `.map()` (ver `App.jsx`).
- **Una sola librería UI: Ant Design** (`antd` + `@ant-design/icons`) + **lucide-react** para iconos.
  (Se eliminaron NextUI, Bootstrap, Tailwind, Framer Motion, Font Awesome: no se usaban.)
- **Autenticación real**: `AuthContext` expone `login`/`register`/`logout`/`isAuthenticated`;
  `services/api.js` llama a la API NestJS y guarda el **JWT** + user en `localStorage`.
- **Carga de imágenes**: importar siempre como módulos ES (`import x from '../assets/...'`),
  nunca como string `"src/assets/..."` (rompe en `build`). Assets de `public/` → ruta absoluta (`/logo.svg`).

### Arquitectura del backend

- **NestJS modular**: `AuthModule` (controlador + servicio + estrategia JWT) usa `UsersModule`.
  TypeORM con MySQL; `synchronize` solo en desarrollo. Config por `.env` vía `@nestjs/config`.
- **Auth**: contraseñas con **bcrypt**, **JWT** firmado (`JWT_SECRET`), validación con `class-validator`.
  Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protegido).
- Ver `03_Desarrollo/backend/README.md` para puesta en marcha y ejemplos `curl`.

---

## Integraciones MCP (Model Context Protocol)

### Servidores Configurados

| Servidor | Scope | Uso |
|----------|-------|-----|
| **context7** | user | Documentación actualizada de 1000+ librerías y frameworks |

### Context7 - Documentación Actualizada (Uso Automatico)

Context7 proporciona documentación en tiempo real desde repositorios oficiales, eliminando alucinaciones y código desactualizado.

**INSTRUCCION PARA CLAUDE**: Cuando trabajes con librerias externas (.NET, NuGet, Azure SDK, JavaScript, etc.) y necesites consultar documentacion actualizada, usa **automaticamente** las herramientas de Context7 (`resolve-library-id` + `get-library-docs`) sin esperar a que el usuario lo pida. Esto incluye:
- Implementar codigo que use librerias de terceros
- Resolver dudas sobre APIs o patrones de una libreria
- Verificar sintaxis o versiones actualizadas de paquetes NuGet
- Configurar servicios de Azure, middleware, o frameworks

```
Ejemplos de uso automatico por Claude:
- Al implementar Entity Framework Core → consultar docs EF Core 10
- Al configurar Azure Key Vault → consultar docs Azure.Identity
- Al escribir tests → consultar docs xUnit/FluentAssertions
```

**Servidor**: `https://contex7.comillas.edu/mcp` (interno Comillas, requiere intranet o VPN)

**Configuración** (ya instalado automáticamente por arranque.ps1):
```
claude mcp add --transport http --scope user context7 https://contex7.comillas.edu/mcp
```

### Instrucciones MCP

- Usar **Context7** siempre que necesites consultar documentación de librerías externas
- Preferir comandos nativos de Git sobre MCP para commits
- Documentar cualquier servidor MCP adicional configurado en el proyecto

### Hub STIC.IA — Convenciones de configuración (ADR-037 + ADR-038)

> **CRÍTICO**: estas convenciones evitan bugs de privacidad y duplicación de identidad. Aplican a cualquier edición que toque `_duran/ESTADO_PROYECTO.json.mcpSync` o `_duran/.mcp-credentials.json`.

**Dos fuentes de verdad separadas, NO mezclar**:

| Archivo | Scope | Commiteable | Contiene |
|---|---|---|---|
| `_duran/.mcp-project.json` | **per-PROYECTO** | ✅ sí | `projectId`, `serverUrl` — para que otros devs se unan via `/v2/join` al clonar |
| `_duran/ESTADO_PROYECTO.json.mcpSync` | **per-PROYECTO** | ✅ sí | `habilitado`, `categorias`, `projectId` (duplicado), `ultimaSync` |
| `_duran/.mcp-credentials.json` | **per-DEV** | ❌ no (gitignored) | `apiKey`, `devAlias`, `devEmail`, `telemetryOptIn` |

**Reglas absolutas**:

1. **NUNCA añadir `telemetryOptIn` en `ESTADO_PROYECTO.json.mcpSync`**. Es per-dev (cada dev decide individualmente con `/mcp-register`). Vive solo en `.mcp-credentials.json` (local) y `mcp.ProyectoDevs.TelemetryOptIn` (hub). Ponerlo en el JSON commiteable significa que un dev cambiaría el opt-in de todo el equipo sin consentimiento.

2. **NUNCA añadir `apiKey` o `devAlias` en `ESTADO_PROYECTO.json`**. Es per-dev. Si aparece, eliminarlo.

3. **`habilitado` lo activa `arranque.ps1` automáticamente** al ejecutar `irm | iex`. No hace falta tocarlo manualmente.

4. **Para cambiar opt-in de telemetría**: usar `/mcp-register` (privacy notice + 3 opciones). Esto actualiza `.mcp-credentials.json` local + POST `/v2/opt-in` al hub. Nunca editar `ESTADO_PROYECTO.json` para esto.

5. **Para "right to be forgotten"**: usar `/mcp-forget` (proyecto entero) o `/v2/leave` API (solo el dev). Nunca borrar `.mcp-credentials.json` manualmente sin desregistrar primero.

> Si encuentras `telemetryOptIn` en `ESTADO_PROYECTO.json.mcpSync`, **elimínalo** (es residual de versiones <v3.9.0).

### `/mcp-register` — ¿cuándo es necesario?

**Casi nunca**. `arranque.ps1` ya hace silent register automático al ejecutar `irm | iex`. Esto basta para:

- ✅ Sincronizar contenido al hub con `/mcp-sync` (decisiones, lecciones, nugets, evolutivos, equipo, branching, feedback ecosistema)
- ✅ Aparecer en el dashboard tab "Equipo" como dev registrado
- ✅ Heartbeat semanal (proyecto vivo)

**Solo ejecuta `/mcp-register` si quieres**:

- 🔔 Activar **telemetría de agents** (qué agent invocas cuándo) — opt-in explícito con privacy notice
- 🔔 Cambiar `telemetryOptIn` de `false` → `true` (o revocar opt-in)

Si solo vas a usar `/mcp-sync` para mantener decisiones/lecciones en el hub, **no necesitas `/mcp-register`**.

### Flujo típico para el primer dev del repo

```
1. cd MiProyecto/
2. irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex
   → registra proyecto en hub + crea .mcp-project.json (commiteable) +
     .mcp-credentials.json (gitignored) + habilita mcpSync.habilitado=true
3. claude
4. /mcp-sync       ← sincroniza decisiones/lecciones/F3 al hub
5. (opcional) /mcp-register   ← solo si quieres telemetría de agents
```

### Flujo para 2º dev (clona un repo donde otro ya hizo silent-register)

```
1. git clone <repo>     ← .mcp-project.json viene commiteado
2. cd repo/
3. irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex
   → detecta .mcp-project.json → POST /v2/join con git config user.email →
     genera su propia apiKey + .mcp-credentials.json local
4. claude
5. /mcp-sync       ← sincroniza con devAlias propio (no el del primer dev)
```

---

## Reglas del Proyecto

### Seguridad (CRÍTICO)

- ❌ NUNCA hardcodear passwords, API keys o secrets
- ❌ NUNCA exponer connection strings con credenciales
- ✅ SIEMPRE usar Azure Key Vault para secretos
- ✅ SIEMPRE usar `customErrors mode="On"` en producción

### Infraestructura

- ❌ NUNCA guardar archivos en disco local (infraestructura balanceada)
- ✅ SIEMPRE usar Azure Blob Storage para archivos
- ✅ SIEMPRE usar Redis para caché distribuida

### Código

- ❌ NUNCA dejar catch vacíos o genéricos sin logging
- ❌ NUNCA usar `Console.WriteLine` en producción
- ✅ SIEMPRE manejar excepciones específicas
- ✅ SIEMPRE incluir tests para código nuevo

---

## Comandos Personalizados

| Comando | Descripción |
|---------|-------------|
| `/init` | Analizar proyecto y mejorar este archivo |
| `/onboarding` | Configuración guiada en 8 fases |
| `/analizar` | Análisis profundo con diagramas |
| `/analisis-arquitectura` | Auditoría arquitectónica formal (MD + HTML) |
| `/nuevo-evolutivo` | Iniciar nueva funcionalidad |
| `/commit` | Commit con mensaje estructurado |
| `/test` | Generar tests unitarios |
| `/estado` | Dashboard del proyecto |
| `/actualizar` | Actualizar paquete STIC |
| `/sos` | Ayuda y comandos disponibles |
| `/health-check` | Configurar health checks (/health, /ready, /live) |
| `/add-telemetry` | Configurar OpenTelemetry + Serilog + App Insights |
| `/add-resilience` | Configurar Polly policies en HttpClients |
| `/mcp-sync` | Sincronizar documentacion con hub MCP STIC |
| `/optimizar` | Diagnostico de contexto + recomendacion de compactacion |
| `/devops-sync` | Sincronizar con Azure DevOps: work items, wiki, boards (DRY-RUN) |

---

## Contexto Adicional

### Sistema DURAN

- `_duran/ESTADO_PROYECTO.json` - Configuración y estado actual
- `_duran/DEPENDENCIAS.md` - Stack tecnológico y NuGets
- `_duran/FUNCIONALIDADES.md` - Módulos y features
- `_duran/DEUDA_TECNICA.md` - Issues conocidos
- `_duran/DECISIONES.md` - ADRs (Architecture Decision Records)
- `_duran/LECCIONES.md` - Patrones, errores y particularidades aprendidas
- `_duran/FEEDBACK_ECOSISTEMA.md` - Gaps/bugs del ECOSISTEMA STIC.IA detectados en este proyecto (FB-XXX, se suben al hub via /mcp-sync)
- `_duran/HISTORIAL_CAMBIOS.md` - Changelog

### Documentos Base STIC

- `Documentos_Base/01_Estructura_Tecnica/` - Stack y arquitectura
- `Documentos_Base/02_Diseño_Usabilidad/` - Guía de estilos UI
- `Documentos_Base/03_Consideraciones_Comunes/` - RGPD, normativa
- `Documentos_Base/06_Observabilidad/` - OpenTelemetry, Serilog, métricas
- `Documentos_Base/07_Resiliencia/` - Polly v8+, Health Checks, graceful shutdown

---

## Notas para Claude

1. **Leer contexto primero** - Antes de modificar, leer `_duran/` para entender el estado
2. **Preguntar si hay dudas** - Especialmente sobre integraciones y dependencias
3. **Actualizar documentación** - Mantener `_duran/` sincronizado con cambios
4. **Seguir patrones existentes** - Analizar código existente antes de crear nuevo
5. **Tests obligatorios** - Todo código nuevo debe tener tests
6. **Consultar lecciones** - Revisar `_duran/LECCIONES.md` para evitar errores conocidos y aplicar patrones del proyecto
7. **JSONs DURAN desde PowerShell** - Si generas un script/hook PS que escriba `_duran/*.json`, usa `Write-DuranJson` de `.claude/hooks/hook-helpers.ps1` (serializador unico FB-004: UTF-8 sin BOM + re-validacion). NUNCA `Out-File`/`Set-Content -Encoding UTF8` (PS 5.1 mete BOM)

---

*Archivo generado por STIC.IA v3.13.0 - Ejecuta /init para personalizar*
