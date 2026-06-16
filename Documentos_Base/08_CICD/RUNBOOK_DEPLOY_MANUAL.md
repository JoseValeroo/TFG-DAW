# Runbook deploy manual — Fase 0

> **Cuando usar este runbook**: proyecto en **Fase 0** (sin pipeline TFS). Deploy manual por humano tras `/verify` verde.
> Si tu proyecto esta en **Fase 1** o **Fase 2**, usa el RUNBOOK.md generado por `/cicd-init`.

---

## Pre-requisitos

- [ ] `/verify` 7 fases verde en local (build + diagnostics + anti-patterns + tests + security + format + diff review)
- [ ] Tests con cobertura adecuada (≥70% line, ≥60% branch — criterio Comillas)
- [ ] `appsettings.json` con `Production` correcto en el server destino (NO sobrescribir con tu Development)
- [ ] Secretos en `appsettings.Production.json` del server (NUNCA commiteados — ver `_duran/DEUDA_TECNICA.md` si aun no estan en Key Vault)

---

## Procedimiento (≤1 pagina, legible bajo presion)

### 1. Publicar artefacto en local

```powershell
# Desde la solucion .NET
dotnet publish src/<TuProyecto>.Web/<TuProyecto>.Web.csproj `
    --configuration Release `
    --output ./publish-output `
    --no-build
```

Comprobar que `./publish-output/` contiene DLLs + `web.config` (si IIS) + `appsettings.json`.

### 2. Backup pre-deploy en el server destino

RDP al server (DEV/DEMO/PROD). Como Administrator:

```powershell
$app = "<NombreApp>"  # ej: ComillasBecas
$iisPath = "C:\inetpub\wwwroot\$app"
$backupRoot = "D:\Backups\$app"
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$backupPath = Join-Path $backupRoot "backup-$stamp"

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
Copy-Item -Path $iisPath -Destination $backupPath -Recurse -Force
Write-Host "Backup creado: $backupPath"
```

### 3. Parar app pool

```powershell
$appPool = "<NombreAppPool>"  # ej: ComillasBecasAppPool
& "$env:WINDIR\System32\inetsrv\appcmd.exe" stop apppool $appPool
Start-Sleep -Seconds 3
```

### 4. Copiar publicacion al wwwroot

```powershell
# Limpiar (preserva el backup que ya hicimos en paso 2)
Remove-Item -Path "$iisPath\*" -Recurse -Force -Exclude "appsettings.Production.json","web.Production.config"

# Copiar publish-output al server (via SMB share o RDP copy/paste)
# Asumiendo que tienes los ficheros en C:\temp\publish-output\:
Copy-Item -Path "C:\temp\publish-output\*" -Destination $iisPath -Recurse -Force
```

> ⚠️ **NO sobrescribir** `appsettings.Production.json` ni `web.Production.config` del server destino. Esos contienen secretos del entorno.

### 5. Arrancar app pool

```powershell
& "$env:WINDIR\System32\inetsrv\appcmd.exe" start apppool $appPool
Start-Sleep -Seconds 5
```

### 6. Smoke test post-deploy

```powershell
# Desde el server (localhost) — bypass SSL check porque cert es para FQDN publico, no localhost
$callback = [System.Net.ServicePointManager]::ServerCertificateValidationCallback
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
try {
    $url = "https://localhost/<TuApp>/health/live"  # o equivalente
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
    if ($r.StatusCode -eq 200) {
        Write-Host "OK Smoke local: $url -> 200" -ForegroundColor Green
    } else {
        Write-Warning "Smoke local: $url -> $($r.StatusCode)"
    }
} finally {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $callback
}
```

Adicionalmente desde el navegador del dev (fuera del server) abrir `https://<env>.comillas.edu/<TuApp>/` y confirmar 200 con contenido esperado.

### 7. Si el smoke falla — rollback manual

```powershell
# Parar pool
& "$env:WINDIR\System32\inetsrv\appcmd.exe" stop apppool $appPool
Start-Sleep -Seconds 3

# Restaurar desde backup
Remove-Item -Path "$iisPath\*" -Recurse -Force -Exclude "appsettings.Production.json","web.Production.config"
Copy-Item -Path "$backupPath\*" -Destination $iisPath -Recurse -Force

# Re-arrancar pool
& "$env:WINDIR\System32\inetsrv\appcmd.exe" start apppool $appPool

# Investigar causa del fallo en logs antes de reintentar
```

### 8. Documentar el deploy

Actualizar `_duran/HISTORIAL_CAMBIOS.md`:

```markdown
## YYYY-MM-DD HH:MM — Deploy manual a <ENV>

- **Version**: <version o commit SHA>
- **Ejecutor**: <nombre>
- **Backup**: D:\Backups\<App>\backup-<timestamp>
- **Smoke**: OK / FAILED (con detalle si failed)
- **Notas**: <observaciones>
```

---

## Cuando migrar a Fase 1

Si haces deploys manuales **mas de 1 vez al mes** o el equipo crece a 2+ devs, considera promocionar a Fase 1:

```
claude /cicd-init  # detecta Fase 0 + reescribe a Fase 1 (idempotente)
```

Fase 1 anade automaticamente: build validation en PRs, `dotnet test` remoto, artefacto generado por TFS. El deploy sigue siendo manual pero ya no haces `dotnet publish` local — descargas el artefacto del build verde.

---

## Anti-patrones

- ❌ **Saltarse `/verify`** asumiendo que "el cambio es pequeño": la mayoria de deploys rotos en Fase 0 son por NO ejecutar `/verify` antes del push.
- ❌ **No hacer backup pre-deploy**: si algo falla, no tienes recovery. Backup es **OBLIGATORIO** incluso para "cambios pequeños".
- ❌ **Sobrescribir `appsettings.Production.json`**: contiene secretos del entorno. Si necesitas cambiar algo, edita el del server, NO copies tu local.
- ❌ **Hacer deploy a PROD sin pasar por DEMO antes**: aunque sea manual, mantener la cadena DEV → DEMO → PROD ayuda a detectar bugs.
- ❌ **Olvidar documentar en `HISTORIAL_CAMBIOS.md`**: si la app se rompe en 2 dias, nadie sabra que deploy lo causo.

---

*Plantilla del runbook deploy manual para Fase 0 — STIC.IA v3.11.0 (ADR-042 D11). `/cicd-init` la adapta con datos especificos del proyecto.*
