# Checklist de Inicio de Proyecto

Usar esta lista al comenzar un nuevo proyecto con desarrollo asistido por IA.

---

## Pre-Proyecto

### Configuración Inicial
- [ ] Copiar plantilla de proyecto a nuevo directorio
- [ ] Renombrar carpeta con nombre del proyecto
- [ ] Configurar repositorio Git
- [ ] Invitar al equipo al repositorio

### Documentación Base
- [ ] Revisar `Documentos_Base/` y adaptarlos si es necesario
- [ ] Crear documento de requerimientos inicial
- [ ] Documentar transcripciones de reuniones iniciales
- [ ] Definir historias de usuario prioritarias

---

## Configuración de Herramientas IA

### Claude Code
- [ ] Verificar acceso a Claude Code
- [ ] Revisar Documentos_Base (Claude los lee automáticamente)

### GitHub Copilot
- [ ] Activar Copilot en Visual Studio
- [ ] Configurar preferencias de Copilot
- [ ] Probar sugerencias básicas

---

## Fase 1 - Diseño

- [ ] Analizar requerimientos funcionales con Claude
- [ ] Diseñar arquitectura del proyecto
- [ ] Crear modelos de datos iniciales
- [ ] Generar DTOs necesarios
- [ ] Documentar decisiones arquitectónicas
- [ ] Revisar diseño con jefe de proyecto

**Carpeta:** `01_Diseño/`

---

## Fase 2 - Configuración del Entorno

- [ ] Generar scaffolding del proyecto .NET
- [ ] Configurar dependencias NuGet
- [ ] Crear Dockerfile si es necesario
- [ ] Configurar appsettings.json
- [ ] Setup de base de datos local
- [ ] Verificar que el proyecto compila

**Carpeta:** `02_Entorno/`

---

## Fase 3 - Desarrollo

- [ ] Implementar estructura de capas
- [ ] Crear controllers base
- [ ] Implementar servicios de negocio
- [ ] Crear repositorios (Dapper recomendado)
- [ ] Configurar inyección de dependencias
- [ ] Revisión de código con Claude

**Carpeta:** `03_Desarrollo/`

---

## Fase 4 - Pruebas

- [ ] Crear proyecto de pruebas (xUnit)
- [ ] Generar pruebas unitarias
- [ ] Implementar pruebas de integración
- [ ] Configurar mocks necesarios
- [ ] Analizar cobertura de código (min 70%)
- [ ] Documentar casos de prueba

**Carpeta:** `04_Pruebas/`

---

## Fase 5 - CI/CD

- [ ] Crear pipeline de CI/CD (YAML)
- [ ] Configurar build automatizado
- [ ] Configurar ejecución de tests
- [ ] Setup de deploy a entorno de desarrollo
- [ ] Setup de deploy a producción
- [ ] Documentar proceso de deploy

**Carpeta:** `05_CICD/`

---

## Fase 6 - Documentación

- [ ] Generar README técnico
- [ ] Documentar endpoints de API (Swagger)
- [ ] Crear manual de instalación
- [ ] Crear manual de despliegue
- [ ] Documentar variables de configuración
- [ ] Generar changelog inicial

**Carpeta:** `06_Documentacion/`

---

## Fase 7 - UAP (Unidad de Atención Prioritaria)

- [ ] Definir niveles de soporte (L1, L2, L3)
- [ ] Documentar clasificación de incidencias
- [ ] Crear runbook de operaciones
- [ ] Configurar contactos de escalado
- [ ] Procedimiento de backup/restore

**Carpeta:** `07_UAP/`

---

## Seguridad (Obligatorio)

- [ ] Revisar que no hay credenciales en código
- [ ] Configurar secretos en Azure Key Vault
- [ ] Implementar code review obligatorio
- [ ] Configurar análisis de vulnerabilidades (OWASP)
- [ ] Azure Blob Storage para archivos
- [ ] Redis para caché distribuida

Ver `Documentos_Base/01_Estructura_Tecnica/` para requisitos completos.

---

## Control de Calidad

- [ ] Configurar métricas de código
- [ ] Establecer umbrales de cobertura (70% mínimo)
- [ ] Configurar análisis estático de código
- [ ] Documentar estándares de codificación

---

## Notas

### Fecha de Inicio: `[YYYY-MM-DD]`
### Completado por: `[Nombre]`
### Observaciones:

```
[Escribe aquí cualquier observación o desviación del proceso estándar]
```

---

**Última actualización:** [Fecha]
**Estado del proyecto:** [Iniciación / En Progreso / Completado]
