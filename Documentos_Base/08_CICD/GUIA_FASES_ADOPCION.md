# Guia de adopcion CI/CD — Fases 0, 1 y 2

> **Audiencia**: desarrolladores + jefes de proyecto Comillas.
> **Propósito**: elegir el nivel correcto de CI/CD para tu proyecto **antes** de invocar `/cicd-init`.
> **Origen**: modelo de doble barrera STIC.IA local + Pipeline remoto (ver `analisis-integracion-cicd.html` en el portal docs).

---

## TL;DR — Cual elegir

| Fase | Estado del proyecto | Esfuerzo inicial | Lo que ganas | Lo que NO obtienes |
|---|---|---|---|---|
| **Fase 0** | Cero infraestructura TFS, deploy manual | 0 horas (solo STIC.IA local) | `/verify` 7 fases pre-push, recordatorios disciplina | Build remoto, CI verde/rojo, deploy automatico |
| **Fase 1** | Tienes acceso TFS + agentes LADYADA online | ~2 horas | Build validation branch policy, `dotnet build` + `dotnet test` en cada PR | Deploy automatico, rollback, gates manuales |
| **Fase 2** | Tienes BUILDERS + agentes `<ENV>_DEPLOY` + grupo aprobadores | ~6 horas | Pipeline completo Build → DEV (auto) → DEMO (gate manual) → PROD (gate environment, 2 servers rolling, triple rollback) | — (este es el techo) |

**Regla rapida**: empieza por la fase mas baja que **puedas mantener**. Subir de fase es facil; bajar duele.

---

## Fase 0 — Solo STIC.IA local

### Cuando aplica

- Proyecto nuevo o sin pipeline previa.
- Sistemas Comillas aun no ha autorizado BUILDERS al proyecto.
- Equipo pequeno (1 dev) sin necesidad de validacion remota.
- Deploys puntuales (cada varias semanas), no diarios.

### Que genera `/cicd-init` en Fase 0

1. **`RUNBOOK_DEPLOY_MANUAL.md`** adaptado al proyecto: RDP a server, copy DLLs, recycle app pool, smoke manual.
2. **Recordatorios pre-push** en `_duran/CLAUDE.md` (sección "Pre-commit"): obliga a ejecutar `/verify` antes de cada `git push`.
3. **Entrada en `_duran/ESTADO_PROYECTO.json.infraestructura.cicd[]`** con `{ fase: 0, ... }`.

### Que NO genera

- ❌ `azure-pipelines.yml` (no hay pipeline)
- ❌ Llamada a Hub MCP (`register_pipeline` omitida)
- ❌ Agentes ni grupos TFS

### Como promocionar a Fase 1

Cuando Sistemas autorize BUILDERS al proyecto + agente LADYADA disponible:

```
claude /cicd-init  # detecta Fase 0 + reescribe a Fase 1 (modo edicion FASE 0.5 idempotente)
```

---

## Fase 1 — Build validation branch policy

### Cuando aplica

- Tienes acceso TFS + BUILDERS autorizado.
- Agente LADYADA online (Sistemas confirma).
- Quieres **bloquear merges con build/tests rojos** pero el deploy sigue manual.
- Equipo de 2+ devs (PRs requieren protección).

### Que genera `/cicd-init` en Fase 1

1. **`azure-pipelines.yml` minimal**: stage unico `Build` con `dotnet restore`/`build`/`test` y `dotnet publish` → artefacto `drop`. Sin CD, sin Deployment Groups.
2. **Registro pipeline en TFS** vía `_apis/build/definitions` (FASE 2.5 del comando).
3. **Branch policy de build validation** sugerida (manual via TFS UI o `_apis/policy/configurations`).
4. **Registro en Hub MCP**: tool `register_pipeline` con `fase=1`.
5. **Entrada en `_duran/ESTADO_PROYECTO.json.infraestructura.cicd[]`** con `{ fase: 1, pipelineId, url, stages: ['Build'] }`.

### Que NO genera

- ❌ Stages DeployDev/Demo/Prod
- ❌ Variable Groups para secretos
- ❌ Backup/rollback automatico
- ❌ Runbook (deploy manual desde el artefacto)

### Como promocionar a Fase 2

Cuando Sistemas instale agentes `<ENV>_DEPLOY` con capability `DeployTarget=<env>` en cada server destino:

```
claude /cicd-init  # detecta Fase 1 + reescribe a Fase 2 anadiendo stages CD (modo edicion FASE 0.5)
```

---

## Fase 2 — Pipeline completo CD

### Cuando aplica

- Tienes Fase 1 funcionando estable >= 4 semanas.
- Sistemas confirma agentes online en DEV, DEMO y PROD (cada server con su agente `<SERVER>_DEPLOY`).
- Grupo TFS de aprobadores creado y poblado (≥2 miembros para PROD).
- Stack soportado: .NET ASP.NET Core (in-process) o Vue 3 + Vite + TS (SPA estatica).

### Que genera `/cicd-init` en Fase 2

1. **`azure-pipelines.yml` completo**: stages Build → DeployDev (auto) → DeployDemo (gate `ManualValidation@0`) → DeployProd (Environment + group approval + 2 servers rolling).
2. **Triple rollback PROD**: backup pre-deploy + `MSDeploy enableRule:DoNotDeleteRule` + `condition: failed()` step de restauracion.
3. **Variable Group `<PIPELINE_NAME>-secrets`** creado vía `_apis/distributedtask/variablegroups` con fail-fast pre-build (valida que los secretos tienen valor).
4. **Retention rules**: master 30d/5 builds, otras 7d/1 build.
5. **Coverage gate**: avisa (WARN-first) o bloquea si la cobertura de lineas/branches baja del umbral (mira summary; Mira 0.8.1 NO calcula CRAP).
6. **`RUNBOOK.md`** del proyecto: 6 secciones (build falla / deploy DEMO falla / deploy PROD falla / app caida tras deploy verde / contactos / backups), ≤1 pagina cada una.
7. **Registro Hub MCP**: tool `register_pipeline` con `fase=2`.

### Limitaciones a respetar

Antes de editar el YAML manualmente, **leer obligatoriamente** `LIMITACIONES_TFS_2020.md` (tablas A-F):

- ❌ NUNCA `Cache@2` (servicio Pipeline Caching no existe en TFS 2020)
- ❌ NUNCA `IISWebAppDeployment@1` (preview deprecada) → usar `IISWebAppDeploymentOnMachineGroup@0`
- ❌ NUNCA `deploymentGroup:` keyword (schema rechaza)
- ❌ NUNCA `DownloadBuildArtifacts@0` / `DownloadPipelineArtifact@2` (bug SSL Node.js contra `tfs.comillas.edu`) → usar REST API + PowerShell
- ❌ NUNCA TLS 1.0/1.1 en scripts PowerShell (PS 5.1 default es 1.0; forzar 1.2+)

---

## Tabla resumen — Que necesitas para cada fase

| Requisito | Fase 0 | Fase 1 | Fase 2 |
|---|---|---|---|
| `_duran/ESTADO_PROYECTO.json` configurado | ✅ | ✅ | ✅ |
| `/verify` ejecutado pre-push | ✅ recomendado | ✅ obligatorio | ✅ obligatorio |
| Acceso TFS (proyecto + repo) | ❌ no necesario | ✅ obligatorio | ✅ obligatorio |
| Pool BUILDERS autorizado al proyecto | ❌ | ✅ | ✅ |
| Agente LADYADA online | ❌ | ✅ | ✅ |
| Agente `<SERVER>_DEPLOY` por entorno | ❌ | ❌ | ✅ (uno por DEV/DEMO/PROD) |
| Grupo TFS aprobadores (>=2) | ❌ | ❌ | ✅ |
| Variable Group de secretos | ❌ | ❌ | ✅ (si hay secrets) |
| Health endpoints (`/health/live`, `/ready`) | opcional | opcional | recomendado (smoke estricto .NET) |

---

## Anti-patrones (lo que NO hacer)

- ❌ **Saltar de Fase 0 a Fase 2 directamente**: el modo edicion FASE 0.5 del comando lo permite, pero perderse la fase intermedia significa que el primer fallo PROD sera catastrofico (sin practica con Fase 1).
- ❌ **Pedir Fase 2 sin tener agentes `<ENV>_DEPLOY`**: el wizard lo detectara en FASE 0.4 pre-flight y abortara con mensaje claro.
- ❌ **Tratar Fase 0 como "no se hace CI/CD"**: Fase 0 SI es CI/CD — la primera barrera (STIC.IA local con `/verify` 7 fases) es lo que evita bugs reales en deploys manuales.
- ❌ **Editar `azure-pipelines.yml` ignorando R1-R24**: el agent `cicd-pipeline-reviewer` te avisara, pero la disciplina humana es mas barata.

---

## Cuando dudes

Sigue este arbol:

```
¿Tienes acceso TFS y BUILDERS autorizado?
├── NO  → Fase 0
└── SI  → ¿Tienes agentes <ENV>_DEPLOY online en todos los servers destino?
         ├── NO  → Fase 1
         └── SI  → ¿Existe grupo aprobadores TFS con ≥2 miembros?
                  ├── NO  → Fase 1 (y crear grupo en paralelo)
                  └── SI  → Fase 2
```

Si no estas seguro, **empieza por Fase 0** y promociona cuando este claro el siguiente paso. El comando `/cicd-init` es idempotente — re-invocarlo en modo edicion no rompe nada.

---

## Actualizar el pipeline tras nuevas versiones de STIC.IA

Hay **dos capas** y actualizar una NO actualiza la otra:

| Capa | Que es | Como se actualiza |
|---|---|---|
| **Plantilla STIC.IA** (`.claude/`) | Las *herramientas*: comandos, reglas, skill `cicd-architect`, agent `cicd-pipeline-reviewer`, hooks, templates | `irm https://demowww.comillas.edu/claude-stic/arranque.ps1 \| iex` |
| **Tu `azure-pipelines.yml`** | El *artefacto* generado: vive en tu repo y corre en TFS | `/cicd-init` (re-ejecutado) o edicion manual |

> **Clave**: `irm` actualiza las herramientas, pero **nunca toca tu YAML**. El pipeline es tuyo; las mejoras de reglas no se imponen sobre el sin que tu lo decidas.

### Comando vs skill vs agent — como invocar cada cosa

- **Comandos** (`/cicd-init`, `/cicd-status`, `/cicd-deploy`, `/cicd-release`): se escriben con `/`.
- **Skill `cicd-architect`**: auto-invocacion (se activa solo al editar `azure-pipelines.yml`).
- **Agent `cicd-pipeline-reviewer`**: NO es un `/comando` (por eso no lo ves en la lista de slash commands). Se lo **pides a Claude** — ej. *"audita mi azure-pipelines.yml con el agent cicd-pipeline-reviewer"* o *"revisa mi pipeline y dame un reporte de severidad"* — y lo lanza como subagente.

### Flujo recomendado al actualizar

1. **Actualiza la plantilla**: `irm … | iex` (trae reglas/templates nuevos).
2. **Audita tu YAML** contra las reglas vigentes: pide a Claude que pase el agent `cicd-pipeline-reviewer`. Te da el "diff de conformidad" (que reglas nuevas no cumple tu pipeline). Si sale limpio, **no hay nada que hacer**.
3. **Si hay hallazgos que quieres aplicar**: re-ejecuta `/cicd-init`. Su FASE 0.5 (modo edicion, regla R14 idempotencia):
   - hace **backup** automatico (`.azure-pipelines.bak.<fecha>.yml`),
   - muestra el **diff** antes de tocar nada,
   - ofrece **5 opciones**: anadir stage / modificar stage / regenerar docs / actualizar YAML completo / salir,
   - **preserva** tus bloques `# CUSTOM: ... # /CUSTOM` y variables propias.
4. **Commit + push** del YAML en tu repo → el push dispara el build y valida que sigue verde. La definicion en TFS **no** se re-registra (ya existe).
5. **Cambio de fase** (0→1→2): el mismo `/cicd-init` anade los stages nuevos (Deploy on-demand con `DeployEnv` R20, gate de seguridad R22, rollback…).

### Que obliga a tocar el YAML (y que no)

| Tipo de mejora en STIC.IA | ¿Tocar el YAML? |
|---|---|
| Solo auditoria (el reviewer detecta mas cosas) | No, salvo que quieras corregir un hallazgo |
| Cambio en el template (nuevo paso canonico) | `/cicd-init` opcion "actualizar YAML" lo incorpora (preservando tus customs) |
| Nueva fase / CD | `/cicd-init` anade stages |
| Cambios solo en hooks / comandos / skill | No afecta al YAML |

> **Garantia**: re-ejecutar `/cicd-init` **nunca pisa tu trabajo** (backup + diff + confirmacion + preserva `# CUSTOM`). Es seguro hacerlo en cada actualizacion para re-sincronizar el pipeline con las reglas vigentes.

**Ejemplo (proyecto en Fase 1 que solo refresca herramientas)**: si las novedades de la version son de Fase 2 (deploy) o de otro stack, tu YAML Fase 1 **no necesita cambios** — basta `irm … | iex`. Solo re-ejecutas `/cicd-init` cuando quieras **promocionar de fase** o aplicar un **cambio de template**.

---

*Documento generado por STIC.IA v3.11.0 — Integracion CI/CD (ADR-042 D11 + ADR-043). Seccion "Actualizar el pipeline" anadida 2026-06-02.*
