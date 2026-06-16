-- =============================================
-- VIEW TEMPLATE
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Instructions:
--   1. Replace {Placeholders} with actual values
--   2. Adjust JOINs according to relationships
--   3. Consider if it needs to be indexed
-- =============================================

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      {BriefDescription}
-- Ticket/Feature:   {FeatureCode}
-- =============================================

-- =============================================
-- STANDARD VIEW
-- =============================================
CREATE OR ALTER VIEW [{Schema}].[vw_{DescriptiveName}]
AS
    SELECT
        -- Identifiers
        e.Id,
        e.Codigo,

        -- Main fields
        e.Nombre,
        e.Apellidos,
        NombreCompleto = CONCAT(e.Nombre, ' ', e.Apellidos),
        e.Email,

        -- Calculated fields
        Edad = DATEDIFF(YEAR, e.FechaNacimiento, GETDATE()),

        -- Related data
        r1.Nombre AS {Relation1}Nombre,
        r1.Codigo AS {Relation1}Codigo,
        r2.Descripcion AS {Relation2}Descripcion,

        -- State fields
        e.Activo,
        e.FechaCreacion

    FROM [{Schema}].[{BaseTable}] e

    -- JOINs with related tables
    INNER JOIN [{Schema}].[{RelationTable1}] r1
        ON r1.Id = e.{Relation1}Id

    LEFT JOIN [{Schema}].[{RelationTable2}] r2
        ON r2.Id = e.{Relation2}Id

    -- Base filter (only active)
    WHERE e.Activo = 1;
GO

-- =============================================
-- PERMISSIONS
-- =============================================
-- GRANT SELECT ON [{Schema}].[vw_{DescriptiveName}] TO [db_app_reader];
-- GO


-- =============================================
-- INDEXED VIEW (for frequent queries)
-- =============================================
/*
-- IMPORTANT: Only use when:
--   1. The query is executed VERY frequently
--   2. Base data changes RARELY
--   3. Performance benefit justifies maintenance cost

CREATE VIEW [{Schema}].[vw_{DescriptiveName}Indexed]
WITH SCHEMABINDING  -- REQUIRED for indexed views
AS
    SELECT
        e.Id,
        e.Codigo,
        e.Nombre,
        r.Nombre AS RelacionNombre,
        COUNT_BIG(*) AS TotalRegistros  -- COUNT_BIG required
    FROM [dbo].[{BaseTable}] e  -- Must use dbo, not schema alias
    INNER JOIN [dbo].[{RelationTable}] r
        ON r.Id = e.RelacionId
    WHERE e.Activo = 1
    GROUP BY
        e.Id,
        e.Codigo,
        e.Nombre,
        r.Nombre;
GO

-- Create unique clustered index (converts to indexed view)
CREATE UNIQUE CLUSTERED INDEX IX_vw_{DescriptiveName}Indexed
    ON [{Schema}].[vw_{DescriptiveName}Indexed](Id);
GO
*/


-- =============================================
-- COMMON VIEW EXAMPLES
-- =============================================

/*
-- EXAMPLE 1: Students view with full information
CREATE OR ALTER VIEW [academico].[vw_EstudiantesCompleto]
AS
    SELECT
        e.Id,
        e.NumeroDocumento,
        td.Nombre AS TipoDocumento,
        e.Nombre,
        e.Apellidos,
        NombreCompleto = CONCAT(e.Apellidos, ', ', e.Nombre),
        e.Email,
        e.Telefono,
        e.FechaNacimiento,
        Edad = DATEDIFF(YEAR, e.FechaNacimiento, GETDATE()) -
            CASE WHEN DATEADD(YEAR, DATEDIFF(YEAR, e.FechaNacimiento, GETDATE()), e.FechaNacimiento) > GETDATE()
                 THEN 1 ELSE 0 END,
        c.Codigo AS CarreraCodigo,
        c.Nombre AS CarreraNombre,
        f.Nombre AS FacultadNombre,
        es.Nombre AS Estado,
        es.Color AS EstadoColor,
        e.FechaCreacion AS FechaRegistro,
        e.Activo
    FROM academico.Estudiante e
    INNER JOIN dbo.TipoDocumento td ON td.Id = e.TipoDocumentoId
    INNER JOIN academico.Carrera c ON c.Id = e.CarreraId
    INNER JOIN academico.Facultad f ON f.Id = c.FacultadId
    INNER JOIN dbo.EstadoEstudiante es ON es.Id = e.EstadoId
    WHERE e.Activo = 1;
GO


-- EXAMPLE 2: Summary view for dashboards
CREATE OR ALTER VIEW [academico].[vw_ResumenMatriculas]
AS
    SELECT
        p.Id AS PeriodoId,
        p.Nombre AS PeriodoNombre,
        c.Id AS CarreraId,
        c.Nombre AS CarreraNombre,
        f.Nombre AS FacultadNombre,
        COUNT(m.Id) AS TotalMatriculas,
        SUM(CASE WHEN m.EstadoId = 1 THEN 1 ELSE 0 END) AS MatriculasActivas,
        SUM(CASE WHEN m.EstadoId = 2 THEN 1 ELSE 0 END) AS MatriculasBaja,
        MIN(m.FechaMatricula) AS PrimeraMatricula,
        MAX(m.FechaMatricula) AS UltimaMatricula
    FROM academico.Matricula m
    INNER JOIN academico.Periodo p ON p.Id = m.PeriodoId
    INNER JOIN academico.Estudiante e ON e.Id = m.EstudianteId
    INNER JOIN academico.Carrera c ON c.Id = e.CarreraId
    INNER JOIN academico.Facultad f ON f.Id = c.FacultadId
    WHERE m.Activo = 1
    GROUP BY
        p.Id, p.Nombre,
        c.Id, c.Nombre,
        f.Nombre;
GO


-- EXAMPLE 3: View for export (flat format)
CREATE OR ALTER VIEW [academico].[vw_EstudiantesExportacion]
AS
    SELECT
        e.NumeroDocumento AS [Document Number],
        e.Nombre AS [First Name],
        e.Apellidos AS [Last Name],
        e.Email AS [Email],
        FORMAT(e.FechaNacimiento, 'dd/MM/yyyy') AS [Birth Date],
        c.Nombre AS [Program],
        f.Nombre AS [Faculty],
        es.Nombre AS [Status],
        FORMAT(e.FechaCreacion, 'dd/MM/yyyy HH:mm') AS [Registration Date]
    FROM academico.Estudiante e
    INNER JOIN academico.Carrera c ON c.Id = e.CarreraId
    INNER JOIN academico.Facultad f ON f.Id = c.FacultadId
    INNER JOIN dbo.EstadoEstudiante es ON es.Id = e.EstadoId
    WHERE e.Activo = 1;
GO
*/
