# Documento de Requerimientos

## Información del Proyecto

**Proyecto:** `[Nombre del proyecto]`
**Versión del Documento:** `1.0`
**Fecha:** `YYYY-MM-DD`
**Autor:** `[Nombre]`
**Estado:** `[Borrador / En Revisión / Aprobado]`

---

## Índice

1. [Introducción](#introducción)
2. [Alcance](#alcance)
3. [Requerimientos Funcionales](#requerimientos-funcionales)
4. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
5. [Casos de Uso](#casos-de-uso)
6. [Restricciones](#restricciones)
7. [Dependencias](#dependencias)

---

## 1. Introducción

### 1.1 Propósito
```
[Describir el propósito del sistema]
```

### 1.2 Alcance del Sistema
```
[Describir qué hará y qué NO hará el sistema]
```

### 1.3 Definiciones y Acrónimos

| Término | Definición |
|---------|------------|
| [Término] | [Definición] |
| API | Application Programming Interface |
| DTO | Data Transfer Object |

---

## 2. Alcance

### 2.1 Funcionalidades Incluidas
- [x] [Funcionalidad 1]
- [x] [Funcionalidad 2]
- [x] [Funcionalidad 3]

### 2.2 Funcionalidades Excluidas
- [Funcionalidad no incluida 1]
- [Funcionalidad no incluida 2]

### 2.3 Fases del Proyecto

**Fase 1 (MVP):**
- [ ] [Funcionalidad esencial 1]
- [ ] [Funcionalidad esencial 2]

**Fase 2:**
- [ ] [Funcionalidad adicional 1]
- [ ] [Funcionalidad adicional 2]

---

## 3. Requerimientos Funcionales

### RF-001: [Nombre del Requerimiento]

**Prioridad:** `[Alta / Media / Baja]`
**Estado:** `[Pendiente / En Desarrollo / Completado]`

**Descripción:**
```
[Descripción detallada del requerimiento]
```

**Criterios de Aceptación:**
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

**Dependencias:**
- [RF-XXX] [Descripción dependencia]

**Notas Técnicas:**
```
[Consideraciones técnicas, APIs involucradas, etc.]
```

---

### RF-002: [Nombre del Requerimiento]

**Prioridad:** `[Alta / Media / Baja]`
**Estado:** `[Pendiente / En Desarrollo / Completado]`

**Descripción:**
```
[Descripción detallada]
```

**Criterios de Aceptación:**
- [ ] Criterio 1
- [ ] Criterio 2

---

## 4. Requerimientos No Funcionales

### RNF-001: Rendimiento

**Descripción:**
```
[Ej: El sistema debe responder en menos de 2 segundos para el 95% de las peticiones]
```

**Medible:** `[Sí / No]`
**Métrica:** `[Cómo se medirá]`

---

### RNF-002: Seguridad

**Descripción:**
```
[Ej: Autenticación mediante JWT, encriptación de datos sensibles]
```

**Estándares:** `[OWASP, ISO 27001, etc.]`

Ver `Documentos_Base/01_Estructura_Tecnica/` para requisitos de seguridad OTD.

---

### RNF-003: Escalabilidad

**Descripción:**
```
[Ej: Soportar hasta 1000 usuarios concurrentes]
```

---

### RNF-004: Disponibilidad

**Descripción:**
```
[Ej: 99.9% uptime]
```

---

## 5. Casos de Uso

### CU-001: [Nombre del Caso de Uso]

**Actor Principal:** `[Usuario / Admin / Sistema]`
**Precondiciones:**
- Usuario autenticado
- [Otras precondiciones]

**Flujo Principal:**
1. El usuario accede a [pantalla/sección]
2. El usuario introduce [datos]
3. El sistema valida [datos]
4. El sistema [acción]
5. El sistema muestra [resultado]

**Flujos Alternativos:**

**A1: Error de validación**
1. El sistema muestra mensaje de error
2. El usuario corrige los datos
3. Continúa en paso 3 del flujo principal

**Postcondiciones:**
- [Estado del sistema después de ejecutar el caso de uso]

---

## 6. Restricciones

### 6.1 Técnicas
- Stack: .NET 8, C#, Dapper (recomendado)
- Base de datos: SQL Server 2017 (14.0)
- Intercalación: SQL_Latin1_General_CP1250_CI_AS
- Cloud: Azure
- Secretos: Azure Key Vault (obligatorio)
- Archivos: Azure Blob Storage (obligatorio)
- Caché: Redis

### 6.2 Organizacionales
- Metodología: Scrum/Kanban
- Herramientas IA: Claude Code, GitHub Copilot
- Code Review obligatorio para código generado por IA

### 6.3 Normativas
- RGPD / LOPDGDD
- [Otras normativas aplicables]

---

## 7. Dependencias

### 7.1 Integraciones Externas

| Servicio | Descripción | Proveedor | Documentación |
|----------|-------------|-----------|---------------|
| [API Externa 1] | [Descripción] | [Proveedor] | [URL] |
| [API Externa 2] | [Descripción] | [Proveedor] | [URL] |

### 7.2 Librerías y Frameworks

| Librería | Versión | Propósito |
|----------|---------|-----------|
| Dapper | 2.x | Micro-ORM para acceso a datos (recomendado) |
| Microsoft.Data.SqlClient | Latest | ADO.NET (alternativa) |
| [Otra librería] | [Versión] | [Propósito] |

---

## Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | YYYY-MM-DD | [Nombre] | Versión inicial |
| | | | |

---

## Aprobaciones

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Jefe de Proyecto | | | |
| Cliente | | | |
| Arquitecto | | | |

---

**Próxima revisión:** `[YYYY-MM-DD]`
