# Guía: Instalación y uso de MCPs en STIC.IA

> **Versión**: 1.0 (STIC.IA v3.8.7)
> **Audiencia**: Desarrolladores Comillas
> **Propósito**: Documentar las formas oficiales de instalar y usar Model Context Protocol (MCP) servers en proyectos STIC.IA, los patrones recomendados de credenciales, y las mitigaciones de seguridad implementadas en el ecosistema.

---

## 1. Qué es un MCP

Un **Model Context Protocol server** expone funcionalidad (tools, resources, prompts) a Claude Code mediante un protocolo estándar. Claude Code lanza el MCP como subproceso (stdio) o se conecta vía HTTP/SSE, y puede invocar las tools que expone como si fueran nativas.

Ejemplos en uso en Comillas:
- **Context7** (`https://contex7.comillas.edu/mcp`): documentación actualizada de librerías
- **CWM.RoslynNavigator** (local): análisis semántico C# (15 tools)
- Próximos: GitHub, Jira, MS SQL (en evaluación)

---

## 2. Tres ejes ortogonales

Toda instalación de MCP combina tres dimensiones:

### Eje 1 — Scope (quién lo ve)

| Scope | Fichero | Vida | Uso típico |
|---|---|---|---|
| **user** | `~/.claude.json` | Todos los proyectos del usuario | MCPs personales (Context7, GitHub) |
| **project** | `<repo>/.mcp.json` | Equipo, va a git | MCPs del equipo (Roslyn, BD del proyecto) |
| **local** | `<repo>/.claude/settings.local.json` | Solo tú, gitignored | Override personal, secrets locales |

Precedencia: **local > project > user** (el más específico gana).

### Eje 2 — Mecanismo de instalación

| Forma | Ejemplo | Cuándo usar |
|---|---|---|
| **CLI `claude mcp add`** | `claude mcp add roslyn -s project -- dotnet run --project D:\Tools\RoslynMCP` | Recomendado: idiomático y validado por Claude Code |
| **Edición manual JSON** | Editar `.mcp.json` directamente | Scripts de instalación masiva, control total del JSON |
| **Plugin bundle** | MCP empaquetado dentro de un plugin marketplace | Distribución a equipos vía `/plugin install` |
| **Built-in / hosted** | Algunos MCPs ya integrados (filesystem, fetch) | Cero config |

### Eje 3 — Transporte (cómo se comunica)

| Transporte | Sintaxis típica | Cuándo |
|---|---|---|
| **stdio** | `command + args` (lanza proceso local) | Default. La mayoría: `npx`, `dotnet`, `python`, `uvx` |
| **SSE** | `url: https://server/sse` | MCP remoto vía Server-Sent Events |
| **HTTP streamable** | `url: https://server/mcp` | Protocolo nuevo 2026, oficial Anthropic |

---

## 3. Patrones recomendados Comillas

### Patrón A — MCP de equipo, todos lo necesitan

**Scope**: project · **Mecanismo**: `claude mcp add` o `.mcp.json` versionado · **Transporte**: stdio

```json
// .mcp.json (en raíz del repo, va a git)
{
  "mcpServers": {
    "roslyn": {
      "command": "dotnet",
      "args": ["run", "--project", "D:/Tools/RoslynMCP"],
      "env": {}
    }
  }
}
```

Lo instala el `irm | iex` o el `arranque.ps1` durante onboarding.

### Patrón B — MCP personal sin secretos

**Scope**: user · **Mecanismo**: CLI · **Transporte**: stdio o HTTP

```bash
claude mcp add github -s user -- npx -y @modelcontextprotocol/server-github
claude mcp add context7 -s user --transport http https://contex7.comillas.edu/mcp
```

### Patrón C — MCP con secretos (Jira, GitHub PAT, Atlassian)

**Scope**: local (gitignored) · **Mecanismo**: edición manual · **Transporte**: stdio · **Credenciales**: variables de entorno

**Paso 1** — generar el token en el proveedor (ej. https://id.atlassian.com/manage/api-tokens).

**Paso 2** — persistir en sesión Windows:

```powershell
# Persistente entre reinicios (NO usar `set` que solo dura la sesión actual)
setx JIRA_API_TOKEN "ATATT3xxxxxxxxxxxxxxxxxx"
setx JIRA_EMAIL "tu_email@comillas.edu"
# Reabrir la terminal para que el env var esté disponible
```

**Paso 3** — `.claude/settings.local.json` con placeholder `${env:VAR}`:

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@atlassian/mcp-server-jira"],
      "env": {
        "JIRA_URL": "https://comillas.atlassian.net",
        "JIRA_EMAIL": "${env:JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${env:JIRA_API_TOKEN}"
      }
    }
  }
}
```

**Paso 4** — añadir `.claude/settings.local.json` a `.gitignore` (ya viene así por defecto en STIC.IA).

### Patrón D — MCP remoto compartido (servidor on-prem Comillas)

**Scope**: user · **Mecanismo**: CLI con `--transport http` · **Transporte**: HTTP/SSE · **Auth**: Windows integrada o token corporativo

```bash
claude mcp add comillas-banner -s user --transport http https://intranet.comillas.edu/mcp/banner
```

Sin proceso local, sin credenciales en disco. La auth la maneja el servidor (NTLM, Azure AD, etc.).

### Patrón E — MCP de toda la organización vía plugin

**Scope**: user (instalado por marketplace) · **Mecanismo**: plugin · **Transporte**: stdio + HTTP

Cuando exista el marketplace propio Comillas (`stic-ia-marketplace`), un solo `/plugin install stic-ia/mcps` instalará Context7 + Roslyn + Jira + futuros con configuración pre-empaquetada.

---

## 4. Anti-patrones (PROHIBIDO)

| ❌ KO | ✅ OK | Razón |
|---|---|---|
| Token literal en `.mcp.json` versionado | Token en env var + placeholder `${env:VAR}` | Filtración a git, repo público interno |
| `set VAR=value` en CMD | `setx VAR "value"` (persistente) | `set` solo dura la sesión actual |
| `JIRA_API_TOKEN` en `~/.claude.json` (user scope, plain) | Mismo token vía `${env:JIRA_API_TOKEN}` | `~/.claude.json` no está cifrado |
| MCP que requiere admin para correr | MCP user-scope sin elevación | Friction operativa, riesgo de elevación |
| Dejar MCP de tests apuntando a BD producción | MCP separado por entorno (dev/pre/pro) | Riesgo de mutaciones accidentales |

---

## 5. Mitigaciones de seguridad implementadas

### Hook `secret-scanner.ps1` v1.1.0+

Bloquea automáticamente al hacer `Write/Edit` sobre `.mcp.json`, `~/.claude.json` o `.claude/settings.json` si detecta:

- **GitHub PAT** literal: `ghp_...` o `github_pat_...`
- **Atlassian API token** literal: en claves `JIRA_API_TOKEN`, `ATLASSIAN_API_TOKEN`, `CONFLUENCE_API_TOKEN`
- **Anthropic API key** literal: `sk-ant-...`
- **Bloque genérico** en `env`: cualquier clave `*_TOKEN`, `*_KEY`, `*_SECRET`, `*_PASSWORD` con valor literal (no `${env:...}`, no `<placeholder>`, no `TODO`, no `EXAMPLE`)

Pasa correctamente:
- `${env:VAR}` placeholders
- `<TODO_REPLACE>` placeholders
- `EXAMPLE_KEY`, `YOUR_TOKEN_HERE`

### Hook `auth-config-guard.ps1`

Detecta configuraciones de autenticación incorrectas en código C# (Azure AD, OAuth2). Complementario al secret-scanner pero opera sobre código fuente, no sobre `.mcp.json`.

---

## 6. Comandos útiles

```bash
# Listar todos los MCPs activos en el contexto actual
claude mcp list

# Detalle de un MCP concreto
claude mcp get <name>

# Quitar un MCP de un scope
claude mcp remove <name> -s <user|project|local>

# Importar configuración desde Claude Desktop (app distinta)
claude mcp add-from-claude-desktop

# Ver logs de un MCP que falla
claude mcp logs <name>
```

---

## 7. Troubleshooting

### El MCP no aparece tras `claude mcp add`

1. Verificar que el comando devolvió exit 0
2. Reiniciar Claude Code (algunos MCPs solo se registran en startup)
3. Comprobar `claude mcp list` y `claude mcp get <name>`

### El MCP aparece pero falla al usar tools

1. `claude mcp logs <name>` — ver el output del proceso
2. Comprobar env vars con `Get-ChildItem Env:` en una nueva terminal
3. Si es `claude mcp add --transport http`, comprobar conectividad: `irm <url>/health`

### Tokens expirados (Atlassian, GitHub)

- Atlassian: tokens vencen tras 12 meses si no se rotan. Generar nuevo y `setx` en sesión.
- GitHub PATs clásicos: configurables. Fine-grained: 1 año máximo.
- Anthropic OAuth (Claude Code): se renueva automáticamente con refresh token.

### El secret-scanner bloquea un valor que no es un secret

- Si es genuino placeholder, asegurar que cumple uno de los formatos reconocidos: `${env:...}`, `<TODO_...>`, `YOUR_...`, `PLACEHOLDER_...`, `EXAMPLE_...`
- Si necesitas commitear un valor real (raro), añadir comentario `// PUBLIC: ...` o exportar a una variable env y reescribir con placeholder

---

## 8. Roadmap MCPs Comillas

| MCP | Scope previsto | Estado | Notas |
|---|---|---|---|
| Context7 | user | ✅ Producción | Pre-instalado vía arranque.ps1 |
| CWM.RoslynNavigator | user (opcional) | ✅ Producción | Selector complementos en arranque.ps1 |
| GitHub | user | 🟡 Evaluación | Requiere PAT personal |
| Jira/Atlassian | local | 🟡 Evaluación | Requiere API token + email |
| MS SQL Server | project (entornos no-prod) | 🔴 Riesgo | Solo lectura, mascarado de PII |
| Banner Comillas | user (corporativo) | 🟡 A diseñar | Auth Azure AD |

---

## 9. Referencias

- [Documentación oficial MCP](https://modelcontextprotocol.io/)
- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)
- `_estado/DECISIONES.md` — ADR sobre selección de MCPs en STIC.IA
- `.claude/CLAUDE_BASE_COMILLAS.md` §7 — Seguridad (gestión de secretos)
- `.claude/hooks/secret-scanner.ps1` — Implementación del bloqueo automático

---

*Guía v1.0 - Universidad Pontificia Comillas - STIC*
*Última actualización: 2026-05-08*
