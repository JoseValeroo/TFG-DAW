# Fase 5: CI/CD y Deploy

## Objetivo

Automatizar integración continua y despliegues.

## Herramienta Principal

**Claude Code** - Generación de pipelines y scripts

---

## Estructura

```
05_CICD/
├── Pipelines/        # YAML de CI/CD
└── Infraestructura/  # ARM, Bicep, Terraform
```

---

## Checklist

- [ ] Crear pipeline de CI (build + test)
- [ ] Configurar pipeline de CD (deploy)
- [ ] Setup de Azure App Service
- [ ] Configurar Azure SQL Database
- [ ] Configurar Azure Key Vault
- [ ] Configurar Azure Blob Storage
- [ ] Crear scripts de infraestructura (ARM/Bicep)
- [ ] Documentar proceso de deploy

---

## Entornos

| Entorno | Propósito | Datos |
|---------|-----------|-------|
| Development | Desarrollo activo | Datos ficticios |
| Staging | Pruebas de aceptación | Datos anonimizados |
| Production | Usuarios reales | Datos reales |

Ver `Documentos_Base/03_Consideraciones_Comunes/` para ventanas de despliegue.

---

## Ejemplo Pipeline GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'
      - name: Restore
        run: dotnet restore
      - name: Build
        run: dotnet build --no-restore
      - name: Test
        run: dotnet test --no-build
```

---

## Enlaces

- [README principal](../README.md)
- [Anterior: Pruebas](../04_Pruebas/)
- [Siguiente: Documentación](../06_Documentacion/)
