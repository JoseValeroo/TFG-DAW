-- =============================================
-- FUNCTION TEMPLATES
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- This file contains templates for:
--   1. Scalar Functions (fn_)
--   2. Inline Table-Valued Functions (fnt_)
--   3. Multi-Statement Functions (fnt_ - avoid if possible)
-- =============================================


-- #############################################
-- SCALAR FUNCTION (fn_)
-- #############################################
-- Use: Returns a single value
-- Prefix: fn_

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      {BriefDescription}
-- =============================================
CREATE OR ALTER FUNCTION [{Schema}].[fn_{DescriptiveName}]
(
    @Parameter1 {DataType},
    @Parameter2 {DataType} = NULL  -- Optional parameter
)
RETURNS {ReturnDataType}
AS
BEGIN
    -- Validate parameters
    IF @Parameter1 IS NULL
        RETURN NULL;

    -- Local variables
    DECLARE @Result {ReturnDataType};

    -- Function logic
    SET @Result = {CalculationOrLogic};

    RETURN @Result;
END
GO

-- Usage example:
-- SELECT dbo.fn_{DescriptiveName}('value1', 'value2');
-- SELECT *, dbo.fn_{DescriptiveName}(Column1, Column2) AS Calculated FROM Table;


-- #############################################
-- INLINE TABLE-VALUED FUNCTION (fnt_)
-- #############################################
-- Use: Returns a table (better performance)
-- Prefix: fnt_
-- RECOMMENDED over Multi-Statement

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      {BriefDescription}
-- =============================================
CREATE OR ALTER FUNCTION [{Schema}].[fnt_{DescriptiveName}]
(
    @Parameter1 {DataType},
    @Parameter2 {DataType} = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        t.Id,
        t.Column1,
        t.Column2,
        r.Name AS RelationName
    FROM [{Schema}].[{Table}] t
    INNER JOIN [{Schema}].[{RelationTable}] r ON r.Id = t.RelationId
    WHERE t.Active = 1
      AND (@Parameter1 IS NULL OR t.Column1 = @Parameter1)
      AND (@Parameter2 IS NULL OR t.Column2 = @Parameter2)
);
GO

-- Usage example:
-- SELECT * FROM dbo.fnt_{DescriptiveName}('value1', NULL);
-- SELECT e.*, f.* FROM Employee e CROSS APPLY dbo.fnt_{DescriptiveName}(e.Id, NULL) f;


-- #############################################
-- MULTI-STATEMENT FUNCTION (fnt_)
-- #############################################
-- ⚠️ AVOID IF POSSIBLE - Worse performance
-- Use only when logic is very complex

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      {BriefDescription}
-- Note:             Use only if inline TVF is not viable
-- =============================================
CREATE OR ALTER FUNCTION [{Schema}].[fnt_{DescriptiveName}Multi]
(
    @Parameter1 {DataType}
)
RETURNS @Result TABLE
(
    Id INT,
    Name NVARCHAR(100),
    Level INT,
    Path NVARCHAR(500)
)
AS
BEGIN
    -- Complex logic (e.g., recursion with CTE)
    ;WITH CTE_Recursive AS
    (
        -- Anchor
        SELECT
            Id,
            Name,
            1 AS Level,
            CAST(Name AS NVARCHAR(500)) AS Path
        FROM [{Schema}].[{Table}]
        WHERE Id = @Parameter1

        UNION ALL

        -- Recursive part
        SELECT
            t.Id,
            t.Name,
            cte.Level + 1,
            CAST(cte.Path + ' > ' + t.Name AS NVARCHAR(500))
        FROM [{Schema}].[{Table}] t
        INNER JOIN CTE_Recursive cte ON t.ParentId = cte.Id
    )
    INSERT INTO @Result
    SELECT Id, Name, Level, Path
    FROM CTE_Recursive
    OPTION (MAXRECURSION 10);

    RETURN;
END
GO


-- #############################################
-- COMMON FUNCTION EXAMPLES
-- #############################################

/*
-- EXAMPLE 1: Calculate age (scalar)
CREATE OR ALTER FUNCTION [dbo].[fn_CalcularEdad]
(
    @FechaNacimiento DATE
)
RETURNS INT
AS
BEGIN
    IF @FechaNacimiento IS NULL OR @FechaNacimiento > GETDATE()
        RETURN NULL;

    RETURN DATEDIFF(YEAR, @FechaNacimiento, GETDATE()) -
        CASE
            WHEN DATEADD(YEAR, DATEDIFF(YEAR, @FechaNacimiento, GETDATE()), @FechaNacimiento) > GETDATE()
            THEN 1
            ELSE 0
        END;
END
GO

-- Usage: SELECT dbo.fn_CalcularEdad('1990-05-15');  -- Returns: 35


-- EXAMPLE 2: Format full name (scalar)
CREATE OR ALTER FUNCTION [dbo].[fn_NombreCompleto]
(
    @Nombre NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Formato NVARCHAR(10) = 'NA'  -- 'NA' = Name LastName, 'AN' = LastName, Name
)
RETURNS NVARCHAR(250)
AS
BEGIN
    IF @Nombre IS NULL AND @Apellidos IS NULL
        RETURN NULL;

    RETURN CASE @Formato
        WHEN 'AN' THEN CONCAT(LTRIM(RTRIM(@Apellidos)), ', ', LTRIM(RTRIM(@Nombre)))
        ELSE CONCAT(LTRIM(RTRIM(@Nombre)), ' ', LTRIM(RTRIM(@Apellidos)))
    END;
END
GO

-- Usage: SELECT dbo.fn_NombreCompleto('Juan', 'García López', 'AN');  -- Returns: García López, Juan


-- EXAMPLE 3: Get current user (Azure SQL compatible)
CREATE OR ALTER FUNCTION [dbo].[fn_GetCurrentUser]()
RETURNS NVARCHAR(100)
AS
BEGIN
    RETURN COALESCE(
        NULLIF(SUSER_SNAME(), ''),
        NULLIF(SYSTEM_USER, ''),
        'SYSTEM'
    );
END
GO

-- Usage: SELECT dbo.fn_GetCurrentUser();


-- EXAMPLE 4: Get scholarships by student (inline TVF)
CREATE OR ALTER FUNCTION [academico].[fnt_BecasPorEstudiante]
(
    @EstudianteId INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        b.Id AS BecaId,
        b.Codigo AS BecaCodigo,
        b.Nombre AS BecaNombre,
        b.Porcentaje,
        sb.FechaAsignacion,
        sb.FechaVencimiento,
        eb.Nombre AS Estado,
        eb.Color AS EstadoColor,
        CASE
            WHEN sb.FechaVencimiento < GETDATE() THEN 1
            ELSE 0
        END AS Vencida
    FROM academico.SolicitudBeca sb
    INNER JOIN academico.Beca b ON b.Id = sb.BecaId
    INNER JOIN dbo.EstadoBeca eb ON eb.Id = sb.EstadoId
    WHERE sb.EstudianteId = @EstudianteId
      AND sb.Activo = 1
);
GO

-- Usage:
-- SELECT * FROM academico.fnt_BecasPorEstudiante(123);
-- SELECT e.Nombre, b.* FROM Estudiante e CROSS APPLY academico.fnt_BecasPorEstudiante(e.Id) b;


-- EXAMPLE 5: Validate email format (scalar)
CREATE OR ALTER FUNCTION [dbo].[fn_EsEmailValido]
(
    @Email NVARCHAR(256)
)
RETURNS BIT
AS
BEGIN
    IF @Email IS NULL OR LEN(@Email) < 5
        RETURN 0;

    -- Basic email format validation
    IF @Email LIKE '%_@_%.__%'
       AND @Email NOT LIKE '%[^a-zA-Z0-9.@_-]%'
       AND @Email NOT LIKE '%..%'
       AND @Email NOT LIKE '.%'
       AND @Email NOT LIKE '%.'
        RETURN 1;

    RETURN 0;
END
GO

-- Usage: SELECT dbo.fn_EsEmailValido('usuario@dominio.com');  -- Returns: 1


-- EXAMPLE 6: Get department hierarchy (Multi-Statement - necessary for recursion)
CREATE OR ALTER FUNCTION [rrhh].[fnt_JerarquiaDepartamento]
(
    @DepartamentoId INT
)
RETURNS @Result TABLE
(
    Id INT,
    Name NVARCHAR(100),
    Level INT,
    Path NVARCHAR(500),
    IsRoot BIT
)
AS
BEGIN
    ;WITH CTE_Hierarchy AS
    (
        -- Anchor: root department
        SELECT
            d.Id,
            d.Nombre,
            1 AS Level,
            CAST(d.Nombre AS NVARCHAR(500)) AS Path,
            CAST(1 AS BIT) AS IsRoot
        FROM rrhh.Departamento d
        WHERE d.Id = @DepartamentoId
          AND d.Activo = 1

        UNION ALL

        -- Recursive: subdepartments
        SELECT
            d.Id,
            d.Nombre,
            cte.Level + 1,
            CAST(cte.Path + ' > ' + d.Nombre AS NVARCHAR(500)),
            CAST(0 AS BIT)
        FROM rrhh.Departamento d
        INNER JOIN CTE_Hierarchy cte ON d.DepartamentoPadreId = cte.Id
        WHERE d.Activo = 1
    )
    INSERT INTO @Result (Id, Name, Level, Path, IsRoot)
    SELECT Id, Nombre, Level, Path, IsRoot
    FROM CTE_Hierarchy
    OPTION (MAXRECURSION 20);

    RETURN;
END
GO

-- Usage: SELECT * FROM rrhh.fnt_JerarquiaDepartamento(1) ORDER BY Level, Name;
*/


-- =============================================
-- BEST PRACTICES FOR FUNCTIONS
-- =============================================
/*
✅ DO:
   - Use fn_ for scalar functions, fnt_ for table functions
   - Prefer inline TVF over Multi-Statement
   - Validate NULL parameters at the beginning
   - Document with standard header
   - Use functions for reusable calculations

❌ AVOID:
   - Multi-Statement functions for simple queries
   - External data access in scalar functions
   - Functions with side effects (INSERT, UPDATE)
   - Functions with very complex logic (better use SP)
   - Using functions in WHERE clause on indexed columns
     -- ❌ WHERE dbo.fn_Something(Column) = 'value'  -- Doesn't use index
     -- ✅ WHERE Column = dbo.fn_Something('value')  -- Can use index

⚠️ PERFORMANCE:
   Scalar functions in SELECT execute once per row.
   For large volumes, consider:
   - Calculate directly in the query
   - Use CROSS APPLY with inline TVF
   - Pre-calculate and store the value
*/
