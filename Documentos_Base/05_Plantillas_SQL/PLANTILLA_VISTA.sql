-- =============================================
-- PLANTILLA DE VISTA
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Instrucciones:
--   1. Reemplazar {Placeholders} con valores reales
--   2. Ajustar JOINs según relaciones
--   3. Considerar si necesita ser indexada
-- =============================================

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     {DescripcionBreve}
-- Ticket/Evolutivo: {CodigoEvolutivo}
-- =============================================

-- =============================================
-- VISTA ESTÁNDAR
-- =============================================
CREATE OR ALTER VIEW [{Schema}].[vw_{NombreDescriptivo}]
AS
    SELECT 
        -- Identificadores
        e.Id,
        e.Codigo,
        
        -- Campos principales
        e.Nombre,
        e.Apellidos,
        NombreCompleto = CONCAT(e.Nombre, ' ', e.Apellidos),
        e.Email,
        
        -- Campos calculados
        Edad = DATEDIFF(YEAR, e.FechaNacimiento, GETDATE()),
        
        -- Datos de relaciones
        r1.Nombre AS {Relacion1}Nombre,
        r1.Codigo AS {Relacion1}Codigo,
        r2.Descripcion AS {Relacion2}Descripcion,
        
        -- Campos de estado
        e.Activo,
        e.FechaCreacion
        
    FROM [{Schema}].[{TablaBase}] e
    
    -- JOINs con tablas relacionadas
    INNER JOIN [{Schema}].[{TablaRelacion1}] r1 
        ON r1.Id = e.{Relacion1}Id
    
    LEFT JOIN [{Schema}].[{TablaRelacion2}] r2 
        ON r2.Id = e.{Relacion2}Id
    
    -- Filtro base (solo activos)
    WHERE e.Activo = 1;
GO

-- =============================================
-- PERMISOS
-- =============================================
-- GRANT SELECT ON [{Schema}].[vw_{NombreDescriptivo}] TO [db_app_reader];
-- GO


-- =============================================
-- VISTA INDEXADA (para consultas frecuentes)
-- =============================================
/*
-- IMPORTANTE: Solo usar cuando:
--   1. La consulta se ejecuta MUCHAS veces
--   2. Los datos base cambian POCO
--   3. El beneficio de rendimiento justifica el costo de mantenimiento

CREATE VIEW [{Schema}].[vw_{NombreDescriptivo}Indexed]
WITH SCHEMABINDING  -- REQUERIDO para vistas indexadas
AS
    SELECT 
        e.Id,
        e.Codigo,
        e.Nombre,
        r.Nombre AS RelacionNombre,
        COUNT_BIG(*) AS TotalRegistros  -- COUNT_BIG requerido
    FROM [dbo].[{TablaBase}] e  -- Debe usar dbo, no alias de schema
    INNER JOIN [dbo].[{TablaRelacion}] r 
        ON r.Id = e.RelacionId
    WHERE e.Activo = 1
    GROUP BY 
        e.Id,
        e.Codigo,
        e.Nombre,
        r.Nombre;
GO

-- Crear índice clustered único (convierte en vista indexada)
CREATE UNIQUE CLUSTERED INDEX IX_vw_{NombreDescriptivo}Indexed
    ON [{Schema}].[vw_{NombreDescriptivo}Indexed](Id);
GO
*/


-- =============================================
-- EJEMPLOS DE VISTAS COMUNES
-- =============================================

/*
-- EJEMPLO 1: Vista de Estudiantes con toda la información
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


-- EJEMPLO 2: Vista de resumen para dashboards
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


-- EJEMPLO 3: Vista para exportación (formato plano)
CREATE OR ALTER VIEW [academico].[vw_EstudiantesExportacion]
AS
    SELECT 
        e.NumeroDocumento AS [Número Documento],
        e.Nombre AS [Nombre],
        e.Apellidos AS [Apellidos],
        e.Email AS [Email],
        FORMAT(e.FechaNacimiento, 'dd/MM/yyyy') AS [Fecha Nacimiento],
        c.Nombre AS [Carrera],
        f.Nombre AS [Facultad],
        es.Nombre AS [Estado],
        FORMAT(e.FechaCreacion, 'dd/MM/yyyy HH:mm') AS [Fecha Registro]
    FROM academico.Estudiante e
    INNER JOIN academico.Carrera c ON c.Id = e.CarreraId
    INNER JOIN academico.Facultad f ON f.Id = c.FacultadId
    INNER JOIN dbo.EstadoEstudiante es ON es.Id = e.EstadoId
    WHERE e.Activo = 1;
GO
*/
