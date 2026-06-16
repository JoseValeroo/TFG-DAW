# 08_CICD — Integracion Continua / Despliegue Continuo

> **Guias tecnicas STIC.IA para CI/CD sobre Azure DevOps Server 2020 on-premise** (`tfs.comillas.edu`).
> Patron canonico: pool `BUILDERS` server-wide con agentes diferenciados por capability (`Agent.ComputerName=LADYADA` para build, `DeployTarget=<env>` para deploys).
>
> Generado por STIC.IA v3.11.0 (ADR-042).

---

## Sobre la numeracion 08_*

⚠️ **La numeracion de `Documentos_Base/` NO es jerarquica.** Esta carpeta se anadio en v3.11.0 como `08_CICD/` para preservar enlaces historicos a `05_Plantillas_SQL/`, `06_Observabilidad/`, `07_Resiliencia/` ya publicados en releases anteriores. Ver ADR-042 § Decision D1 para el razonamiento completo.

---

## Indice

| Documento | Audiencia | Cuando consultar |
|---|---|---|
| [`GUIA_FASES_ADOPCION.md`](GUIA_FASES_ADOPCION.md) | Devs + JPs | Antes de invocar `/cicd-init`. Decide en que fase entras (0, 1 o 2). |
| [`RUNBOOK_TEMPLATE.md`](RUNBOOK_TEMPLATE.md) | Devs + on-call | Plantilla del runbook operacional que `/cicd-init` rellena por proyecto. **Solo proyectos en Fase 2.** |
| [`RUNBOOK_DEPLOY_MANUAL.md`](RUNBOOK_DEPLOY_MANUAL.md) | Devs | Procedimiento de deploy manual paso a paso. **Solo proyectos en Fase 0** (sin pipeline). |
| [`LIMITACIONES_TFS_2020.md`](LIMITACIONES_TFS_2020.md) | Devs + Sistemas | Antes de editar `azure-pipelines.yml` manualmente o anadir tasks. Lista de features prohibidas + alternativas. |
| [`AUDITAR_PIPELINE.md`](AUDITAR_PIPELINE.md) | Devs | Como auditar tu `azure-pipelines.yml` contra R1-R24 con el agent `cicd-pipeline-reviewer` (tras editarlo a mano o antes de registrar). Incluye ejemplo real. |
| [`PERMISOS_CICD.md`](PERMISOS_CICD.md) | Sistemas + JPs | Handoff a Sistemas: permiso `Use` pool BUILDERS al grupo, autorizacion de canalizacion, agentes `DeployTarget`, approvals PROD. **Fase >= 1.** Incluye plantilla de correo. |

---

## Flujo recomendado para un proyecto nuevo

```
1. Leer GUIA_FASES_ADOPCION.md
2. Decidir fase de adopcion (0, 1 o 2)
3. Invocar /cicd-init
4. Si Fase 0: usar RUNBOOK_DEPLOY_MANUAL.md
   Si Fase 1: editar azure-pipelines.yml minimal generado
   Si Fase 2: usar RUNBOOK_TEMPLATE.md rellenado
5. Antes de editar el YAML a mano: revisar LIMITACIONES_TFS_2020.md
```

---

## Comandos relacionados (de plantilla STIC.IA)

| Comando | Que hace |
|---|---|
| `/cicd-init` | Wizard que genera artefactos CI/CD adaptados al proyecto (3 fases) |
| `/cicd-status` | CLI local que muestra estado pipeline + ultimos builds + tendencia coverage |

## Skill + agent + hook

- Skill `cicd-architect` — auto-invocacion al editar `azure-pipelines.yml`, propone correcciones segun R1-R24
- Skill `cicd-classic-migrator` — placeholder v3.11.0 (completo v3.12.0 con piloto iMat2)
- Agent `cicd-pipeline-reviewer` — auditoria YAML contra R1-R24 con severidad por hallazgo
- Hook `pre-cicd-init.ps1` — gate PreToolUse: verifica version plantilla >= 3.11.0 y conectividad TFS

## Reglas (gating por glob)

- `.claude/rules/cicd-comillas-runtime.md` — R1-R24, dispara en `azure-pipelines.yml`
- `.claude/rules/tfs-2020-limitations.md` — tablas A-F (tasks prohibidas, keywords no soportadas, etc.), dispara en YAMLs de pipeline

---

*Documento generado por STIC.IA v3.11.0 — Integracion CI/CD (ADR-042)*
