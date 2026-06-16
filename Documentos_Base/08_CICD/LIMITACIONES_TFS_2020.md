# Limitaciones TFS 2020 on-premise — Guia tecnica STIC.IA

> **Audiencia**: desarrolladores que editan `azure-pipelines.yml` manualmente.
> **Cuando consultar**: ANTES de anadir o cambiar cualquier task / keyword en el YAML.
> **Plataforma**: Azure DevOps Server 2020 Update 1.2 on-premise (`tfs.comillas.edu`).
>
> Esta guia documenta features que en Azure DevOps Services (cloud) o Server 2022+ funcionan, pero que en TFS 2020 **rompen el build en runtime** o son rechazadas por el schema YAML.

---

## Politica para editar YAML

1. **NUNCA emitir** features marcadas 🔴 HARD — fallan en runtime o rechazadas por schema
2. **AVISAR** al editar features marcadas 🟡 SOFT — comportamiento inconsistente
3. **PREFERIR** alternativas validadas cuando hay variante "moderna cloud" y "compatible 2020"
4. **Si un comando STIC.IA propone una feature 🔴**: rechazar y proponer la alternativa, no aplicar a ciegas

El agent `cicd-pipeline-reviewer` audita tu YAML contra estas reglas y emite reporte con severidad 🔴/🟡/🔵.

---

## Tabla A — Tasks que NO funcionan o estan deprecadas

| Task | Severidad | Por que falla | Alternativa valida |
|---|---|---|---|
| `Cache@2` | 🔴 HARD | Servicio Pipeline Caching no existe en TFS 2020 | Sin cache; ejecutar `npm ci` / `dotnet restore` limpio en cada build (~30-60s extra, aceptable) |
| `IISWebAppDeployment@1` | 🔴 HARD | Preview deprecada, exige `environmentName` que no aplica al patron local-agent | Usar `IISWebAppDeploymentOnMachineGroup@0` (sufijo historico, funciona en `job:` regular) |
| `DownloadBuildArtifacts@0` | 🔴 HARD | Task Node.js; bug SSL contra `tfs.comillas.edu` ("unable to get local issuer certificate") | Descarga via REST API + PowerShell (`Invoke-WebRequest` + `System.AccessToken`) |
| `DownloadPipelineArtifact@2` | 🔴 HARD | Mismo bug Node.js SSL | Igual que la anterior — REST API + PowerShell |
| `PublishCodeCoverageResults@2` | 🟡 SOFT | Inputs cambiados respecto a `@1`; comportamiento inconsistente en TFS 2020 | Usar `@1` con `codeCoverageTool: Cobertura` |
| `UseNode@1` | 🟡 SOFT | Sintaxis distinta de la canonica del equipo | Usar `NodeTool@0` con `versionSpec: '<v>.x'` |
| `Docker@2` con `buildAndPush` cloud | ⚪ N/A | TFS 2020 no integra registries cloud directos | No aplica (Comillas no usa containers en CI) |
| Tasks marcadas "preview" o "(deprecated)" en Marketplace | 🟡 SOFT | TFS 2020 puede no recibir parches | Buscar version `@<n+1>` estable o evitar |

---

## Tabla B — Keywords/features YAML que fallan o estan limitados

| Feature YAML | Severidad | Comportamiento en TFS 2020 | Alternativa |
|---|---|---|---|
| `deploymentGroup:` en `deployment:` o `job:` | 🔴 HARD | Schema rechaza: *"Unexpected value 'deploymentGroup'"* | Usar `pool: { name: BUILDERS, demands: [...] }` con capability custom `DeployTarget=<env>` |
| `pool.name:` apuntando a Deployment Pool | 🔴 HARD | API: *"Project agent pools can only refer to organization agent pools of type Automation"* | Pools tipo `automation` (BUILDERS) unicamente |
| `strategy: canary` | 🟡 SOFT | Sintaxis aceptada pero comportamiento no garantizado | Multiples jobs en serie con `dependsOn` + `condition: succeeded()` |
| `strategy: rolling` con `maxParallel` | 🟡 SOFT | Limitado; requiere `environment.resources` configurado | Jobs explicitos en serie (patron PROD A/B de STIC.IA) |
| `extends: template@<repo-externa>` | 🟡 SOFT | Repos externos a la coleccion pueden fallar; templates locales OK | Mantener templates en el mismo repo |
| `${{ each }}` con `outputs` cruzados entre jobs | 🟡 SOFT | Inferior a Azure DevOps Services | Mantener loops simples; explicitar jobs si crece |
| `services:` (sidecars Docker) | ⚪ N/A | Self-hosted Windows no los soporta bien | No usar |
| `resources.pipelines` (triggers cross-pipeline) | 🟡 SOFT | Limitado | Build chaining manual con artefactos compartidos |
| `environment.resources.kubernetes` | ⚪ N/A | No disponible | No aplica al equipo Comillas |
| `environment.resources.virtualMachines` | 🟢 OK | Funciona pero duplica al patron BUILDERS+capability del equipo | NO usar; el patron canonico STIC ya cubre el caso |
| `checkout: github://` | 🟡 SOFT | TFS 2020 + GitHub Enterprise: limitado | TFS Git nativo (Comillas no usa GitHub Enterprise) |
| `trigger.paths.include` con solo `'<dir>/**'` | 🟡 SOFT | Bug confirmado mayo 2026 Comillas.Claude.Guia: no dispara para subdirectorios profundos | Emitir AMBOS patrones: `'<dir>/**'` Y `'<dir>/**/*'` (defensa en profundidad) |

---

## Tabla C — Servicios TFS no disponibles

| Servicio | Implicacion practica |
|---|---|
| **Pipeline Caching** (`Cache@2`) | No cache de deps. ~30-60s extra por build, aceptable. |
| **Universal Packages** | No publicar binarios genericos. Para artefactos compartidos del equipo: NuGet privado interno (`\\ladyada\Repositorio\UPComillas\PaquetesNuget`). |
| **Hosted parallel jobs** | Solo self-hosted (BUILDERS). Si todos los LADYADA agents estan ocupados, la build queda en cola. |
| **Cloud-only Marketplace extensions** | Algunas tasks de Microsoft estan en `*.azure.com` y no se instalan en TFS on-prem. Verificar disponibilidad antes de anadir tasks no-built-in. |
| **`SystemDebug` env var con telemetria cloud** | Solo logs locales del agente — no hay telemetria agregada. |
| **Service connections cloud** (Azure subscription, etc.) | Funcionan limitados con cuentas Azure Comillas; pedir ayuda a Sistemas para configurar. |

---

## Tabla D — APIs REST con peculiaridades

| API | Estado | Nota |
|---|---|---|
| `/_apis/connectionData` | 🟢 OK | Util para detectar version + identidad |
| `/_apis/projects` y `/<proj>/_apis/...` | 🟢 OK | Funcionan identicas a Azure DevOps Services |
| `/_apis/build/definitions` (POST para crear pipeline) | 🟢 OK | Usado en FASE 2.5 del comando `/cicd-init` |
| `/_apis/pipelines` (newer endpoint) | 🟡 LIMITADO | Algunos campos vacios; preferir `/build/definitions` para crear/listar |
| `/_apis/distributedtask/pools/{id}/agents` | 🟢 OK | Capabilities incluidas con `?includeCapabilities=true` |
| `/_apis/distributedtask/queues` (POST) | 🔴 HARD | Schema rechaza pools tipo `deployment` (ver tabla B) |
| `/_apis/pipelines/pipelinePermissions` | 🟡 LIMITADO | Endpoint existe; algunas operaciones requieren rol Manage que el usuario tipico no tiene |
| `/_apis/git/repositories` | 🟢 OK | Para descubrir `repositoryId` durante FASE 2.5 |
| `/_apis/work/backlogs` | 🟡 LIMITADO | Requiere `api-version=5.1-preview` (NO `6.0`); ver `devops-awareness.md` |

---

## Tabla E — Lo que SI funciona perfectamente (no evitar)

Para que no caigas en evitar cosas innecesariamente:

- ✅ Multi-stage YAML (`stages:` con `dependsOn` y `condition`)
- ✅ Variables y variable groups (Library)
- ✅ `template:` local (mismo repo)
- ✅ `parameters:` en templates con valores escalares
- ✅ `${{ if }}` y `${{ each }}` basicos
- ✅ `pool: server` para server jobs (`ManualValidation@0`)
- ✅ `environment:` para approval gates (combinado con `deployment:` jobs)
- ✅ Approval checks por grupos TFS en environments
- ✅ Triggers `branches.include/exclude` y `paths.include/exclude`
- ✅ `displayName`, `condition`, `continueOnError` en cualquier step
- ✅ Tasks built-in en `@0`/`@1`/`@2` que listamos en `cicd-comillas-runtime.md` reglas R1-R24
- ✅ PowerShell inline scripts con `$(System.AccessToken)` para llamar APIs

---

## Tabla F — Runtime del agente (Windows PowerShell 5.1) — gotchas independientes de TFS

> Aunque TFS no impone esto, los agentes self-hosted del equipo corren **Windows Server 2019/2022 con Windows PowerShell 5.1** (el `powershell.exe` por defecto, NO PowerShell 7+). Esto trae "defaults antiguos" que rompen scripts modernos. Aplican a CUALQUIER step `PowerShell@2 targetType: inline`.

| Sintoma | Causa | Fix obligatorio al inicio del script |
|---|---|---|
| `The underlying connection was closed: An unexpected error occurred on a send` al hacer `Invoke-WebRequest` HTTPS | TLS 1.0 por defecto; el servicio destino (devwww/demowww/strify*/tfs.comillas.edu) exige TLS 1.2+ | `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13` (try/catch para fallback a `Tls12` si Tls13 no existe en .NET Framework <4.8) |
| `Could not establish trust relationship for the SSL/TLS secure channel` | Cert no encontrado en Windows Cert Store del agente (raro en intranet Comillas, ocurre con certs autofirmados) | NO bypasear con `ServerCertificateValidationCallback = {$true}` en produccion. Pedir a Sistemas que anada el cert raiz al store. Solo bypass justificado para `https://localhost/...` en smoke test post-deploy desde dentro del propio server (hairpin NAT + SNI mismatch). |
| `Invoke-WebRequest -SkipCertificateCheck` no reconocido | Parametro existe SOLO en PowerShell 7+; en 5.1 no | Usar el callback de `ServicePointManager` (ver fila anterior) cuando sea estrictamente necesario |
| `ConvertFrom-Json` con propiedades duplicadas falla | PS 5.1 es mas estricto que 7 | Limpiar el JSON o usar `[Newtonsoft.Json.Linq.JObject]::Parse(...)` |
| `Expand-Archive` lento (>30s) con zips de cientos de MB | Implementacion nativa antigua | Aceptable para artefactos drop (~MB pequenos); si crece, considerar `System.IO.Compression.ZipFile` directo |
| Encoding por defecto: BOM + UTF-16 en `Out-File` | PS 5.1 default | Para escribir JSON/XML que se va a leer luego: `Out-File -Encoding UTF8` explicito |
| Hairpin NAT / 403.4 SSL Required / SNI mismatch en smoke desde el agente al propio server | Topologia red Comillas | Smoke best-effort (warning + diagnostico, NO throw) para SPAs; smoke estricto solo para APIs .NET con endpoint local /health |

**Regla operacional**: cualquier script PowerShell del template que haga llamadas HTTPS hacia recursos Comillas (TFS, demo, prod) **DEBE arrancar con el bloque TLS 1.2+** documentado arriba. Las plantillas que `/cicd-init` genera ya lo incluyen.

---

## Cuando revisar/relajar estas limitaciones

Disparadores para volver a esta seccion y posiblemente reactivar features:

- **Sistemas anuncia migracion a TFS 2022+** → `Cache@2` vuelve, posibles otras (revisar tabla A)
- **Comillas adopta Azure DevOps Services cloud** → todas las limitaciones desaparecen (revisar todas las tablas)
- **TFS recibe parche de seguridad que toque schema YAML** → reverificar las marcadas 🟡 SOFT
- **Aparece task nueva deprecada** que el equipo usa → anadir entrada a tabla A

Mientras tanto, esta guia es **invariante operacional** del equipo STIC y los comandos `/cicd-init` / `cicd-pipeline-reviewer` la respetan automaticamente.

---

*Guia tecnica STIC.IA v3.11.0 — Integracion CI/CD (ADR-042). Snapshot de limitaciones TFS 2020 Update 1.2 a 2026-06-01.*
