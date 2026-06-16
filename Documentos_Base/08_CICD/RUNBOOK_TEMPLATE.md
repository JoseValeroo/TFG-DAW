# Runbook operacional CI/CD — `{{PROYECTO_NOMBRE}}`

> **Cuando usar este runbook**: proyecto en **Fase 2** con pipeline completo CD.
> Si tu proyecto esta en **Fase 0**, usa `RUNBOOK_DEPLOY_MANUAL.md`.
> Si esta en **Fase 1**, este runbook aun no aplica completo (no hay CD).
>
> **Politica**: cada seccion ≤1 pagina, legible bajo presion. Sin parrafos largos.
> Este es **plantilla**. `/cicd-init` lo rellena con datos del proyecto. Los `{{placeholders}}` se reemplazan al generar el runbook concreto.

---

## 1. Build falla en CI

**Sintomas tipicos**: `dotnet build` / `npm run build` rojo, tests rojos, lint con error, coverage gate incumplido (line <70% o branch <60%).

**Diagnostico**:
1. Abrir el build en TFS UI: `{{PIPELINE_URL}}`
2. Bajar al primer step rojo. Leer las ultimas ~30 lineas del log.
3. ¿Es bug del codigo? → fix + commit + push (re-encola CI automatico)
4. ¿Es infra (agente offline, NuGet/npm registry caido, disco lleno)? → ver seccion 5 "Contactos y escalation"

**Causas frecuentes en Comillas** (orden de probabilidad):
- Test que pasa local porque accede a `localhost:5000` real (R12.4)
- `appsettings.Development.json` versionado por error con credenciales reales
- Path absoluto en `vite.config.ts` apuntando a otro repo del filesystem del dev (R12.1)
- `package-lock.json` desfasado respecto a `package.json` (olvidaste commitear lockfile tras `npm install`)
- SDK .NET no instalado en el agente LADYADA para el `<TargetFramework>` exigido
- Coverage gate incumplido: cobertura de lineas/branches por debajo del umbral (mira summary, exit 3)

**Re-encolar**: tras fix, hacer `git push` dispara CI nuevo. **NO** encolar manualmente desde TFS UI (memoria `feedback_no_manual_queue`).

---

## 1b. El build NO se encola tras el push (R7)

**Sintoma**: haces `git push` y **el build ni aparece** en TFS (no es que falle: no arranca). Tipico cuando el commit **solo toca subcarpetas profundas** (ej. `04_Pruebas/**`, recursos anidados).

**Causa**: bug confirmado de TFS 2020 con `trigger.paths.include` y `settingsSourceType=2` — los patrones `'<dir>/**'` no matchean subdirectorios profundos (R7). El YAML del proyecto ya emite el doble patron `'<dir>/**'` + `'<dir>/**/*'` como defensa, pero la deteccion sigue siendo flaky para rutas muy anidadas.

**Que NO es**: no confundir con "build encolado pero parado en `notStarted`/`Checkpoint.Authorization`" (eso es permiso de pool, TEC-003, ver seccion 5).

**Workaround — encolar manualmente por REST** (excepcion legitima a la regla "no encolar manual", que aplica solo al flujo normal):

```powershell
# Requiere PAT o --negotiate. Sustituir {{TFS_COLECCION_PROYECTO_URL}} y definitionId.
$body = @{ definition = @{ id = {{PIPELINE_DEFINITION_ID}} }; sourceBranch = 'refs/heads/{{RAMA_BASE}}' } | ConvertTo-Json
Invoke-RestMethod -Uri "{{TFS_COLECCION_PROYECTO_URL}}/_apis/build/builds?api-version=6.0" `
  -Method Post -UseDefaultCredentials -ContentType 'application/json' -Body $body
```

**Fix de fondo**: revisar que el commit toque tambien algun path que SI dispare (codigo en `{{SRC_DIR}}/`), o aceptar el encolado manual para pushes de solo-tests.

---

## 2. Deploy a DEMO falla

**Sintomas tipicos**: stage `Build` verde, stage `DeployDemo` rojo.

**Servidor DEMO**: `{{DEMO_SERVER_FQDN}}` (computer name: `{{DEMO_COMPUTER_NAME}}`)

**Diagnostico**:
1. Mirar el log del step `IISWebAppDeploymentOnMachineGroup@0`
2. Errores tipicos:
   - `Could not find a part of the path '<wwwroot>'` → el path no existe; pedir a Sistemas crear el IIS site
   - `Access to the path is denied` → la cuenta del agente (`NT AUTHORITY\SYSTEM` por convencion) no tiene permisos; pedir a Sistemas
   - `One or more files locked` → en .NET ASP.NET Core in-process falta `TakeAppOfflineFlag: true` (R10). Editar YAML y re-encolar.
   - `The remote server returned an error: (401) Unauthorized` en MSDeploy → credencial del agente caducada
   - Smoke test `https://{{DEMO_FQDN}}/...` 404 o timeout → ver "Verificacion alternativa" abajo

**Verificacion post-fix**: el smoke test del propio pipeline confirma (estricto si .NET API, best-effort si SPA — emite warning + diagnostico sin throw, R11).

**Verificacion alternativa por el humano** (cuando smoke best-effort emite warning): abrir `{{DEMO_URL}}` desde tu navegador (NO desde el server, hairpin NAT). Si carga 200 con contenido esperado → el deploy esta verde aunque el smoke automatico no pudiera verificarlo.

---

## 3. Deploy a PROD falla

**Sintomas tipicos**: stage `DeployProd` rojo tras gate de aprobacion del grupo `{{PROD_APPROVERS_GROUP}}`.

**Servidores PROD**: `{{PROD_SERVER_A}}` + `{{PROD_SERVER_B}}` (rolling deploy, 2 en serie).

**Rollback automatico**: si el smoke test post-deploy falla, el step `condition: failed()` del job restaura el backup pre-deploy automaticamente (R15). El log mostrara "Rollback ejecutado" y el job termina rojo. El sitio queda en la version PREVIA al deploy.

**Si el rollback automatico tambien falla** (raro pero documentado):

1. RDP al server PROD: `{{PROD_SERVER_FQDN}}`
2. Ubicar el backup mas reciente: `dir D:\Backups\{{APP_NAME}}\backup-*` (ordenar por fecha)
3. Leer el marker para confirmar el BuildId: `type D:\Backups\{{APP_NAME}}\backup-<BuildId>\_backup-metadata.txt`
4. Parar el app pool: `appcmd stop apppool {{APP_POOL}}`
5. Borrar el wwwroot actual (preserva `appsettings.Production.json`):
   ```
   pushd C:\inetpub\wwwroot\{{APP_NAME}}
   for /f "delims=" %i in ('dir /b /a-d ^| findstr /v /i "appsettings.Production.json web.Production.config"') do del /Q "%i"
   ```
6. Restaurar: `xcopy /E /Y D:\Backups\{{APP_NAME}}\backup-<BuildId>\* C:\inetpub\wwwroot\{{APP_NAME}}\`
7. Re-arrancar pool: `appcmd start apppool {{APP_POOL}}`
8. Verificar 200 desde un navegador externo (NO desde el server por hairpin NAT)
9. Si el segundo server PROD (`{{PROD_SERVER_B}}`) tambien quedo afectado por el rolling deploy, repetir pasos 1-8 alli
10. Comunicar al equipo + escribir post-mortem en `_duran/INCIDENTES.md`

---

## 4. App caida tras deploy verde

**Sintomas tipicos**: build verde, deploy verde, smoke verde, pero los usuarios reportan 500/503.

**Distinguir**:
- ¿La app responde a `/health/ready`? Si si → es bug de la app, NO del deploy. Hotfix en codigo.
- ¿Hay dependencia externa caida (Oracle BIPublisher, Azure AD, SQL Server)? → mirar logs de la app, no es problema del pipeline. Avisar a Sistemas si es infra Comillas.
- ¿Es un secreto vacio o rotado mal? → ir a TFS UI Variable Group `{{PIPELINE_NAME}}-secrets`, verificar valores.

**Reciclar pool sin volver al backup** (si la app simplemente esta confundida con cache/conexiones):

```
appcmd recycle apppool {{APP_POOL}}
```

**Si todo lo anterior falla**: rollback manual (ver seccion 3).

---

## 5. Contactos y escalation

| Tipo de problema | Contacto | Como |
|---|---|---|
| Agente offline / capability mal configurada | Sistemas Comillas | `{{CONTACTO_SISTEMAS}}` |
| Permisos TFS (pool, project, environment) | Admin del pool BUILDERS | `{{CONTACTO_ADMIN_POOL}}` |
| Bug de la app / codigo | `{{RESPONSABLE_TECNICO}}` | Teams / email |
| Secretos / rotaciones | `{{RESPONSABLE_SECRETOS}}` (ver `SECRETOS.md` si existe) | Teams |
| Decision de rollback PROD bajo presion | `{{JEFE_PROYECTO}}` + `{{RESPONSABLE_TECNICO}}` | Teams ASAP |

---

## 6. Backups

- **Ubicacion**: `{{BACKUP_ROOT}}` en cada server destino (tipicamente `D:\Backups\{{APP_NAME}}\`)
- **Formato**: `backup-<BuildId>/` con `_backup-metadata.txt` dentro (BuildId + BuildNumber + SourceVersion + Timestamp)
- **Retencion**: 7 dias automatica (step `condition: always()` del job de deploy borra los antiguos, R17)
- **Builds que llegan a PROD**: marcar manualmente "Retain indefinitely" en TFS UI por build, para que `retentionRules` del pipeline no los borre
- **Restaurar un backup especifico**: ver seccion 3 paso a paso

---

*Runbook generado por `/cicd-init` v3.11.0+. Mantener al dia: cuando aparezca un nuevo escenario de fallo, anadir seccion. Cuando una seccion quede obsoleta, archivarla en `RUNBOOK_HISTORICO.md`.*
