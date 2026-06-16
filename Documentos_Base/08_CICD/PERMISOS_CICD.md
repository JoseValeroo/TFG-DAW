# Permisos e infraestructura CI/CD — solicitud a Sistemas Comillas

> **Guía técnica STIC.IA**. Documento consolidado y *enviable a Sistemas* con TODO lo que el equipo de Sistemas debe configurar (server-side) para que un pipeline `/cicd-init` Fase ≥ 1 funcione en Azure DevOps Server 2020 on-premise (`tfs.comillas.edu`).
>
> `/cicd-init` genera una copia adaptada de este documento en `05_CICD/PERMISOS_CICD.md` con los datos reales del proyecto (nombre, entornos, servidores). Este fichero es la plantilla base.
>
> Origen empírico: TEC-003 (piloto Griddo) + R1/R6 de `cicd-comillas-runtime.md`.

---

## Resumen para el responsable de Sistemas

El proyecto **{{PROYECTO_NOMBRE}}** quiere registrar un pipeline CI/CD en `tfs.comillas.edu`. La mayoría de lo necesario ya existe (pool BUILDERS server-wide). Lo que requiere acción de Sistemas se marca abajo. **Todo es one-time por proyecto/entorno** (salvo instalación de agentes nuevos).

| # | Qué | Quién | Frecuencia |
|---|---|---|---|
| 1 | Permiso `Use` sobre pool BUILDERS **al GRUPO del proyecto** | Sistemas | 1 vez / proyecto |
| 2 | Autorizar la canalización a usar el recurso pool (`Checkpoint.Authorization`) | Sistemas (pool admin) | 1 vez / pipeline |
| 3 | (Solo Fase 2) Agentes `<SERVER>_DEPLOY` con capability `DeployTarget` | Sistemas | 1 vez / entorno |
| 4 | (Solo Fase 2) Grupo aprobador del Environment `{{PROYECTO_NOMBRE}}-Prod` | Sistemas | 1 vez / proyecto |

---

## 1. Permiso `Use` sobre BUILDERS (registro + encolado) — BLOQUEANTE

El dev que ejecuta `/cicd-init` necesita rol **User** (permiso `Use`) sobre el pool BUILDERS para registrar el pipeline y encolar builds. Sin él, el POST de la definición o el encolado devuelven **HTTP 403** (`<usuario> needs Use permissions for pool BUILDERS`).

- **Conceder a**: el **GRUPO del proyecto** (`[{{PROYECTO_NOMBRE}}]\Contributors` o `Project Valid Users`), **NO** a la identidad individual.
  - Razón (TEC-003): si se concede solo al usuario actual, el **siguiente dev** del mismo proyecto que intente registrar vuelve a bloquearse. Concedido al grupo, todo el equipo queda cubierto con una sola acción.
- **Ruta TFS**: `Organization/Collection Settings → Agent pools → BUILDERS → Security → Add` → grupo del proyecto → rol **User**.
- Alternativa equivalente: activar *"Grant access permission to all pipelines"* del pool para el proyecto.

> `PATCH /_apis/pipelines/pipelinePermissions` da **401** si quien lo lanza no es admin del pool — por eso esto es acción de Sistemas, no automatizable desde `/cicd-init`.

---

## 2. Autorizar la canalización al recurso pool (`Checkpoint.Authorization`)

Distinto del permiso `Use` del usuario. Aunque el dev pueda registrar/encolar, la **canalización** debe estar autorizada a usar el recurso pool, o el build queda en `notStarted` indefinidamente (con agentes LADYADA online y demand coincidente).

- **Síntoma**: build encolado en `notStarted` / banner *"This pipeline needs permission to access a resource"*.
- **Acción**: pulsar **Permit** en el banner, **o** `Agent pools → BUILDERS → Security → "grant access to all pipelines"` (pool admin).
- **NO** es un bug "API-vs-UI": las definiciones creadas por API y por UI quedan en el mismo checkpoint.

---

## 3. Agentes de deploy por entorno (solo Fase 2) — `DeployTarget`

Cada entorno con deploy automatizado necesita un agente self-hosted en el server destino, registrado en el pool BUILDERS y diferenciado por capability `DeployTarget`.

| Entorno | Server destino | Nombre agente esperado | Capability |
|---|---|---|---|
| DEV | {{SERVER_DEV}} | {{SERVER_DEV}}_DEPLOY | `DeployTarget=dev` |
| PRE/DEMO | demowww | demowww_DEPLOY | `DeployTarget=demowww` |
| PROD A | {{SERVER_PROD_A}} | {{SERVER_PROD_A}}_DEPLOY | (demand `Agent.Name`) |
| PROD B | {{SERVER_PROD_B}} | {{SERVER_PROD_B}}_DEPLOY | (demand `Agent.Name`) |

### Instalación de un agente self-hosted (one-time por server)

1. RDP al server destino.
2. Descargar el agente desde `tfs.comillas.edu/_settings/agentpools → BUILDERS → New agent → Windows`.
3. Descomprimir y ejecutar `config.cmd`. Respuestas críticas:

   | Pregunta del wizard | Respuesta |
   |---|---|
   | Server URL | `https://tfs.comillas.edu/<Colección>` |
   | Authentication type | `Integrated` (o PAT si se indica) |
   | Pool | `BUILDERS` |
   | Agent name | `<SERVER>_DEPLOY` |
   | **Run agent as service? (Y/N)** | **`Y`** (CRÍTICO — NO dejar en blanco) |
   | **Service account** | **`NT AUTHORITY\SYSTEM`** (sin contraseña, built-in) — R6 |

   > Si se deja Enter en "run as service", cae a modo interactivo que pide contraseña para SYSTEM (que no tiene). Abortar con Ctrl+C, `.\config.cmd remove`, repetir con `Y` explícito.
   >
   > **NUNCA** `NT AUTHORITY\NETWORK SERVICE` (le faltan permisos MSDeploy en el wwwroot) ni cuentas personales (caducan/rotan).

4. Añadir la capability del entorno (TFS UI): `Agent pools → BUILDERS → <SERVER>_DEPLOY → Capabilities → Add` → `DeployTarget = <env>`.
5. Verificar `status = online`.

---

## 4. Aprobadores de PROD (solo Fase 2) — Environment approval

El stage PROD usa un Environment `{{PROYECTO_NOMBRE}}-Prod` con *approval check* de grupo (además del `ManualValidation@0` de DEMO).

- **Acción**: `Pipelines → Environments → {{PROYECTO_NOMBRE}}-Prod → Approvals and checks → Add → Approvals` → añadir el grupo aprobador ({{GRUPO_APROBADOR_PROD}}).
- El Environment se crea solo al primer deploy a PROD; si no existe, crearlo manualmente con ese nombre exacto.

---

## 5. Prerrequisitos que NO requieren acción (verificar que siguen OK)

- Pool **BUILDERS** existe (`/_apis/distributedtask/pools`, `poolType=automation`).
- Al menos un agente Build con `Agent.ComputerName=LADYADA` online (`LADYADA_AGENTE1/2`).
- El cert raíz de `tfs.comillas.edu` está en el Windows Cert Store de los agentes (si no, las descargas REST R3 fallan con `Could not establish trust relationship`). **NO** hacer bypass global de validación de cert; pedir a Sistemas añadir el cert raíz.

---

## 5-bis. Coverage gate (R18) — Comillas.Mira.Coverage (auto-instalado, NO requiere acción)

> Validado empíricamente en el piloto Griddo (2026-06-03). Ver `Documentacion/05_Analisis_Internos/ANALISIS_R18_MIRA_COVERAGE_GATE_v3.11.1-hf6.html`.

El gate de calidad R18 usa **`mira summary`** (Mira 0.8.1 gatea por **% de cobertura** de líneas/branches; **NO** calcula CRAP). El pipeline **auto-instala** `Comillas.Mira.Coverage` como **.NET global tool** en el agente Build y lo invoca como **`mira`** (NO `dotnet mira`).

- **Fuente del `.nupkg` que el AGENTE alcanza**: el repositorio NuGet local/share de ladyada → `\\ladyada.upcont.es\repositorio\UPComillas\PaquetesNuget` (flat dir con Mira **+ sus dependencias**). El agente corre EN ladyada, así que lo lee de su propio disco/share (sin red/TLS). Se usa la **carpeta completa** como `--add-source` para que `dotnet tool install` resuelva dependencias.
- **`https://demowww.comillas.edu/paquetesnuget/...` es solo para HUMANOS** (red de usuarios). El agente **NO** lo alcanza (hairpin/split-DNS → "Unable to connect"). Queda como *fallback* configurable en la variable `miraNupkgUrl` (descarga del `.nupkg` suelto, sin dependencias). Requiere el MIME `.nupkg` en IIS (`application/octet-stream`).
- **Invocación**: `mira summary -i <cobertura.xml> --threshold-line 70 --threshold-branch 60` (exit 3 si no llega). El ejecutable queda en `%USERPROFILE%\.dotnet\tools` → añadir esa ruta al PATH del step.
- **WARN-first** por defecto: si la cobertura está por debajo del umbral, **avisa** pero NO bloquea el Build (política Comillas). Subir a BLOCK cuando el equipo lo decida.
- Si `mira` no está ni es instalable desde ninguna fuente, R18 se **omite con warning** (no bloquea) — warning-by-design.

**Acción Sistemas (recomendada para que R18 ejecute)**: asegurar que `Comillas.Mira.Coverage.<ver>.nupkg` (con sus dependencias) está en `\\ladyada.upcont.es\repositorio\UPComillas\PaquetesNuget`, legible por la cuenta del agente (grupo `G_Acceso_LADYADA_Repositorio_RO`). Alternativa: preinstalar el tool global en los agentes `LADYADA_AGENTE*`. Si no, R18 se omite (no bloquea).

---

## 5-ter. vstest.console 18.x para test net48 con MSTest 4.x (netfx) — recomendado (1 vez)

Los agentes traen `vstest.console` 16.11 (VS2019), que **no carga el adapter MSTest 4.x** (error `Could not load System.Memory 4.0.1.2`). El enum de `vsTestVersion` en TFS 2020 no acepta `17.0` y `latest`=16.11. El pipeline netfx instala `vstest.console` 18.x con `VisualStudioTestPlatformInstaller@1` (`packageFeedSelector: netShare`) desde el feed Stic, y `VSTest@2` usa `vsTestVersion: toolsInstaller`.

**Acción Sistemas (1 vez)**: asegurar que `Microsoft.TestPlatform.<ver>.nupkg` (18.x) está en `\\ladyada.upcont.es\repositorio\UPComillas\PaquetesNuget`, legible por la cuenta del agente. Es copia LAN (sin internet ni TLS), igual que Mira. Si falta, VSTest no ejecuta los tests en proyectos netfx con MSTest 4.x. Validado en piloto GuiasDocentes (2026-06-05).

---
## 6. Permiso `Manage` sobre BUILDERS (opcional)

Solo si el equipo va a administrar el pool (añadir/quitar agentes, autorizar pipelines por sí mismo). Por defecto **NO** es necesario: con `Use` (punto 1) + autorización de canalización (punto 2) basta para operar.

---

## Plantilla de correo a Sistemas

```
Asunto: [CI/CD] Permisos pool BUILDERS para proyecto {{PROYECTO_NOMBRE}}

Hola,

Vamos a registrar un pipeline CI/CD para {{PROYECTO_NOMBRE}} en tfs.comillas.edu.
Solicitamos (one-time):

1. Permiso "Use" sobre el pool BUILDERS para el GRUPO del proyecto
   ([{{PROYECTO_NOMBRE}}]\Contributors), no para un usuario individual.
2. Autorizar la canalización a usar el recurso pool ("grant access to all
   pipelines" del pool para el proyecto), o nos avisáis para pulsar Permit.

[Solo si Fase 2 con despliegue automatizado:]
3. Agentes de deploy en {{SERVERS_DEPLOY}} registrados en BUILDERS como
   <SERVER>_DEPLOY, ejecutándose como NT AUTHORITY\SYSTEM, con capability
   DeployTarget=<entorno>.
4. Grupo aprobador para el Environment {{PROYECTO_NOMBRE}}-Prod.

Gracias,
{{EQUIPO}}
```

---

*Guía técnica STIC.IA — Documentos_Base/08_CICD. Reglas relacionadas: R1 (pool+capability), R6 (cuenta agente), tabla F · TEC-003 de `tfs-2020-limitations.md`.*
