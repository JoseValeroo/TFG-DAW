# Guía de Inicio Rápido

Esta guía te permite iniciar un nuevo proyecto en menos de 30 minutos.

---

## Opción A: Proyecto Existente (Recomendado)

### Paso 1: Instalar Paquete STIC (2 min)

```powershell
cd C:\MiProyectoExistente
irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex
```

El script `arranque.ps1`:
- Descarga la plantilla técnica STIC
- Crea la estructura de carpetas (00_Gestion, 01_Diseno, etc.)
- Instala los comandos de Claude Code (.claude/commands/)
- Instala el script de integración con Visual Studio

### Paso 2: Ejecutar Onboarding con Claude Code (10 min)

```bash
# Abrir Claude Code
claude

# Configuración guiada (8 fases de preguntas)
/onboarding
```

El onboarding pregunta sobre:
1. Información general (nombre, JP, LT, repositorio)
2. Stack tecnológico
3. Estructura del código
4. Base de datos
5. Integraciones
6. Funcionalidades
7. Tests y documentación
8. Equipo y problemas conocidos

Al finalizar, crea los archivos de contexto en `_duran/`.

### Paso 3: Integrar en Visual Studio (automático o manual)

Durante el onboarding, Claude Code intentará ejecutar automáticamente:
```powershell
.\.claude\commands\integracion-vs.ps1
```

Si no se ejecuta automáticamente, **ejecutar manualmente** desde PowerShell:
```powershell
# Desde la raíz del proyecto
.\.claude\commands\integracion-vs.ps1
```

### Paso 4: Abrir Visual Studio

Al abrir la solución, verás **8 Solution Folders** nuevos:

```
📁 Solución "MiProyecto"
├── 📂 Contexto Claude      ← CLAUDE.md, ESTADO_PROYECTO.json, etc.
├── 📂 Especificaciones     ← _duran/specs/
├── 📂 Diagramas            ← 01_Diseno/Arquitectura/
├── 📂 Gestion              ← 00_Gestion/
├── 📂 Pruebas              ← 04_Pruebas/
├── 📂 CI-CD                ← 05_CICD/
├── 📂 Documentacion        ← 06_Documentacion/
├── 📂 UAP                  ← 07_UAP/
└── 📦 MiProyecto.WebApi    (proyectos .NET)
```

### Paso 5: Análisis profundo (opcional)

```bash
/analizar
```

---

## Opción B: Proyecto Nuevo

### Paso 1: Crear carpeta y descargar plantilla (2 min)

```powershell
mkdir C:\MiNuevoProyecto
cd C:\MiNuevoProyecto
irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex
```

### Paso 2: Crear proyecto .NET (3 min)

```powershell
cd 03_Desarrollo

# Crear solución
dotnet new sln -n MiProyecto

# Crear proyectos (Clean Architecture)
dotnet new webapi -n MiProyecto.API
dotnet new classlib -n MiProyecto.Application
dotnet new classlib -n MiProyecto.Domain
dotnet new classlib -n MiProyecto.Infrastructure
dotnet new xunit -n MiProyecto.Tests

# Agregar a solución
dotnet sln add **/*.csproj

# Referencias entre proyectos
dotnet add MiProyecto.API reference MiProyecto.Application
dotnet add MiProyecto.Application reference MiProyecto.Domain
dotnet add MiProyecto.Infrastructure reference MiProyecto.Domain
dotnet add MiProyecto.Tests reference MiProyecto.API
```

### Paso 3: Onboarding + Integración VS

```bash
# Abrir Claude Code
claude

# Configuración guiada
/onboarding

# Si no se integró automáticamente en VS:
# Ejecutar en PowerShell desde la raíz:
# .\.claude\commands\integracion-vs.ps1
```

---

## Flujo Visual Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE INSTALACIÓN                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ arranque.ps1│ ──► │ /onboarding │ ──► │integracion- │ ──► │   Visual    │
│             │     │  (8 fases)  │     │   vs.ps1    │     │   Studio    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
   Estructura         Archivos           8 Solution          Proyecto
   de carpetas        _duran/          Folders            completo
```

---

## Configuración del Proyecto

**Editar:** `00_Gestion/config_proyecto.json`

```json
{
  "proyecto": {
    "nombre": "MiSistemaInventario",
    "version": "1.0.0",
    "descripcion": "Sistema de gestión de inventario",
    "fecha_inicio": "2026-01-20",
    "cliente": "Empresa XYZ"
  },
  "equipo": {
    "jefe_proyecto": "Juan Pérez",
    "lider_tecnico": "Ana García",
    "desarrolladores": ["María García", "Carlos López"]
  }
}
```

---

## Configurar Entorno Docker (5 min)

Revisar y ajustar: `02_Entorno/docker-compose.yml`

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2017-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=${SA_PASSWORD}
      - MSSQL_COLLATION=SQL_Latin1_General_CP1250_CI_AS
    ports:
      - "1433:1433"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  azurite:
    image: mcr.microsoft.com/azure-storage/azurite
    ports:
      - "10000:10000"
      - "10001:10001"
```

Copiar `.env.example` a `.env` y configurar passwords.

---

## Checklist de Validación

Antes de empezar el desarrollo, verificar:

- [ ] Paquete STIC instalado (`arranque.ps1`)
- [ ] Onboarding completado (`/onboarding`)
- [ ] Integration VS ejecutada (`integracion-vs.ps1`)
- [ ] 8 carpetas visibles en Visual Studio
- [ ] Análisis ejecutado (`/analizar`)
- [ ] Requerimientos documentados
- [ ] Arquitectura diseñada
- [ ] Proyecto .NET compilando
- [ ] Docker funcionando
- [ ] Git inicializado y primer commit
- [ ] Equipo informado

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `/onboarding` | Configuración guiada 8 fases + integración VS |
| `/analizar` | Análisis profundo del código |
| `/nuevo-evolutivo` | Iniciar nueva funcionalidad |
| `/commit` | Commit con mensaje estructurado |
| `/estado` | Ver dashboard del proyecto |
| `/actualizar` | Actualizar paquete STIC |
| `/sos` | Ayuda y comandos disponibles |

---

## Solución de Problemas

### Las carpetas no aparecen en Visual Studio

```powershell
# Ejecutar manualmente desde la raíz del proyecto:
.\.claude\commands\integracion-vs.ps1

# Si hay carpetas duplicadas, usar -Force:
.\.claude\commands\integracion-vs.ps1 -Force
```

### El onboarding no creó los archivos

Verificar que existan:
- `_duran/ESTADO_PROYECTO.json`
- `_duran/FUNCIONALIDADES.md`
- `_duran/DEPENDENCIAS.md`
- `_duran/DEUDA_TECNICA.md`

Si faltan, ejecutar `/onboarding` de nuevo.

### Restaurar .sln desde backup

```powershell
cd 03_Desarrollo
Copy-Item "MiProyecto.sln.bak" "MiProyecto.sln" -Force
```

---

## Siguientes Pasos

1. Continuar desarrollo en `03_Desarrollo/`
2. Crear tests en `04_Pruebas/`
3. Configurar pipelines en `05_CICD/`
4. Documentar API en `06_Documentacion/`
5. Configurar soporte en `07_UAP/`

---

## Ayuda

- **Estructura del proyecto**: Ver `README.md`
- **Reglas técnicas STIC**: Ver `Documentos_Base/`
- **Comandos Claude Code**: `/sos`
- **Problemas técnicos**: Consultar documentación oficial de Microsoft

---

**Versión:** 2.2.0
**Fecha:** Enero 2026
**Responsable:** STIC - Universidad Pontificia Comillas
