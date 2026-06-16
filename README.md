# Plantilla de Proyecto STIC

Plantilla estándar para proyectos del Servicio de Tecnologías de la Información y Comunicación (STIC) - Universidad Pontificia Comillas.

Esta plantilla está **autocontextualizada**: contiene toda la información necesaria para que Claude Code entienda el proyecto y asista en el desarrollo.

---

## 🚀 Instalación Rápida

### Proyecto Existente (Recomendado)

```powershell
# 1. Ir a la carpeta del proyecto
cd C:\MiProyecto

# 2. Instalar paquete STIC
irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex

# 3. Abrir Claude Code y ejecutar onboarding
claude
/onboarding

# 4. Integrar en Visual Studio (automático o manual)
.\.claude\commands\integracion-vs.ps1

# 5. Abrir Visual Studio para ver las carpetas
```

### Proyecto Nuevo

```powershell
# 1. Crear carpeta y descargar plantilla
mkdir C:\MiNuevoProyecto
cd C:\MiNuevoProyecto
irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex

# 2. Crear proyecto .NET en 03_Desarrollo/
dotnet new sln -n MiProyecto -o 03_Desarrollo
# ... crear proyectos

# 3. Abrir Claude Code y ejecutar onboarding
claude
/onboarding
```

---

## Flujo Completo de Instalación

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: arranque.ps1                                            │
│ Descarga y extrae la plantilla técnica                          │
│ → Crea carpetas 00-07, .claude/commands, _duran              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: /onboarding (8 fases de preguntas)                      │
│ Claude Code pregunta sobre el proyecto                          │
│ → Crea ESTADO_PROYECTO.json, FUNCIONALIDADES.md, etc.           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: integracion-vs.ps1 (automático o manual)                │
│ Añade Solution Folders al archivo .sln                          │
│ → 8 carpetas visibles en Visual Studio                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 4: Abrir Visual Studio                                     │
│ Ver la estructura completa del proyecto                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
Proyecto/
│
├── CLAUDE.md                ← Memoria del proyecto (generado por /init)
├── README.md                # Este archivo
├── INICIO_RAPIDO.md         # Guía de inicio en 30 minutos
│
├── .claude/                 ← Configuración Claude Code
│   ├── commands/            # Comandos personalizados (/analizar, /commit, etc.)
│   │   └── integracion-vs.ps1  # Script para integrar en Visual Studio
│   ├── rules/               # Reglas condicionales por tipo de archivo
│   └── CLAUDE_BASE_COMILLAS.md  # Estándares STIC
│
├── _duran/               ← Estado dinámico del proyecto
│   ├── ESTADO_PROYECTO.json # Configuración y estado
│   ├── DEPENDENCIAS.md      # Stack tecnológico
│   ├── FUNCIONALIDADES.md   # Módulos y features
│   ├── DEUDA_TECNICA.md     # Issues conocidos
│   └── HISTORIAL_CAMBIOS.md # Changelog
│
├── Documentos_Base/         # Referencias técnicas STIC
│   ├── 01_Estructura_Tecnica/
│   ├── 02_Diseño_Usabilidad/
│   └── 03_Consideraciones_Comunes/
│
├── 00_Gestion/              # Gestión del proyecto
│   ├── config_proyecto.json
│   ├── CHECKLIST_INICIO.md
│   ├── Requerimientos/
│   └── Reuniones/
│
├── 01_Diseño/               # Arquitectura y modelos de datos
│   ├── Arquitectura/
│   └── Modelos_Datos/
│
├── 02_Entorno/              # Configuración del entorno
│   ├── docker-compose.yml
│   ├── .env.example
│   └── Scripts/
│
├── 03_Desarrollo/           # Código fuente (.NET)
│
├── 04_Pruebas/              # Tests unitarios e integración
│
├── 05_CICD/                 # Pipelines e infraestructura
│
├── 06_Documentacion/        # Documentación del proyecto
│
└── 07_UAP/                  # Unidad de Atención Prioritaria (soporte)
```

---

## Integración en Visual Studio

Después del onboarding, el archivo `.sln` incluye **8 Solution Folders** que permiten ver toda la documentación desde Visual Studio:

| Carpeta VS | Contenido |
|------------|-----------|
| **Contexto Claude** | CLAUDE.md, ESTADO_PROYECTO.json, DEPENDENCIAS.md, etc. |
| **Especificaciones** | _duran/specs/*.md |
| **Diagramas** | 01_Diseno/Arquitectura/*.md |
| **Gestion** | 00_Gestion/*.md |
| **Pruebas** | 04_Pruebas/*.md |
| **CI-CD** | 05_CICD/*, azure-pipelines.yml |
| **Documentacion** | 06_Documentacion/*.md, README.md |
| **UAP** | 07_UAP/*.md |

Si las carpetas no aparecen, ejecutar manualmente:
```powershell
.\.claude\commands\integracion-vs.ps1
```

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | .NET / C# | 8+ LTS (soporta 4.x, 8, 9, 10) |
| Acceso a datos | Dapper (recomendado) | Última estable |
| Base de datos | SQL Server | 2017 (14.0) |
| Intercalación | SQL_Latin1_General_CP1250_CI_AS | - |
| Cloud | Azure | - |
| Caché | Redis | 7+ |
| Almacenamiento | Azure Blob Storage | - |
| Contenedores | Docker | - |

Ver detalles completos en: `Documentos_Base/01_Estructura_Tecnica/`

---

## Comandos Claude Code

| Comando | Descripción |
|---------|-------------|
| `/onboarding` | Configuración guiada en 8 fases + integración VS |
| `/analizar` | Análisis profundo del código |
| `/nuevo-evolutivo` | Iniciar nueva funcionalidad |
| `/commit` | Commit con mensaje estructurado |
| `/test` | Generar tests unitarios |
| `/estado` | Ver dashboard del proyecto |
| `/actualizar` | Actualizar paquete STIC |
| `/sos` | Ayuda y comandos disponibles |

---

## Documentos Base

La carpeta `Documentos_Base/` contiene las **referencias técnicas oficiales del STIC**:

| Documento | Contenido |
|-----------|-----------|
| **Estructura Técnica** | Stack, arquitectura, seguridad, infraestructura balanceada |
| **Diseño y Usabilidad** | Colores, tipografía, componentes UI, accesibilidad |
| **Consideraciones Comunes** | RGPD, normativa Comillas, integraciones, auditoría |

Estos documentos son la **fuente de verdad** para cualquier decisión técnica o de diseño.

---

## Herramientas IA

| Herramienta | Uso |
|-------------|-----|
| **Claude Code** | Análisis, diseño, arquitectura, revisión, documentación |
| **GitHub Copilot** | Autocompletado, generación de código en IDE |

### Flujo de trabajo

```
1. Análisis con Claude     → Diseñar solución
2. Implementación con Copilot → Escribir código
3. Revisión con Claude     → Detectar mejoras
4. Testing                 → Generar y ejecutar tests
5. Code Review Humano      → Aprobación final
```

---

## Reglas de Desarrollo

### Obligatorias

- Todo código IA pasa por **code review humano**
- Sin datos sensibles en prompts (usar placeholders)
- Azure Key Vault para **todos los secretos**
- Azure Blob Storage para **todos los archivos**
- Redis para **caché distribuida**
- Sin estado local (infraestructura balanceada)

### Buenas prácticas

Para buenas prácticas técnicas actualizadas, Claude consultará fuentes oficiales:
- docs.microsoft.com (.NET, Azure)
- OWASP (seguridad)
- learn.microsoft.com (patrones)

---

## Estrategia Git

```
main
├── develop
├── feature/*
├── bugfix/*
└── hotfix/*
```

---

## Actualización del Paquete

Para actualizar a la última versión del paquete STIC:

```powershell
# Desde PowerShell
irm https://demowww.comillas.edu/claude-stic/arranque.ps1 | iex

# O desde Claude Code
/actualizar
```

---

## Contacto

- **Dudas técnicas**: Líder Técnico del proyecto
- **Dudas de proceso**: JP asignado
- **Soporte STIC**: soporte.stic@comillas.edu

---

**Versión:** 2.2.0
**Fecha:** Enero 2026
**Responsable:** STIC - Universidad Pontificia Comillas
