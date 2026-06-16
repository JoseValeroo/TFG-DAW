# Intelligent Context System for Claude Code

> This document explains how the OTD template's context system works
> and how Claude navigates through it according to each project situation.

---

## System Overview

The OTD template includes an **intelligent context system** that allows Claude Code to:

1. **Remember** project state between sessions
2. **Understand** existing functionalities, dependencies, and decisions
3. **Ask proactively** to avoid errors
4. **Execute standardized commands** for common tasks

---

## System Architecture

```
CLAUDE.md                    ← Entry point (automatically read)
    │
    ├── _duran/           ← Dynamic project memory
    │   ├── ESTADO_PROYECTO.json   ← Current state, phase, mode
    │   ├── FUNCIONALIDADES.md     ← What the application does
    │   ├── DEPENDENCIAS.md        ← What can break
    │   ├── DECISIONES.md          ← Why it was done this way
    │   ├── HISTORIAL_CAMBIOS.md   ← Changelog
    │   └── reuniones/             ← Meeting agreements
    │
    ├── .claude/commands/    ← Custom commands
    │   ├── onboarding.md    ← /onboarding
    │   ├── commit.md        ← /commit
    │   ├── prepara-entrega.md ← /prepara-entrega
    │   ├── revision.md      ← /revision
    │   ├── estado.md        ← /estado
    │   └── sync.md          ← /sync
    │
    └── Documentos_Base/     ← Static OTD rules
        ├── 01_Estructura_Tecnica/
        ├── 02_Diseno_Usabilidad/
        ├── 03_Consideraciones_Comunes/
        └── 04_Plantillas_Documentacion/
```

---

## Operation Modes

The system has 4 main modes defined in `ESTADO_PROYECTO.json`:

### 1. Mode: `puesta_a_punto` (Setup)

**When**: Existing project newly incorporated into the template

**Claude's behavior**:
```
1. Detects "puesta_a_punto" mode in ESTADO_PROYECTO.json
2. Does NOT make code changes
3. Invites to execute /onboarding
4. Asks battery of questions to contextualize
5. Documents in _duran/
6. Upon completion, switches to "desarrollo" mode
```

**Flow**:
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ New project     │ ──► │ /onboarding  │ ──► │ Development     │
│ (puesta_a_punto)│     │ (questions)  │     │ mode (ready to  │
│                 │     │              │     │  work)          │
└─────────────────┘     └──────────────┘     └─────────────────┘
```

### 2. Mode: `desarrollo` (Development)

**When**: Active project development

**Claude's behavior**:
```
1. Reads complete context at startup
2. Asks proactive questions according to task type
3. Verifies dependencies before modifying
4. Updates _duran/ with important changes
5. Uses commands for standard operations
```

**Proactive questions**:

| Situation | Claude asks |
|-----------|-------------|
| New functionality | "Which module does it go in? Does it follow existing pattern?" |
| Modification | "I've detected dependencies with [X]. Should I review impact?" |
| Bug fix | "Steps to reproduce? Severity?" |
| Before coding | "Do I understand the requirement correctly?" |

### 3. Mode: `mantenimiento` (Maintenance)

**When**: Stable project, only minor corrections

**Claude's behavior**:
```
1. Conservative mode: minimal changes
2. Emphasis on not breaking existing functionality
3. Always verifies tests before changes
4. Documents all changes in HISTORIAL_CAMBIOS.md
```

### 4. Mode: `soporte_uap` (UAP Support)

**When**: Project in production supported by UAP

**Claude's behavior**:
```
1. Consults runbooks before acting
2. Prioritizes quick resolution
3. Documents incident according to template
4. Notifies about SLA impact
```

---

## Claude's Navigation Flow

### Session Initialization

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code starts                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Reads CLAUDE.md automatically                               │
│ → Loads general instructions                               │
│ → Knows available commands                                 │
│ → Knows which files to read                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Reads _duran/ESTADO_PROYECTO.json                          │
│ → Identifies current mode                                  │
│ → Knows phase, version, alerts                             │
│ → Knows which modules are in development                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        [puesta_a_punto] [desarrollo]   [mantenimiento]
              │               │               │
              ▼               ▼               ▼
        Invites to       Reads complete  Conservative
        /onboarding      context         mode
```

### Before Each Development Task

```
┌─────────────────────────────────────────────────────────────┐
│ Developer describes task                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude identifies task type                                 │
│ → New functionality?                                        │
│ → Modification?                                             │
│ → Bug fix?                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude consults relevant context                            │
│                                                             │
│ IF it's a modification:                                     │
│   → Reads FUNCIONALIDADES.md (affected functionality)       │
│   → Reads DEPENDENCIAS.md (what can break)                  │
│   → Searches recent meetings                               │
│                                                             │
│ IF it affects architecture:                                 │
│   → Reads DECISIONES.md (relevant ADRs)                     │
│   → Verifies with Documentos_Base/                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude asks proactive questions                             │
│                                                             │
│ "I've detected that [X] has dependencies with [Y,Z]."       │
│ "Do you want me to analyze the impact before starting?"     │
│                                                             │
│ "I see there was a recent meeting on [date]."               │
│ "Should I review the agreements?"                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Claude implements following:                                │
│ → Rules from Documentos_Base/                               │
│ → Existing patterns in the code                            │
│ → Previous decisions (ADRs)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Available Commands

### /onboarding
**Purpose**: Contextualize existing project
**When to use**: When incorporating project into template
**What it does**:
- Asks battery of questions about the project
- Documents in _duran/
- Switches mode to "desarrollo" upon completion

### /commit
**Purpose**: Commit with verifications
**When to use**: Before each commit
**What it does**:
- Verifies test coverage >= 70%
- Verifies code format
- Verifies no secrets present
- Generates message according to commit policy
- Updates HISTORIAL_CAMBIOS.md

### /prepara-entrega
**Purpose**: Prepare version for delivery
**When to use**: Before delivering to client/production
**What it does**:
- Verifies all tests pass
- Generates/updates documentation
- Updates FUNCIONALIDADES.md
- Increments version
- Generates delivery summary

### /revision
**Purpose**: Analyze change impact
**When to use**: Before modifying critical code
**What it does**:
- Analyzes modified files
- Cross-references with dependency map
- Identifies affected modules
- Suggests tests to execute

### /estado
**Purpose**: View current project state
**When to use**: To know current situation
**What it does**:
- Shows mode, phase, version
- Lists modules in development
- Shows active alerts
- Summarizes metrics

### /sync
**Purpose**: Update project context
**When to use**: After important changes
**What it does**:
- Analyzes current code
- Updates FUNCIONALIDADES.md
- Updates DEPENDENCIAS.md
- Synchronizes ESTADO_PROYECTO.json

---

## Questions by Situation

### New Functionality

| Phase | Questions |
|-------|-----------|
| Understanding | "What's the business objective?" |
| | "Who is the end user?" |
| | "Is it part of a larger development?" |
| Location | "Which module?" |
| | "Does it follow existing pattern?" |
| Data | "Does it require new tables?" |
| | "Does it handle sensitive data?" |
| Security | "Which roles have access?" |

### Modifying Existing

| Phase | Questions |
|-------|-----------|
| Context | "Are there previous decisions to respect?" |
| | "Were there previous problems here?" |
| Impact | "Do you want me to analyze dependencies?" |
| | "Are there existing tests?" |
| Integrations | "Does it affect external systems?" |
| | "Are there dependent batch processes?" |

### Bug Fix

| Phase | Questions |
|-------|-----------|
| Reproduction | "Steps to reproduce?" |
| | "In which environment does it occur?" |
| Urgency | "Severity?" |
| | "Is there a workaround?" |
| Origin | "When did it start failing?" |
| | "Were there recent changes?" |

---

## Key Files and Their Purpose

| File | Claude reads it | For |
|------|----------------|-----|
| `CLAUDE.md` | Always (automatic) | General instructions |
| `ESTADO_PROYECTO.json` | Always | Know mode, phase, version |
| `FUNCIONALIDADES.md` | Modifications | Understand what exists |
| `DEPENDENCIAS.md` | Modifications | Avoid breaking things |
| `DECISIONES.md` | Architecture | Respect decisions |
| `HISTORIAL_CAMBIOS.md` | Deliveries | Document changes |
| `reuniones/` | According to context | Recent agreements |
| `Documentos_Base/` | Development | Technical rules |

---

## Context Updates

| Event | Updated files | Command |
|-------|--------------|---------|
| Commit | HISTORIAL_CAMBIOS.md | /commit |
| Delivery | ESTADO_PROYECTO.json, FUNCIONALIDADES.md | /prepara-entrega |
| Important change | FUNCIONALIDADES.md, DEPENDENCIAS.md | /sync |
| Technical decision | DECISIONES.md | Manual |
| Meeting | reuniones/YYYY-MM-DD.md | Manual |

---

## Complete Flow Diagram

```
                    ┌──────────────────────┐
                    │   SESSION START      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Read CLAUDE.md      │
                    │  Read ESTADO_PROYECTO│
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
   │ (questions)   │           │                   │
   └───────┬───────┘           │                   │
           │                   │                   │
           └─────────┬─────────┘                   │
                     │                             │
                     ▼                             │
           ┌───────────────────┐                   │
           │ REQUESTED TASK    │◄──────────────────┘
           └─────────┬─────────┘
                     │
                     ▼
           ┌───────────────────┐
           │ Identify task     │
           │ type              │
           └─────────┬─────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌─────────┐    ┌─────────┐    ┌─────────┐
│ New     │    │ Modif.  │    │ Bug fix │
│ func.   │    │         │    │         │
└────┬────┘    └────┬────┘    └────┬────┘
     │              │              │
     │              ▼              │
     │    ┌─────────────────┐      │
     │    │ Read FUNCIONAL. │      │
     │    │ Read DEPENDENC. │      │
     │    │ Read meetings   │      │
     │    └────────┬────────┘      │
     │             │               │
     └──────┬──────┴───────────────┘
            │
            ▼
   ┌───────────────────┐
   │ PROACTIVE         │
   │ QUESTIONS         │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ IMPLEMENTATION    │
   │ (following rules) │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ /commit           │
   │ (verifications)   │
   └─────────┬─────────┘
             │
             ▼
   ┌───────────────────┐
   │ Update            │
   │ HISTORIAL_CAMBIOS │
   └───────────────────┘
```

---

**Version**: 1.0
**Date**: December 2024
**Owner**: OTD Technical Committee
