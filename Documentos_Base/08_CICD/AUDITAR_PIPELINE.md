# Auditar tu pipeline CI/CD (`cicd-pipeline-reviewer`)

> Guía para desarrolladores: cómo auditar tu `azure-pipelines.yml` contra las 24 reglas STIC.IA (R1-R24)
> y las limitaciones de TFS 2020, antes de registrar el pipeline o tras editarlo a mano.

---

## Qué es

El **agent `cicd-pipeline-reviewer`** es un auditor **batch, read-only** (solo `Read`/`Grep`/`Glob`, no modifica nada) que:

1. Lee tu `azure-pipelines.yml` completo.
2. Lo contrasta contra `.claude/rules/cicd-comillas-runtime.md` (las 24 reglas **R1-R24**) y `.claude/rules/tfs-2020-limitations.md` (tablas A-F de features prohibidas/limitadas en Azure DevOps Server 2020).
3. Emite un **reporte estructurado con severidad** por hallazgo + acción correctiva.

Severidades:

| | Significado |
|---|---|
| 🔴 **HARD** | Feature prohibida en TFS 2020 (rompe el pipeline) o secreto en código. **Corregir antes de registrar.** |
| 🟡 **SOFT** | Comportamiento inconsistente, deuda conocida o desviación de la convención STIC. Revisar. |
| 🔵 **INFO** | Verificación fuera del YAML (cuenta del agente, retention en la definición, RUNBOOK), o nota. |

---

## Cuándo auditar

- **Tras editar `azure-pipelines.yml` a mano** (antes de hacer push).
- **Antes de registrar** un pipeline nuevo o de promover de fase.
- **Periódicamente**, para detectar drift (alguien metió un `Cache@2`, un `deploymentGroup:`, etc.).
- Se ejecuta **automáticamente** dentro de `/verify` (pipeline de 7 fases del consumidor).

## Cuándo NO usarlo

- Para **crear** un pipeline desde cero → usa `/cicd-init`.
- Para **editar el YAML con sugerencias inline** → usa la skill `cicd-architect` (interactiva).
- Para **aplicar** los fixes → el agent NO modifica; corrige tú o delega en `cicd-architect`.

---

## Cómo lanzarla

Los agents **no son slash-commands**: se invocan describiendo la tarea a Claude dentro de una sesión Claude Code **en tu proyecto**.

```
cd C:\ruta\a\TuProyecto
claude
```

Y en la sesión, escribe (cualquiera dispara el agent — su `USE FOR` es "audita mi pipeline"):

```
Audita azure-pipelines.yml con el agent cicd-pipeline-reviewer y dame el reporte R1-R24 con severidad.
```

o simplemente:

```
audita mi pipeline
```

**Vía alternativa**: `/verify` también lo ejecuta (dentro de su pipeline de 7 fases), pero es más amplio; para una auditoría enfocada usa el prompt de arriba.

> Requisito: tu proyecto debe tener `.claude/rules/cicd-comillas-runtime.md` (R1-R24) — viene con STIC.IA ≥ v3.13.0. Si estás en una versión anterior, ejecuta `/actualizar` primero.

---

## Qué devuelve

1. **Inventario** del pipeline: stack detectado, modelo de deploy (auto / on-demand R20 / branch-gated R24), stages, fase de adopción.
2. **Hallazgos por severidad** (🔴/🟡/🔵), cada uno con: regla violada, por qué, y la corrección.
3. **Veredicto**: apto / con deuda / bloqueante.

---

## Ejemplo real — auditoría de Comillas.GestionIntercambio (netfx, branch-gated)

Pipeline: .NET Framework 4.8, modelo **branch-gated R24** (develop→Dev/Demo, main→Prod), 4 stages.

**Resultado: APTO — 0 hallazgos 🔴, R1-R24 compliant.** Deuda brownfield conocida y gestionada:

| Sev | Regla | Hallazgo | Acción |
|---|---|---|---|
| 🟡 | R16 | Secretos hardcoded en `Web.config` (15+), sin Variable Group ni fail-fast | Migrar a VG `isSecret` + fail-fast; entonces subir R22 a `block`. Ver `SECRETOS.md`. |
| 🟡 | R18 | 0% cobertura (la `.sln` no tiene proyectos de test) → VSTest + gate omitidos | Añadir proyecto de test + reactivar R18 cuando sea viable |
| 🔵 | R22 | Gate de seguridad en `mode: warn` en los 3 entornos (no `block` en PRE/PROD) | Correcto **mientras** sea brownfield (GI#6). Subir a `block` al limpiar `Web.config` |
| 🔵 | R6/R17/R19 | Cuenta del agente, `retentionRules` (en la definición) y `RUNBOOK.md` no son verificables desde el YAML | Verificar aparte |

Cumple sin desviaciones en: R1 (BUILDERS+capability), R3 (descarga REST), R4 (tasks canónicas), R5 (sin `Cache@2`), R7 (doble patrón paths), R8 (`checkout:none`), R10 (`TakeAppOffline` netfx), R15 (rollback PRE/PROD), R20 (`DeployEnv` on-demand), R21 (trigger gitlab-flow), R23 (build-por-entorno) y **R24** (condiciones `DeployEnv` + `Build.SourceBranch` correctas: Prod solo desde `main`). Sin features prohibidas TFS 2020 (tablas A/B limpias; PROD usa `job` normales evitando TEC-006).

> Lectura: un pipeline "APTO con 🟡" es desplegable. Los 🟡 son **deuda planificada** (documentada en `DEUDA_TECNICA.md` / `SECRETOS.md`), no bloqueantes. Solo los 🔴 obligan a corregir antes de registrar.

---

## Relación con otros componentes

| Necesitas | Usa |
|---|---|
| Crear pipeline desde cero | `/cicd-init` |
| Editar YAML con sugerencias inline | skill `cicd-architect` |
| **Auditar YAML existente (este doc)** | agent `cicd-pipeline-reviewer` |
| Migrar pipeline TFS Classic (.xaml) | skill `cicd-classic-migrator` |
| Ver estado de builds | `/cicd-status` |

---

*STIC.IA v3.13.0 · Las 24 reglas en `.claude/rules/cicd-comillas-runtime.md` · Limitaciones TFS 2020 en `LIMITACIONES_TFS_2020.md`.*
