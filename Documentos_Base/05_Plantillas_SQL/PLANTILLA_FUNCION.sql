-- =============================================
-- PLANTILLA DE FUNCIONES
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Este archivo contiene plantillas para:
--   1. Funciones Escalares (fn_)
--   2. Funciones con Valores de Tabla Inline (fnt_)
--   3. Funciones Multi-Statement (fnt_ - evitar si es posible)
-- =============================================


-- #############################################
-- FUNCIÓN ESCALAR (fn_)
-- #############################################
-- Uso: Devuelve un único valor
-- Prefijo: fn_

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     {DescripcionBreve}
-- =============================================
CREATE OR ALTER FUNCTION [{Schema}].[fn_{NombreDescriptivo}]
(
    @Parametro1 {TipoDato},
    @Parametro2 {TipoDato} = NULL  -- Parámetro opcional
)
RETURNS {TipoDatoRetorno}
AS
BEGIN
    -- Validar parámetros
    IF @Parametro1 IS NULL
        RETURN NULL;
    
    -- Variables locales
    DECLARE @Resultado {TipoDatoRetorno};
    
    -- Lógica de la función
    SET @Resultado = {CalculoOLogica};
    
    RETURN @Resultado;
END
GO

-- Ejemplo de uso:
-- SELECT dbo.fn_{NombreDescriptivo}('valor1', 'valor2');
-- SELECT *, dbo.fn_{NombreDescriptivo}(Columna1, Columna2) AS Calculado FROM Tabla;


-- #############################################
-- FUNCIÓN CON VALORES DE TABLA INLINE (fnt_)
-- #############################################
-- Uso: Devuelve una tabla (mejor rendimiento)
-- Prefijo: fnt_
-- RECOMENDADA sobre Multi-Statement

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     {DescripcionBreve}
-- =============================================
CREATE OR ALTER FUNCTION [{Schema}].[fnt_{NombreDescriptivo}]
(
    @Parametro1 {TipoDato},
    @Parametro2 {TipoDato} = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        t.Id,
        t.Columna1,
        t.Columna2,
        r.Nombre AS RelacionNombre
    FROM [{Schema}].[{Tabla}] t
    INNER JOIN [{Schema}].[{TablaRelacion}] r ON r.Id = t.RelacionId
    WHERE t.Activo = 1
      AND (@Parametro1 IS NULL OR t.Columna1 = @Parametro1)
      AND (@Parametro2 IS NULL OR t.Columna2 = @Parametro2)
);
GO

-- Ejemplo de uso:
-- SELECT * FROM dbo.fnt_{NombreDescriptivo}('valor1', NULL);
-- SELECT e.*, f.* FROM Empleado e CROSS APPLY dbo.fnt_{NombreDescriptivo}(e.Id, NULL) f;


-- #############################################
-- FUNCIÓN MULTI-STATEMENT (fnt_)
-- #############################################
-- ⚠️ EVITAR SI ES POSIBLE - Peor rendimiento
-- Usar solo cuando la lógica es muy compleja

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     {DescripcionBreve}
-- Nota:            Usar solo si TVF inline no es viable
-- =============================================
CREATE OR ALTER FUNCTION [{Schema}].[fnt_{NombreDescriptivo}Multi]
(
    @Parametro1 {TipoDato}
)
RETURNS @Resultado TABLE
(
    Id INT,
    Nombre NVARCHAR(100),
    Nivel INT,
    Ruta NVARCHAR(500)
)
AS
BEGIN
    -- Lógica compleja (ej: recursión con CTE)
    ;WITH CTE_Recursivo AS
    (
        -- Ancla
        SELECT 
            Id, 
            Nombre, 
            1 AS Nivel,
            CAST(Nombre AS NVARCHAR(500)) AS Ruta
        FROM [{Schema}].[{Tabla}]
        WHERE Id = @Parametro1
        
        UNION ALL
        
        -- Parte recursiva
        SELECT 
            t.Id, 
            t.Nombre, 
            cte.Nivel + 1,
            CAST(cte.Ruta + ' > ' + t.Nombre AS NVARCHAR(500))
        FROM [{Schema}].[{Tabla}] t
        INNER JOIN CTE_Recursivo cte ON t.PadreId = cte.Id
    )
    INSERT INTO @Resultado
    SELECT Id, Nombre, Nivel, Ruta
    FROM CTE_Recursivo
    OPTION (MAXRECURSION 10);
    
    RETURN;
END
GO


-- #############################################
-- EJEMPLOS DE FUNCIONES COMUNES
-- #############################################

/*
-- EJEMPLO 1: Calcular edad (escalar)
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

-- Uso: SELECT dbo.fn_CalcularEdad('1990-05-15');  -- Devuelve: 35


-- EJEMPLO 2: Formatear nombre completo (escalar)
CREATE OR ALTER FUNCTION [dbo].[fn_NombreCompleto]
(
    @Nombre NVARCHAR(100),
    @Apellidos NVARCHAR(100),
    @Formato NVARCHAR(10) = 'NA'  -- 'NA' = Nombre Apellidos, 'AN' = Apellidos, Nombre
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

-- Uso: SELECT dbo.fn_NombreCompleto('Juan', 'García López', 'AN');  -- Devuelve: García López, Juan


-- EJEMPLO 3: Obtener usuario actual (compatible Azure SQL)
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

-- Uso: SELECT dbo.fn_GetCurrentUser();


-- EJEMPLO 4: Obtener becas por estudiante (TVF inline)
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

-- Uso: 
-- SELECT * FROM academico.fnt_BecasPorEstudiante(123);
-- SELECT e.Nombre, b.* FROM Estudiante e CROSS APPLY academico.fnt_BecasPorEstudiante(e.Id) b;


-- EJEMPLO 5: Validar formato de email (escalar)
CREATE OR ALTER FUNCTION [dbo].[fn_EsEmailValido]
(
    @Email NVARCHAR(256)
)
RETURNS BIT
AS
BEGIN
    IF @Email IS NULL OR LEN(@Email) < 5
        RETURN 0;
    
    -- Validación básica de formato email
    IF @Email LIKE '%_@_%.__%'
       AND @Email NOT LIKE '%[^a-zA-Z0-9.@_-]%'
       AND @Email NOT LIKE '%..%'
       AND @Email NOT LIKE '.%'
       AND @Email NOT LIKE '%.'
        RETURN 1;
    
    RETURN 0;
END
GO

-- Uso: SELECT dbo.fn_EsEmailValido('usuario@dominio.com');  -- Devuelve: 1


-- EJEMPLO 6: Obtener jerarquía de departamentos (Multi-Statement - necesario para recursión)
CREATE OR ALTER FUNCTION [rrhh].[fnt_JerarquiaDepartamento]
(
    @DepartamentoId INT
)
RETURNS @Resultado TABLE
(
    Id INT,
    Nombre NVARCHAR(100),
    Nivel INT,
    Ruta NVARCHAR(500),
    EsRaiz BIT
)
AS
BEGIN
    ;WITH CTE_Jerarquia AS
    (
        -- Ancla: departamento raíz
        SELECT 
            d.Id, 
            d.Nombre, 
            1 AS Nivel,
            CAST(d.Nombre AS NVARCHAR(500)) AS Ruta,
            CAST(1 AS BIT) AS EsRaiz
        FROM rrhh.Departamento d
        WHERE d.Id = @DepartamentoId
          AND d.Activo = 1
        
        UNION ALL
        
        -- Recursivo: subdepartamentos
        SELECT 
            d.Id, 
            d.Nombre, 
            cte.Nivel + 1,
            CAST(cte.Ruta + ' > ' + d.Nombre AS NVARCHAR(500)),
            CAST(0 AS BIT)
        FROM rrhh.Departamento d
        INNER JOIN CTE_Jerarquia cte ON d.DepartamentoPadreId = cte.Id
        WHERE d.Activo = 1
    )
    INSERT INTO @Resultado (Id, Nombre, Nivel, Ruta, EsRaiz)
    SELECT Id, Nombre, Nivel, Ruta, EsRaiz
    FROM CTE_Jerarquia
    OPTION (MAXRECURSION 20);
    
    RETURN;
END
GO

-- Uso: SELECT * FROM rrhh.fnt_JerarquiaDepartamento(1) ORDER BY Nivel, Nombre;
*/


-- =============================================
-- BUENAS PRÁCTICAS PARA FUNCIONES
-- =============================================
/*
✅ HACER:
   - Usar fn_ para escalares, fnt_ para tablas
   - Preferir TVF inline sobre Multi-Statement
   - Validar parámetros NULL al inicio
   - Documentar con cabecera estándar
   - Usar funciones para cálculos reutilizables

❌ EVITAR:
   - Funciones Multi-Statement para queries simples
   - Acceso a datos externos en funciones escalares
   - Funciones con efectos secundarios (INSERT, UPDATE)
   - Funciones con lógica muy compleja (mejor usar SP)
   - Usar funciones en WHERE de columnas indexadas
     -- ❌ WHERE dbo.fn_Algo(Columna) = 'valor'  -- No usa índice
     -- ✅ WHERE Columna = dbo.fn_Algo('valor')  -- Puede usar índice

⚠️ RENDIMIENTO:
   Las funciones escalares en SELECT se ejecutan una vez por fila.
   Para grandes volúmenes, considerar:
   - Calcular en la query directamente
   - Usar CROSS APPLY con TVF inline
   - Pre-calcular y almacenar el valor
*/
