# Sistema de Contexto Inteligente para Claude Code

> Este documento explica como funciona el sistema de contexto de la plantilla OTD
> y como Claude navega por ella segun cada situacion del proyecto.

---

## Resumen del Sistema

La plantilla OTD incluye un **sistema de contexto inteligente** que permite a Claude Code:

1. **Recordar** el estado del proyecto entre sesiones
2. **Entender** las funcionalidades, dependencias y decisiones existentes
3. **Preguntar proactivamente** para evitar errores
4. **Ejecutar comandos estandarizados** para tareas comunes

---

## Arquitectura del Sistema

```
CLAUDE.md                    ← Punto de entrada (se lee automaticamente)
    │
    ├── _duran/           ← Memoria dinamica del proyecto
    │   ├── ESTADO_PROYECTO.json   ← Estado actual, fase, modo
    │   ├── FUNCIONALIDADES.md     ← Que hace la aplicacion
    │   ├── DEPENDENCIAS.md        ← Que puede romperse
    │   ├── DECISIONES.md          ← Por que se hizo asi
    │   ├── HISTORIAL_CAMBIOS.md   ← Changelog
    │   └── reuniones/             ← Acuerdos de reuniones
    │
    ├── .claude/commands/    ← Comandos personalizados
    │   ├── onboarding.md    ← /onboarding
    │   ├── commit.md        ← /commit
    │   ├── prepara-entrega.md ← /prepara-entrega
    │   ├── revision.md      ← /revision
    │   ├── estado.md        ← /estado
    │   └── sync.md          ← /sync
    │
    └── Documentos_Base/     ← Reglas estaticas OTD
        ├── 01_Estructura_Tecnica/
        ├── 02_Diseno_Usabilidad/
        ├── 03_Consideraciones_Comunes/
        └── 04_Plantillas_Documentacion/
```

---

## Modos de Operacion

El sistema tiene 4 modos principales definidos en `ESTADO_PROYECTO.json`:

### 1. Modo: `puesta_a_punto`

**Cuando**: Proyecto existente recien incorporado a la plantilla

**Comportamiento de Claude**:
```
1. Detecta modo "puesta_a_punto" en ESTADO_PROYECTO.json
2. NO realiza cambios de codigo
3. Invita a ejecutar /onboarding
4. Hace bateria de preguntas para contextualizar
5. Documenta en _duran/
6. Al completar, cambia a modo "desarrollo"
```

**Flujo**:
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Proyecto nuevo  │ ──► │ /onboarding  │ ──► │ Modo desarrollo │
│ (puesta_a_punto)│     │ (preguntas)  │     │ (listo para     │
│                 │     │              │     │  trabajar)      │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

### 2. Modo: `desarrollo`

**Cuando**: Desarrollo activo del proyecto

**Comportamiento de Claude**:
```
1. Lee contexto completo al iniciar
2. Hace preguntas proactivas segun tipo de tarea
3. Verifica dependencias antes de modificar
4. Actualiza _duran/ con cambios importantes
5. Usa comandos para operaciones estandar
```

**Preguntas proactivas**:

| Situacion | Claude pregunta |
|-----------|-----------------|
| Nueva funcionalidad | "¿En que modulo va? ¿Sigue patron existente?" |
| Modificacion | "He detectado dependencias con [X]. ¿Reviso impacto?" |
| Bug fix | "¿Pasos para reproducir? ¿Severidad?" |
| Antes de codigo | "¿Entiendo bien el requisito?" |

### 3. Modo: `mantenimiento`

**Cuando**: Proyecto estable, solo correcciones menores

**Comportamiento de Claude**:
```
1. Modo conservador: cambios minimos
2. Enfasis en no romper funcionalidad existente
3. Siempre verifica tests antes de cambios
4. Documenta todo cambio en HISTORIAL_CAMBIOS.md
```

### 4. Modo: `soporte_uap`

**Cuando**: Proyecto en produccion atendido por UAP

**Comportamiento de Claude**:
```
1. Consulta runbooks antes de actuar
2. Prioriza resolucion rapida
3. Documenta incidencia segun plantilla
4. Notifica sobre impacto en SLAs
```

---

## Flujo de Navegacion de Claude

### Al Iniciar Sesion

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code inicia                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Lee CLAUDE.md automaticamente                               │
│ → Carga instrucciones generales                            │
│ → Conoce comandos disponibles                              │
│ → Sabe que archivos leer                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Lee _duran/ESTADO_PROYECTO.json                          │
│ → Identifica modo actual                                   │
│ → Conoce fase, version, alertas                            │
│ → Sabe que modulos estan en desarrollo                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        [puesta_a_punto] [desarrollo]   [mantenimiento]
              │               │               │
              ▼               ▼               ▼
        Invita a         Lee contexto    Modo
        /onboarding      completo        conservador
```

### Antes de Cada Tarea de Desarrollo

```
┌─────────────────────────────────────────────────────────────┐
│ Desarrollador describe tarea                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude identifica tipo de tarea                             │
│ → Nueva funcionalidad?                                      │
│ → Modificacion?                                            │
│ → Bug fix?                                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude consulta contexto relevante                          │
│                                                             │
│ SI es modificacion:                                        │
│   → Lee FUNCIONALIDADES.md (funcionalidad afectada)        │
│   → Lee DEPENDENCIAS.md (que puede romperse)               │
│   → Busca reuniones recientes                              │
│                                                             │
│ SI afecta arquitectura:                                    │
│   → Lee DECISIONES.md (ADRs relevantes)                    │
│   → Verifica con Documentos_Base/                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude hace preguntas proactivas                            │
│                                                             │
│ "He detectado que [X] tiene dependencias con [Y,Z]."       │
│ "¿Quieres que analice el impacto antes de empezar?"        │
│                                                             │
│ "Veo que hay una reunion reciente del [fecha]."            │
│ "¿Debo revisar los acuerdos?"                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude implementa siguiendo:                                │
│ → Reglas de Documentos_Base/                               │
│ → Patrones existentes en el codigo                         │
│ → Decisiones previas (ADRs)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Comandos Disponibles

### /onboarding
**Proposito**: Contextualizar proyecto existente
**Cuando usar**: Al incorporar proyecto a la plantilla
**Que hace**:
- Hace bateria de preguntas sobre el proyecto
- Documenta en _duran/
- Cambia modo a "desarrollo" al completar

### /commit
**Proposito**: Commit con verificaciones
**Cuando usar**: Antes de cada commit
**Que hace**:
- Verifica cobertura de tests >= 70%
- Verifica formato de codigo
- Verifica que no hay secretos
- Genera mensaje segun politica de commits
- Actualiza HISTORIAL_CAMBIOS.md

### /prepara-entrega
**Proposito**: Preparar version para entregar
**Cuando usar**: Antes de entregar al cliente/produccion
**Que hace**:
- Verifica todos los tests pasan
- Genera/actualiza documentacion
- Actualiza FUNCIONALIDADES.md
- Incrementa version
- Genera resumen de entrega

### /revision
**Proposito**: Analizar impacto de cambios
**Cuando usar**: Antes de modificar codigo critico
**Que hace**:
- Analiza archivos modificados
- Cruza con mapa de dependencias
- Identifica modulos afectados
- Sugiere tests a ejecutar

### /estado
**Proposito**: Ver estado actual del proyecto
**Cuando usar**: Para conocer situacion actual
**Que hace**:
- Muestra modo, fase, version
- Lista modulos en desarrollo
- Muestra alertas activas
- Resume metricas

### /sync
**Proposito**: Actualizar contexto del proyecto
**Cuando usar**: Despues de cambios importantes
**Que hace**:
- Analiza codigo actual
- Actualiza FUNCIONALIDADES.md
- Actualiza DEPENDENCIAS.md
- Sincroniza ESTADO_PROYECTO.json

---

## Preguntas por Situacion

### Nueva Funcionalidad

| Fase | Preguntas |
|------|-----------|
| Entendimiento | "¿Cual es el objetivo de negocio?" |
| | "¿Quien es el usuario final?" |
| | "¿Es parte de desarrollo mayor?" |
| Ubicacion | "¿En que modulo?" |
| | "¿Sigue patron existente?" |
| Datos | "¿Requiere nuevas tablas?" |
| | "¿Maneja datos sensibles?" |
| Seguridad | "¿Que roles tienen acceso?" |

### Modificacion de Existente

| Fase | Preguntas |
|------|-----------|
| Contexto | "¿Hay decisiones previas a respetar?" |
| | "¿Hubo problemas anteriores aqui?" |
| Impacto | "¿Quieres que analice dependencias?" |
| | "¿Hay tests existentes?" |
| Integraciones | "¿Afecta a sistemas externos?" |
| | "¿Hay procesos batch dependientes?" |

### Correccion de Bug

| Fase | Preguntas |
|------|-----------|
| Reproduccion | "¿Pasos para reproducir?" |
| | "¿En que entorno ocurre?" |
| Urgencia | "¿Severidad?" |
| | "¿Hay workaround?" |
| Origen | "¿Cuando empezo a fallar?" |
| | "¿Hubo cambios recientes?" |

---

## Archivos Clave y su Proposito

| Archivo | Claude lo lee | Para |
|---------|--------------|------|
| `CLAUDE.md` | Siempre (automatico) | Instrucciones generales |
| `ESTADO_PROYECTO.json` | Siempre | Saber modo, fase, version |
| `FUNCIONALIDADES.md` | Modificaciones | Entender que existe |
| `DEPENDENCIAS.md` | Modificaciones | Evitar romper cosas |
| `DECISIONES.md` | Arquitectura | Respetar decisiones |
| `HISTORIAL_CAMBIOS.md` | Entregas | Documentar cambios |
| `reuniones/` | Segun contexto | Acuerdos recientes |
| `Documentos_Base/` | Desarrollo | Reglas tecnicas |

---

## Actualizacion del Contexto

| Evento | Archivos actualizados | Comando |
|--------|----------------------|---------|
| Commit | HISTORIAL_CAMBIOS.md | /commit |
| Entrega | ESTADO_PROYECTO.json, FUNCIONALIDADES.md | /prepara-entrega |
| Cambio importante | FUNCIONALIDADES.md, DEPENDENCIAS.md | /sync |
| Decision tecnica | DECISIONES.md | Manual |
| Reunion | reuniones/YYYY-MM-DD.md | Manual |

---

## Diagrama de Flujo Completo

```
                    ┌──────────────────────┐
                    │   INICIO SESION      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Lee CLAUDE.md       │
                    │  Lee ESTADO_PROYECTO │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
   │ puesta_a_punto│   │  desarrollo   │   │ mantenimiento │
   └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
           │                   │                   │
           ▼                   │                   │
   ┌───────────────┐           │                   │
   │ /onboarding   │           │                   │
   │ (preguntas)   │           │                   │
   └───────┬───────┘           │                   │
           │                   │                   │
           └─────────┬─────────┘                   │
                     │                             │
                     ▼                             │
           ┌───────────────────┐                   │
           │ TAREA SOLICITADA  │◄──────────────────┘
           └─────────┬─────────┘
                     │
                     ▼
           ┌───────────────────┐
           │ Identificar tipo  │
           │ de tarea          │
           └─────────┬─────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Nueva   │    │ Modif.  │    │ Bug fix │
│ func.   │    │         │    │         │
└────┬────┘    └────┬────┘    └────┬────┘
     │              │              │
     │              ▼              │
     │    ┌─────────────────┐      │
     │    │ Lee FUNCIONAL.  │      │
     │    │ Lee DEPENDENC.  │      │
     │    │ Lee reuniones   │      │
     │    └────────┬────────┘      │
     │             │               │
     └──────┬──────┴───────────────┘
            │
            ▼
   ┌───────────────────┐
   │ PREGUNTAS         │
   │ PROACTIVAS        │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ IMPLEMENTACION    │
   │ (segun reglas)    │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ /commit           │
   │ (verificaciones)  │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ Actualiza         │
   │ HISTORIAL_CAMBIOS │
   └───────────────────┘
```

---

**Version**: 1.0
**Fecha**: Diciembre 2024
**Responsable**: Comite Tecnico OTD
