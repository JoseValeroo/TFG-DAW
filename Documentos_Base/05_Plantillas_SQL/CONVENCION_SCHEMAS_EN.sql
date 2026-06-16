-- =============================================
-- SCHEMA CONVENTIONS
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- This document defines the recommended schema
-- structure for organizing database objects
-- =============================================


-- #############################################
-- 1. ORGANIZATION PRINCIPLES
-- #############################################

/*
Schemas in SQL Server allow:
  ✓ Group objects by functional domain
  ✓ Apply permissions at schema level
  ✓ Avoid name collisions
  ✓ Facilitate maintenance
  ✓ Improve implicit documentation

NAMING CONVENTION:
  - Use lowercase
  - Short and descriptive names
  - No prefixes or suffixes
  - Represent business domain
*/


-- #############################################
-- 2. RECOMMENDED SCHEMAS
-- #############################################

-- =============================================
-- SCHEMA: dbo (default)
-- Use: Common objects shared across domains
-- =============================================
-- Already exists by default
-- Contains:
--   - Shared catalog tables (TipoDocumento, Pais, etc.)
--   - Utility functions (fn_CalcularEdad, fn_GetCurrentUser)
--   - Common stored procedures
--   - Application configuration tables
--   - Audit/log tables

-- =============================================
-- SCHEMA: academico
-- Use: Academic management
-- =============================================
CREATE SCHEMA [academico] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Estudiante, Profesor, Carrera, Facultad
  - Matricula, Asignatura, Horario
  - Calificacion, Expediente
  - Periodo, CursoAcademico
*/

-- =============================================
-- SCHEMA: financiero
-- Use: Financial and accounting management
-- =============================================
CREATE SCHEMA [financiero] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Factura, LineaFactura
  - Pago, FormaPago
  - Cuenta, Movimiento
  - Presupuesto, PartidaPresupuestaria
  - Beca, SolicitudBeca
*/

-- =============================================
-- SCHEMA: rrhh
-- Use: Human Resources
-- =============================================
CREATE SCHEMA [rrhh] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Empleado, Contrato
  - Departamento, Puesto
  - Nomina, Ausencia
  - Evaluacion
*/

-- =============================================
-- SCHEMA: seguridad
-- Use: Authentication and authorization
-- =============================================
CREATE SCHEMA [seguridad] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Usuario, Rol, Permiso
  - UsuarioRol, RolPermiso
  - SesionUsuario, TokenAcceso
  - AuditLogin
*/

-- =============================================
-- SCHEMA: comunicacion
-- Use: Notifications and messaging
-- =============================================
CREATE SCHEMA [comunicacion] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Notificacion, PlantillaEmail
  - MensajeInterno, Adjunto
  - ColaEnvio, LogEnvio
*/

-- =============================================
-- SCHEMA: integracion
-- Use: Integration with external systems
-- =============================================
CREATE SCHEMA [integracion] AUTHORIZATION [dbo];
GO

/*
Contains:
  - LogIntegracion
  - MapeoCodigos
  - ColaSincronizacion
  - ConfiguracionExterna
*/

-- =============================================
-- SCHEMA: staging
-- Use: Temporary data for loading/ETL
-- =============================================
CREATE SCHEMA [staging] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Temporary import tables
  - Data under validation
  - Processing queues

⚠️ Data in staging is TEMPORARY
*/

-- =============================================
-- SCHEMA: archivo
-- Use: Historical/archived data
-- =============================================
CREATE SCHEMA [archivo] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Archived versions of main tables
  - Old data that is no longer active
  - Historical data for reports
*/

-- =============================================
-- SCHEMA: reporte
-- Use: Views and objects for reporting
-- =============================================
CREATE SCHEMA [reporte] AUTHORIZATION [dbo];
GO

/*
Contains:
  - Denormalized views for reports
  - Aggregated/summary tables
  - Report-specific stored procedures

💡 Separating reports improves performance
   by allowing specific optimizations
*/


-- #############################################
-- 3. COMPLETE STRUCTURE EXAMPLE
-- #############################################

/*
Database: UniversidadComillas
├── dbo (shared)
│   ├── Tables
│   │   ├── TipoDocumento
│   │   ├── Pais
│   │   ├── Provincia
│   │   ├── EstadoGenerico
│   │   ├── ConfiguracionApp
│   │   └── ErrorLog
│   ├── Functions
│   │   ├── fn_CalcularEdad
│   │   ├── fn_GetCurrentUser
│   │   └── fn_NombreCompleto
│   └── Procedures
│       ├── usp_Error_Registrar
│       └── usp_Config_Obtener
│
├── academico
│   ├── Tables
│   │   ├── Estudiante
│   │   ├── Profesor
│   │   ├── Carrera
│   │   ├── Facultad
│   │   ├── Asignatura
│   │   ├── Matricula
│   │   ├── MatriculaDetalle
│   │   ├── Calificacion
│   │   └── Periodo
│   ├── Views
│   │   ├── vw_EstudiantesActivos
│   │   ├── vw_MatriculasPorPeriodo
│   │   └── vw_ExpedienteCompleto
│   └── Procedures
│       ├── usp_Estudiante_GetById
│       ├── usp_Estudiante_Search
│       ├── usp_Matricula_Procesar
│       └── usp_Calificacion_Registrar
│
├── financiero
│   ├── Tables
│   │   ├── Factura
│   │   ├── LineaFactura
│   │   ├── Pago
│   │   ├── Beca
│   │   └── SolicitudBeca
│   ├── Views
│   │   ├── vw_FacturasPendientes
│   │   └── vw_ResumenPagos
│   └── Procedures
│       ├── usp_Factura_Generar
│       ├── usp_Pago_Registrar
│       └── usp_Beca_Asignar
│
├── seguridad
│   ├── Tables
│   │   ├── Usuario
│   │   ├── Rol
│   │   ├── Permiso
│   │   ├── UsuarioRol
│   │   └── AuditLogin
│   └── Procedures
│       ├── usp_Usuario_Autenticar
│       ├── usp_Usuario_ObtenerPermisos
│       └── usp_Audit_RegistrarLogin
│
└── reporte
    ├── Views
    │   ├── vw_Rpt_MatriculasPorCarrera
    │   ├── vw_Rpt_IngresosPorPeriodo
    │   └── vw_Rpt_EstudiantesActivos
    └── Procedures
        ├── usp_Rpt_ResumenAcademico
        └── usp_Rpt_EstadoFinanciero
*/


-- #############################################
-- 4. PERMISSIONS BY SCHEMA
-- #############################################

-- Create database roles
CREATE ROLE [db_academico_reader];
CREATE ROLE [db_academico_writer];
CREATE ROLE [db_financiero_reader];
CREATE ROLE [db_financiero_writer];
CREATE ROLE [db_reporte_reader];
GO

-- Assign permissions to schemas
GRANT SELECT ON SCHEMA::[academico] TO [db_academico_reader];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::[academico] TO [db_academico_writer];
GRANT EXECUTE ON SCHEMA::[academico] TO [db_academico_writer];

GRANT SELECT ON SCHEMA::[financiero] TO [db_financiero_reader];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::[financiero] TO [db_financiero_writer];
GRANT EXECUTE ON SCHEMA::[financiero] TO [db_financiero_writer];

GRANT SELECT ON SCHEMA::[reporte] TO [db_reporte_reader];
GO

-- Read permissions on dbo for all
GRANT SELECT ON SCHEMA::[dbo] TO [db_academico_reader];
GRANT SELECT ON SCHEMA::[dbo] TO [db_financiero_reader];
GRANT SELECT ON SCHEMA::[dbo] TO [db_reporte_reader];
GO


-- #############################################
-- 5. BEST PRACTICES
-- #############################################

/*
✅ DO:
   - Use schemas to separate functional domains
   - Apply permissions at schema level (not table)
   - Keep dbo for shared objects
   - Create staging schema for ETL
   - Document the purpose of each schema

❌ AVOID:
   - One schema per developer
   - Schemas named after applications (app1, app2)
   - Mixing domains in a single schema
   - Empty or unused schemas
   - Changing object schemas frequently

💡 TIPS:
   - When creating objects, ALWAYS specify schema:
     CREATE TABLE [academico].[Estudiante]  ✓
     CREATE TABLE Estudiante                ✗

   - Schemas facilitate partial migrations
   - Use [archivo] schema for historical data
   - [staging] schema can be cleaned periodically
*/


-- #############################################
-- 6. VERIFICATION SCRIPT
-- #############################################

-- View all schemas and their objects
SELECT
    s.name AS [Schema],
    o.type_desc AS ObjectType,
    COUNT(*) AS Count
FROM sys.objects o
INNER JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE o.type IN ('U', 'V', 'P', 'FN', 'IF', 'TF')  -- Tables, Views, SPs, Functions
  AND s.name NOT IN ('sys', 'INFORMATION_SCHEMA')
GROUP BY s.name, o.type_desc
ORDER BY s.name, o.type_desc;
GO

-- View permissions by schema
SELECT
    p.state_desc AS State,
    p.permission_name AS Permission,
    s.name AS [Schema],
    dp.name AS Principal
FROM sys.database_permissions p
INNER JOIN sys.schemas s ON s.schema_id = p.major_id
INNER JOIN sys.database_principals dp ON dp.principal_id = p.grantee_principal_id
WHERE p.class_desc = 'SCHEMA'
ORDER BY s.name, dp.name;
GO
