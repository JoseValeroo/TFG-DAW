# DURAN - Sistema de Memoria del Proyecto

> **DURAN** es el componente de memoria dinamica del ecosistema **STIC.IA**.
> Contiene el estado actual, historial y contexto especifico de **este** proyecto.

---

## Por que "DURAN"

DURAN toma su nombre del concepto de **memoria duradera**: la informacion que persiste entre sesiones,
usuarios y sprints. Mientras que el codigo cambia con cada commit, DURAN mantiene el **contexto vivo**
del proyecto: que se decidio, que se aprendio, quien trabajo en que, y que queda por hacer.

---

## Archivos

| Archivo | Proposito | Actualizado por |
|---------|-----------|-----------------|
| `ESTADO_PROYECTO.json` | Estado actual: fase, version, modo, equipo | `/sync`, `/prepara-entrega`, `/onboarding` |
| `SESION_ACTUAL.md` | Contexto entre sesiones de trabajo | `/sesion`, `/pausar` |
| `LECCIONES.md` | Patrones, errores y particularidades aprendidas | `/sesion` |
| `FUNCIONALIDADES.md` | Catalogo de funcionalidades del proyecto | Manual + `/sync` |
| `DEPENDENCIAS.md` | Mapa de dependencias y stack tecnologico | Manual + `/sync` |
| `DECISIONES.md` | Decisiones arquitectonicas (ADRs) | Manual |
| `HISTORIAL_CAMBIOS.md` | Changelog detallado | `/commit`, `/prepara-entrega` |
| `CONTEXTO_TECNICO.md` | Stack tecnologico auto-detectado | `/onboarding`, `/analizar` |
| `specs/` | Especificaciones de evolutivos | `/nuevo-evolutivo` |
| `reuniones/` | Actas de reuniones | Manual |

---

## Relacion con el Ecosistema STIC.IA

```
STIC.IA (ecosistema completo)
  |
  +-- DURAN (_duran/)        --> Memoria dinamica del proyecto (este componente)
  |     Estado, sesiones, lecciones, historial
  |
  +-- ATLAS (_atlas/)        --> Base de conocimiento estatica
  |     Indice de Documentos_Base, rules, patterns
  |
  +-- Comandos (.claude/)    --> 35 comandos + 12 skills + 10 reglas
  +-- Documentos_Base/       --> Estandares y guias STIC
```

---

## Como lo Usan los Comandos

| Comando | Lee de DURAN | Escribe en DURAN |
|---------|-------------|-----------------|
| `/estado` | ESTADO_PROYECTO.json, evolutivos | - |
| `/pausar` | evolutivoActivo | SESION_ACTUAL.md, ESTADO_PROYECTO.json |
| `/continuar` | SESION_ACTUAL.md, evolutivoActivo | ESTADO_PROYECTO.json |
| `/sesion` | SESION_ACTUAL.md | SESION_ACTUAL.md, LECCIONES.md |
| `/commit` | evolutivoActivo | HISTORIAL_CAMBIOS.md |
| `/nuevo-evolutivo` | ESTADO_PROYECTO.json | ESTADO_PROYECTO.json, specs/ |
| `/finalizar-evolutivo` | evolutivoActivo, specs/ | ESTADO_PROYECTO.json, HISTORIAL_CAMBIOS.md |
| `/sync` | FUNCIONALIDADES.md, DEPENDENCIAS.md | FUNCIONALIDADES.md, DEPENDENCIAS.md |
| `/onboarding` | ESTADO_PROYECTO.json | Todos los archivos |
| `/analizar` | DEPENDENCIAS.md | CONTEXTO_TECNICO.md |

---

## Flujo de Actualizacion

```
Desarrollo normal:
    /commit    --> Actualiza HISTORIAL_CAMBIOS.md
    /sesion    --> Actualiza SESION_ACTUAL.md + LECCIONES.md

Evolutivos:
    /nuevo-evolutivo      --> Crea spec en specs/, actualiza ESTADO_PROYECTO.json
    /pausar               --> Guarda contexto en SESION_ACTUAL.md
    /continuar            --> Lee contexto de SESION_ACTUAL.md
    /finalizar-evolutivo  --> Actualiza ESTADO_PROYECTO.json + HISTORIAL_CAMBIOS.md

Entrega:
    /prepara-entrega --> Actualiza ESTADO_PROYECTO.json, HISTORIAL_CAMBIOS.md

Cambios importantes:
    /sync --> Actualiza FUNCIONALIDADES.md, DEPENDENCIAS.md
```

---

## Importante

- **NO borrar** archivos de esta carpeta
- **NO ignorar** en .gitignore (debe estar versionado)
- **Mantener actualizado** para que Claude funcione correctamente
- Claude lee estos archivos automaticamente via `@imports` en CLAUDE.md

---

*Sistema DURAN - STIC.IA v3.7.0*
