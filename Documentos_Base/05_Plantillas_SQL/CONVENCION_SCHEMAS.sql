-- =============================================
-- CONVENCIÓN DE SCHEMAS
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Este documento define la estructura de schemas
-- recomendada para organizar objetos de BD
-- =============================================


-- #############################################
-- 1. PRINCIPIOS DE ORGANIZACIÓN
-- #############################################

/*
Los schemas en SQL Server permiten:
  ✓ Agrupar objetos por dominio funcional
  ✓ Aplicar permisos a nivel de schema
  ✓ Evitar colisiones de nombres
  ✓ Facilitar el mantenimiento
  ✓ Mejorar la documentación implícita

CONVENCIÓN DE NOMBRADO:
  - Usar lowercase
  - Nombres cortos y descriptivos
  - Sin prefijos ni sufijos
  - Representar dominio de negocio
*/


-- #############################################
-- 2. SCHEMAS RECOMENDADOS
-- #############################################

-- =============================================
-- SCHEMA: dbo (default)
-- Uso: Objetos comunes/compartidos entre dominios
-- =============================================
-- Ya existe por defecto
-- Contiene:
--   - Tablas de catálogo compartidas (TipoDocumento, Pais, etc.)
--   - Funciones utilitarias (fn_CalcularEdad, fn_GetCurrentUser)
--   - Stored procedures comunes
--   - Tablas de configuración de aplicación
--   - Tablas de auditoría/log

-- =============================================
-- SCHEMA: academico
-- Uso: Gestión académica
-- =============================================
CREATE SCHEMA [academico] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Estudiante, Profesor, Carrera, Facultad
  - Matricula, Asignatura, Horario
  - Calificacion, Expediente
  - Periodo, CursoAcademico
*/

-- =============================================
-- SCHEMA: financiero
-- Uso: Gestión financiera y contable
-- =============================================
CREATE SCHEMA [financiero] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Factura, LineaFactura
  - Pago, FormaPago
  - Cuenta, Movimiento
  - Presupuesto, PartidaPresupuestaria
  - Beca, SolicitudBeca
*/

-- =============================================
-- SCHEMA: rrhh
-- Uso: Recursos Humanos
-- =============================================
CREATE SCHEMA [rrhh] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Empleado, Contrato
  - Departamento, Puesto
  - Nomina, Ausencia
  - Evaluacion
*/

-- =============================================
-- SCHEMA: seguridad
-- Uso: Autenticación y autorización
-- =============================================
CREATE SCHEMA [seguridad] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Usuario, Rol, Permiso
  - UsuarioRol, RolPermiso
  - SesionUsuario, TokenAcceso
  - AuditLogin
*/

-- =============================================
-- SCHEMA: comunicacion
-- Uso: Notificaciones y mensajería
-- =============================================
CREATE SCHEMA [comunicacion] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Notificacion, PlantillaEmail
  - MensajeInterno, Adjunto
  - ColaEnvio, LogEnvio
*/

-- =============================================
-- SCHEMA: integracion
-- Uso: Integración con sistemas externos
-- =============================================
CREATE SCHEMA [integracion] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - LogIntegracion
  - MapeoCodigos
  - ColaSincronizacion
  - ConfiguracionExterna
*/

-- =============================================
-- SCHEMA: staging
-- Uso: Datos temporales de carga/ETL
-- =============================================
CREATE SCHEMA [staging] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Tablas temporales de importación
  - Datos en proceso de validación
  - Colas de procesamiento
  
⚠️ Los datos en staging son TEMPORALES
*/

-- =============================================
-- SCHEMA: archivo
-- Uso: Datos históricos/archivados
-- =============================================
CREATE SCHEMA [archivo] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Versiones archivadas de tablas principales
  - Datos antiguos que ya no están activos
  - Históricos para reportes
*/

-- =============================================
-- SCHEMA: reporte
-- Uso: Vistas y objetos para reportería
-- =============================================
CREATE SCHEMA [reporte] AUTHORIZATION [dbo];
GO

/*
Contiene:
  - Vistas desnormalizadas para reportes
  - Tablas agregadas/resumen
  - SPs específicos de reportes
  
💡 Separar reportes mejora el rendimiento
   al permitir optimizaciones específicas
*/


-- #############################################
-- 3. EJEMPLO DE ESTRUCTURA COMPLETA
-- #############################################

/*
Base de datos: UniversidadComillas
├── dbo (compartido)
│   ├── Tablas
│   │   ├── TipoDocumento
│   │   ├── Pais
│   │   ├── Provincia
│   │   ├── EstadoGenerico
│   │   ├── ConfiguracionApp
│   │   └── ErrorLog
│   ├── Funciones
│   │   ├── fn_CalcularEdad
│   │   ├── fn_GetCurrentUser
│   │   └── fn_NombreCompleto
│   └── Procedimientos
│       ├── usp_Error_Registrar
│       └── usp_Config_Obtener
│
├── academico
│   ├── Tablas
│   │   ├── Estudiante
│   │   ├── Profesor
│   │   ├── Carrera
│   │   ├── Facultad
│   │   ├── Asignatura
│   │   ├── Matricula
│   │   ├── MatriculaDetalle
│   │   ├── Calificacion
│   │   └── Periodo
│   ├── Vistas
│   │   ├── vw_EstudiantesActivos
│   │   ├── vw_MatriculasPorPeriodo
│   │   └── vw_ExpedienteCompleto
│   └── Procedimientos
│       ├── usp_Estudiante_GetById
│       ├── usp_Estudiante_Search
│       ├── usp_Matricula_Procesar
│       └── usp_Calificacion_Registrar
│
├── financiero
│   ├── Tablas
│   │   ├── Factura
│   │   ├── LineaFactura
│   │   ├── Pago
│   │   ├── Beca
│   │   └── SolicitudBeca
│   ├── Vistas
│   │   ├── vw_FacturasPendientes
│   │   └── vw_ResumenPagos
│   └── Procedimientos
│       ├── usp_Factura_Generar
│       ├── usp_Pago_Registrar
│       └── usp_Beca_Asignar
│
├── seguridad
│   ├── Tablas
│   │   ├── Usuario
│   │   ├── Rol
│   │   ├── Permiso
│   │   ├── UsuarioRol
│   │   └── AuditLogin
│   └── Procedimientos
│       ├── usp_Usuario_Autenticar
│       ├── usp_Usuario_ObtenerPermisos
│       └── usp_Audit_RegistrarLogin
│
└── reporte
    ├── Vistas
    │   ├── vw_Rpt_MatriculasPorCarrera
    │   ├── vw_Rpt_IngresosPorPeriodo
    │   └── vw_Rpt_EstudiantesActivos
    └── Procedimientos
        ├── usp_Rpt_ResumenAcademico
        └── usp_Rpt_EstadoFinanciero
*/


-- #############################################
-- 4. PERMISOS POR SCHEMA
-- #############################################

-- Crear roles de base de datos
CREATE ROLE [db_academico_reader];
CREATE ROLE [db_academico_writer];
CREATE ROLE [db_financiero_reader];
CREATE ROLE [db_financiero_writer];
CREATE ROLE [db_reporte_reader];
GO

-- Asignar permisos a schemas
GRANT SELECT ON SCHEMA::[academico] TO [db_academico_reader];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::[academico] TO [db_academico_writer];
GRANT EXECUTE ON SCHEMA::[academico] TO [db_academico_writer];

GRANT SELECT ON SCHEMA::[financiero] TO [db_financiero_reader];
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::[financiero] TO [db_financiero_writer];
GRANT EXECUTE ON SCHEMA::[financiero] TO [db_financiero_writer];

GRANT SELECT ON SCHEMA::[reporte] TO [db_reporte_reader];
GO

-- Permisos de lectura en dbo para todos
GRANT SELECT ON SCHEMA::[dbo] TO [db_academico_reader];
GRANT SELECT ON SCHEMA::[dbo] TO [db_financiero_reader];
GRANT SELECT ON SCHEMA::[dbo] TO [db_reporte_reader];
GO


-- #############################################
-- 5. BUENAS PRÁCTICAS
-- #############################################

/*
✅ HACER:
   - Usar schemas para separar dominios funcionales
   - Aplicar permisos a nivel de schema (no tabla)
   - Mantener dbo para objetos compartidos
   - Crear schema de staging para ETL
   - Documentar el propósito de cada schema

❌ EVITAR:
   - Un schema por desarrollador
   - Schemas con nombres de aplicación (app1, app2)
   - Mezclar dominios en un solo schema
   - Schemas vacíos o sin uso
   - Cambiar objetos de schema frecuentemente

💡 TIPS:
   - Al crear objetos, SIEMPRE especificar schema:
     CREATE TABLE [academico].[Estudiante]  ✓
     CREATE TABLE Estudiante                ✗
   
   - Los schemas facilitan migraciones parciales
   - Usar schema [archivo] para datos históricos
   - Schema [staging] se puede limpiar periódicamente
*/


-- #############################################
-- 6. SCRIPT DE VERIFICACIÓN
-- #############################################

-- Ver todos los schemas y sus objetos
SELECT 
    s.name AS [Schema],
    o.type_desc AS TipoObjeto,
    COUNT(*) AS Cantidad
FROM sys.objects o
INNER JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE o.type IN ('U', 'V', 'P', 'FN', 'IF', 'TF')  -- Tablas, Vistas, SPs, Funciones
  AND s.name NOT IN ('sys', 'INFORMATION_SCHEMA')
GROUP BY s.name, o.type_desc
ORDER BY s.name, o.type_desc;
GO

-- Ver permisos por schema
SELECT 
    p.state_desc AS Estado,
    p.permission_name AS Permiso,
    s.name AS [Schema],
    dp.name AS Principal
FROM sys.database_permissions p
INNER JOIN sys.schemas s ON s.schema_id = p.major_id
INNER JOIN sys.database_principals dp ON dp.principal_id = p.grantee_principal_id
WHERE p.class_desc = 'SCHEMA'
ORDER BY s.name, dp.name;
GO
