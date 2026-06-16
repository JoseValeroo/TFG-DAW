# Tareas Pendientes - Comité Técnico

Lista de elementos a revisar y completar en la plantilla de proyecto.

---

## 1. Control de Versiones (Git)

### 1.1 Política de Commits
- [ ] Definir formato de mensaje de commit (Conventional Commits, etc.)
- [ ] Prefijos obligatorios: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- [ ] Longitud máxima de línea del mensaje
- [ ] Idioma de los commits (español/inglés)
- [ ] Referencia obligatoria a ticket/issue
- [ ] Ejemplo: `feat(auth): añadir login con Azure AD [#123]`

### 1.2 Estrategia de Branching
- [ ] Confirmar modelo: GitFlow, GitHub Flow, Trunk-based
- [ ] Nomenclatura de ramas: `feature/`, `bugfix/`, `hotfix/`, `release/`
- [ ] Rama principal: `main` o `master`
- [ ] Rama de desarrollo: `develop` (si aplica)
- [ ] Política de merge: squash, rebase, merge commit

### 1.3 Pull Requests
- [ ] Plantilla de PR (descripción, checklist, testing)
- [ ] Número mínimo de aprobaciones
- [ ] Revisores obligatorios por área
- [ ] Checks automáticos requeridos (CI, linting, tests)
- [ ] Política de resolución de conflictos

### 1.4 Protección de Ramas
- [ ] Ramas protegidas (main, develop)
- [ ] Requerir PR para merge
- [ ] Requerir revisiones aprobadas
- [ ] Requerir checks de CI pasados
- [ ] Prohibir push directo

---

## 2. Glosario de Comandos

### 2.1 Git
- [ ] Comandos básicos del día a día
- [ ] Comandos de branching
- [ ] Resolución de conflictos
- [ ] Comandos de emergencia (reset, revert, cherry-pick)
- [ ] Alias recomendados

### 2.2 .NET CLI
- [ ] Crear solución y proyectos
- [ ] Gestión de paquetes NuGet
- [ ] Build y publish
- [ ] Ejecución de tests
- [ ] Migraciones de base de datos

### 2.3 Docker
- [ ] Comandos básicos
- [ ] Docker Compose
- [ ] Limpieza de recursos
- [ ] Debugging de contenedores

### 2.4 Azure CLI
- [ ] Login y suscripciones
- [ ] Despliegue de recursos
- [ ] Key Vault
- [ ] App Service
- [ ] SQL Database

---

## 3. Convenciones de Código

### 3.1 Nombrado
- [ ] Clases: PascalCase
- [ ] Métodos: PascalCase
- [ ] Variables locales: camelCase
- [ ] Constantes: UPPER_SNAKE_CASE o PascalCase
- [ ] Interfaces: IPrefijo
- [ ] Archivos y carpetas

### 3.2 Estructura de Proyecto
- [ ] Organización de namespaces
- [ ] Ubicación de DTOs, ViewModels, etc.
- [ ] Separación de concerns
- [ ] Carpetas de recursos

### 3.3 Formateo
- [ ] EditorConfig estándar
- [ ] Configuración de IDE
- [ ] Reglas de análisis estático
- [ ] Excepciones permitidas

---

## 4. Archivos de Configuración

### 4.1 Obligatorios en Raíz
- [ ] `.gitignore` (plantilla .NET + IDE)
- [ ] `.editorconfig` (formato de código)
- [ ] `README.md` (documentación principal)
- [ ] `LICENSE` (si aplica)
- [ ] `.gitattributes` (line endings, LFS)

### 4.2 Opcionales/Recomendados
- [ ] `CONTRIBUTING.md` (guía de contribución)
- [ ] `SECURITY.md` (política de seguridad)
- [ ] `CHANGELOG.md` (historial de cambios)
- [ ] `.github/` o `.azuredevops/` (plantillas, workflows)
- [ ] `docker-compose.yml`
- [ ] `Directory.Build.props` (configuración centralizada)

### 4.3 Plantillas de Issues/PR
- [ ] Plantilla de bug report
- [ ] Plantilla de feature request
- [ ] Plantilla de pull request
- [ ] Labels estándar

---

## 5. Calidad de Código

### 5.1 Análisis Estático
- [ ] Herramienta: SonarQube, Roslyn Analyzers, etc.
- [ ] Reglas activas/desactivadas
- [ ] Umbrales de calidad (quality gates)
- [ ] Integración con CI/CD

### 5.2 Formateo Automático
- [ ] dotnet format
- [ ] Pre-commit hooks
- [ ] Verificación en CI

### 5.3 Code Review
- [ ] Checklist de revisión
- [ ] Criterios de aprobación
- [ ] Qué buscar: seguridad, rendimiento, mantenibilidad
- [ ] Feedback constructivo

---

## 6. Testing

### 6.1 Convenciones
- [ ] Nomenclatura de tests: `Metodo_Escenario_ResultadoEsperado`
- [ ] Estructura AAA: Arrange, Act, Assert
- [ ] Ubicación de tests (mismo proyecto o separado)
- [ ] Mocking: Moq, NSubstitute, etc.

### 6.2 Cobertura
- [ ] Umbral mínimo: 70%
- [ ] Herramienta de cobertura
- [ ] Reportes y visualización
- [ ] Exclusiones permitidas

### 6.3 Tipos de Tests
- [ ] Unitarios: obligatorios
- [ ] Integración: obligatorios para endpoints críticos
- [ ] E2E: recomendados para flujos principales
- [ ] Performance: según necesidad

---

## 7. Documentación

### 7.1 Código
- [ ] XML comments en APIs públicas
- [ ] README por proyecto/módulo
- [ ] Documentación de arquitectura (ADRs)
- [ ] Diagramas: C4, secuencia, etc.

### 7.2 API
- [ ] Swagger/OpenAPI
- [ ] Ejemplos de uso
- [ ] Códigos de error
- [ ] Autenticación

### 7.3 Operaciones
- [ ] Runbooks
- [ ] Troubleshooting guides
- [ ] Procedimientos de backup/restore
- [ ] Contactos de escalado

---

## 8. Seguridad

### 8.1 Secretos
- [ ] Nunca en código fuente
- [ ] Azure Key Vault obligatorio
- [ ] Rotación de secretos
- [ ] Acceso por entorno

### 8.2 Dependencias
- [ ] Escaneo automático (Dependabot, Snyk)
- [ ] Política de actualización
- [ ] Vulnerabilidades críticas: SLA de resolución

### 8.3 OWASP
- [ ] Checklist Top 10 incluido
- [ ] Validación de inputs
- [ ] Sanitización de outputs
- [ ] Headers de seguridad

---

## 9. CI/CD

### 9.1 Pipeline de CI
- [ ] Trigger: PR, push a develop/main
- [ ] Steps: restore, build, test, analyze
- [ ] Artefactos generados
- [ ] Notificaciones de fallo

### 9.2 Pipeline de CD
- [ ] Entornos: dev, staging, prod
- [ ] Aprobaciones manuales
- [ ] Rollback automático
- [ ] Smoke tests post-deploy

### 9.3 Infraestructura como Código
- [ ] ARM, Bicep o Terraform
- [ ] Versionado junto al código
- [ ] Revisión de cambios de infra

---

## 10. Herramientas IA

### 10.1 Claude Code
- [ ] Contexto de proyecto (Documentos_Base)
- [ ] Prompts recomendados por fase
- [ ] Limitaciones y advertencias
- [ ] Revisión humana obligatoria

### 10.2 GitHub Copilot
- [ ] Configuración recomendada
- [ ] Buenas prácticas de uso
- [ ] Qué no hacer con Copilot
- [ ] Revisión de sugerencias

### 10.3 Políticas de IA
- [ ] Todo código IA requiere code review
- [ ] No datos sensibles en prompts
- [ ] Registro de uso de IA (opcional)
- [ ] Propiedad intelectual

---

## 11. Entorno de Desarrollo

### 11.1 Requisitos
- [ ] Versiones de SDK/runtime
- [ ] IDEs soportados
- [ ] Extensiones recomendadas
- [ ] Configuración de Docker local

### 11.2 Onboarding
- [ ] Guía de setup paso a paso
- [ ] Accesos necesarios (repos, Azure, etc.)
- [ ] Contactos de ayuda
- [ ] FAQs comunes

---

## 12. Pendientes por Definir

### Alta Prioridad
- [ ] **Política de commits** - formato y convenciones
- [ ] **Glosario de comandos** - referencia rápida
- [ ] **.gitignore estándar** - plantilla completa
- [ ] **.editorconfig** - reglas de formato
- [ ] **Plantilla de PR** - checklist de revisión

### Media Prioridad
- [ ] Plantillas de issues
- [ ] Labels estándar para issues
- [ ] Guía de code review
- [ ] ADR template (Architecture Decision Records)

### Baja Prioridad
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] Alias de git recomendados
- [ ] Scripts de utilidad

---

## Asignación de Tareas

| Área | Responsable | Fecha límite |
|------|-------------|--------------|
| Política de commits | [Por asignar] | [Por definir] |
| Glosario de comandos | [Por asignar] | [Por definir] |
| Convenciones de código | [Por asignar] | [Por definir] |
| Archivos de configuración | [Por asignar] | [Por definir] |
| Plantillas Git | [Por asignar] | [Por definir] |

---

## Próximos Pasos

1. Revisar esta lista en reunión de comité técnico
2. Priorizar elementos pendientes
3. Asignar responsables
4. Establecer fechas límite
5. Crear los documentos/archivos correspondientes
6. Integrar en la plantilla de proyecto
7. Validar con proyecto piloto

---

**Versión:** 1.0
**Fecha:** Diciembre 2025
**Responsable:** Comité Técnico OTD
