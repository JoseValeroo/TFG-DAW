# Documentacion Tecnica - [Nombre del Proyecto]

> **Instrucciones**: Esta plantilla define la estructura de documentacion tecnica.
> Completar cada seccion con la informacion especifica del proyecto.
> Eliminar las instrucciones (texto en cursiva) antes de publicar.

---

## Informacion del Documento

| Campo | Valor |
|-------|-------|
| **Proyecto** | [Nombre] |
| **Version documento** | [X.Y] |
| **Fecha** | [YYYY-MM-DD] |
| **Autor** | [Nombre] |
| **Estado** | [Borrador/Revision/Aprobado] |

---

## Control de Versiones

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | [YYYY-MM-DD] | [Nombre] | Version inicial |

---

## 1. Introduccion

### 1.1 Proposito
*Describir el proposito de este documento y a quien va dirigido.*

[Texto]

### 1.2 Alcance
*Describir que cubre y que no cubre esta documentacion.*

[Texto]

### 1.3 Definiciones y Acronimos

| Termino | Definicion |
|---------|------------|
| [Termino] | [Definicion] |

---

## 2. Vision General del Sistema

### 2.1 Descripcion
*Descripcion general del sistema y su proposito de negocio.*

[Texto]

### 2.2 Contexto
*Donde encaja este sistema en el ecosistema de la organizacion.*

```
[Diagrama de contexto]
```

### 2.3 Stakeholders

| Rol | Responsabilidad | Contacto |
|-----|-----------------|----------|
| [Rol] | [Responsabilidad] | [Email] |

---

## 3. Arquitectura

### 3.1 Diagrama de Arquitectura

```
[Diagrama C4 - Nivel Contenedor]

┌─────────────────────────────────────────────────────┐
│                    [Sistema]                         │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐                │
│  │   Web App   │───▶│    API      │                │
│  └─────────────┘    └──────┬──────┘                │
│                            │                        │
│                     ┌──────▼──────┐                │
│                     │   Database  │                │
│                     └─────────────┘                │
└─────────────────────────────────────────────────────┘
```

### 3.2 Componentes Principales

| Componente | Tecnologia | Responsabilidad |
|------------|------------|-----------------|
| Frontend | [Tech] | [Descripcion] |
| API | [Tech] | [Descripcion] |
| Base de datos | [Tech] | [Descripcion] |

### 3.3 Patrones Utilizados
*Describir patrones arquitectonicos y de diseno utilizados.*

- **Patron 1**: [Descripcion y justificacion]
- **Patron 2**: [Descripcion y justificacion]

### 3.4 Decisiones Arquitectonicas
*Referencia a ADRs importantes. Ver `_duran/DECISIONES.md`*

| ADR | Titulo | Impacto |
|-----|--------|---------|
| ADR-001 | [Titulo] | [Impacto] |

---

## 4. Stack Tecnologico

### 4.1 Backend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| .NET | [8.0] | Framework principal |
| ASP.NET Core | [8.0] | Web API |
| Dapper | [X.Y] | Acceso a datos |

### 4.2 Frontend

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| [Tech] | [X.Y] | [Proposito] |

### 4.3 Base de Datos

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| SQL Server | [2017] | Base de datos principal |

### 4.4 Infraestructura

| Servicio | Proposito |
|----------|-----------|
| Azure App Service | Hosting aplicacion |
| Azure SQL Database | Base de datos |
| Azure Key Vault | Gestion de secretos |
| Azure Blob Storage | Almacenamiento de archivos |
| Redis | Cache distribuida |

---

## 5. Modelo de Datos

### 5.1 Diagrama Entidad-Relacion

```
[Diagrama ER simplificado]
```

### 5.2 Tablas Principales

#### Tabla: [Nombre]

| Columna | Tipo | Descripcion | Constraints |
|---------|------|-------------|-------------|
| Id | int | Identificador | PK, Identity |
| [Campo] | [Tipo] | [Descripcion] | [Constraints] |

### 5.3 Stored Procedures Criticos

| Nombre | Proposito | Parametros |
|--------|-----------|------------|
| [sp_Nombre] | [Descripcion] | [Params] |

---

## 6. API

### 6.1 Autenticacion
*Describir mecanismo de autenticacion.*

[Azure AD / JWT / etc.]

### 6.2 Endpoints Principales

#### [Modulo]

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | /api/[recurso] | [Descripcion] | [Si/No] |
| POST | /api/[recurso] | [Descripcion] | [Si/No] |

### 6.3 Documentacion Swagger
*Referencia a Swagger UI.*

URL: `[URL]/swagger`

---

## 7. Seguridad

### 7.1 Autenticacion y Autorizacion

| Aspecto | Implementacion |
|---------|----------------|
| Autenticacion | Azure AD |
| Autorizacion | Roles/Claims |
| Tokens | JWT |

### 7.2 Gestion de Secretos

| Secreto | Ubicacion | Rotacion |
|---------|-----------|----------|
| Connection strings | Key Vault | [Frecuencia] |
| API Keys | Key Vault | [Frecuencia] |

### 7.3 Checklist OWASP
*Referencia a cumplimiento OWASP. Ver `Documentos_Base/01_Estructura_Tecnica/`*

---

## 8. Integraciones

### 8.1 Sistemas Integrados

| Sistema | Tipo | Direccion | Protocolo |
|---------|------|-----------|-----------|
| [Sistema] | [Interno/Externo] | [Consumo/Exposicion] | [REST/SOAP/etc] |

### 8.2 Detalle de Integracion: [Sistema]

**Proposito**: [Descripcion]

**Endpoints utilizados**:
| Endpoint | Metodo | Proposito |
|----------|--------|-----------|
| [URL] | [GET/POST] | [Descripcion] |

**Manejo de errores**: [Descripcion]

**Timeout/Reintentos**: [Configuracion]

---

## 9. Despliegue

### 9.1 Entornos

| Entorno | URL | Proposito |
|---------|-----|-----------|
| Development | [URL] | Desarrollo |
| Staging | [URL] | Pruebas |
| Production | [URL] | Produccion |

### 9.2 Pipeline CI/CD

```
[Diagrama de pipeline]

Commit → Build → Test → Deploy Dev → Deploy Staging → Aprobacion → Deploy Prod
```

### 9.3 Requisitos de Despliegue

| Requisito | Valor |
|-----------|-------|
| Runtime | .NET 8 |
| Memoria | [X] GB |
| CPU | [X] cores |

---

## 10. Operaciones

### 10.1 Monitoreo

| Herramienta | Proposito | Dashboard |
|-------------|-----------|-----------|
| Application Insights | APM, Logs | [URL] |
| Azure Monitor | Metricas infra | [URL] |

### 10.2 Alertas Configuradas

| Alerta | Condicion | Accion |
|--------|-----------|--------|
| CPU > 80% | 5 min consecutivos | Email a [equipo] |
| Errores > 10/min | Instantaneo | [Accion] |

### 10.3 Backup y Recuperacion

| Elemento | Frecuencia | Retencion | Procedimiento |
|----------|------------|-----------|---------------|
| Base de datos | [Frecuencia] | [Dias] | [Referencia] |

---

## 11. Troubleshooting

### 11.1 Problemas Conocidos

| Problema | Sintomas | Solucion |
|----------|----------|----------|
| [Problema] | [Sintomas] | [Pasos solucion] |

### 11.2 Logs

| Log | Ubicacion | Proposito |
|-----|-----------|-----------|
| Aplicacion | Application Insights | Errores, traces |
| Auditoria | [Tabla/Archivo] | Acciones usuario |

---

## Anexos

### A. Glosario Tecnico

| Termino | Definicion |
|---------|------------|
| [Termino] | [Definicion] |

### B. Referencias

- [Documento 1](URL)
- [Documento 2](URL)

---

**Fin del documento**
