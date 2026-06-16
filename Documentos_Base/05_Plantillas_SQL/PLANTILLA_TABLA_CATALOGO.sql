-- =============================================
-- PLANTILLA DE TABLA DE CATÁLOGO (LOOKUP)
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Uso: Tablas maestras de valores predefinidos
-- Ejemplos: TipoDocumento, EstadoSolicitud, Pais, etc.
-- =============================================

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     Catálogo de {DescripcionCatalogo}
-- Ticket/Evolutivo: {CodigoEvolutivo}
-- =============================================

-- =============================================
-- CONVENCIÓN DE NOMBRADO PARA CATÁLOGOS
-- =============================================
/*
Usar nombres descriptivos en singular sin prefijo:

✅ CORRECTO:
   - TipoDocumento
   - EstadoSolicitud
   - NivelEstudios
   - Pais
   - Provincia
   - MotivoBaja

❌ EVITAR:
   - Cat_TipoDocumento    (prefijo innecesario)
   - Lkp_Estado           (prefijo innecesario)
   - TiposDocumentos      (plural)
   - tbl_TipoDocumento    (prefijo húngaro)
   - TIPO_DOCUMENTO       (mayúsculas)
*/

-- =============================================
-- ESTRUCTURA ESTÁNDAR DE CATÁLOGO
-- =============================================
CREATE TABLE [{Schema}].[{NombreCatalogo}]
(
    -- Primary Key (INT para catálogos pequeños)
    Id INT IDENTITY(1,1) NOT NULL,
    
    -- ==========================================
    -- CAMPOS ESTÁNDAR DE CATÁLOGO
    -- ==========================================
    
    -- Código corto (para uso en código/reportes)
    Codigo NVARCHAR(20) NOT NULL,
    
    -- Nombre para mostrar en UI
    Nombre NVARCHAR(100) NOT NULL,
    
    -- Descripción extendida (tooltips, ayuda)
    Descripcion NVARCHAR(500) NULL,
    
    -- Orden de visualización en listas
    Orden INT NOT NULL DEFAULT 0,
    
    -- ==========================================
    -- CAMPOS OPCIONALES (según necesidad)
    -- ==========================================
    
    -- Valor asociado (para cálculos)
    -- Valor DECIMAL(18,2) NULL,
    
    -- Código externo (integración con otros sistemas)
    -- CodigoExterno NVARCHAR(50) NULL,
    
    -- Ícono o clase CSS (para UI)
    -- Icono NVARCHAR(50) NULL,
    
    -- Color (para badges, estados visuales)
    -- Color NVARCHAR(7) NULL,  -- Formato: #RRGGBB
    
    -- Configuración JSON (datos flexibles)
    -- Configuracion NVARCHAR(MAX) NULL,
    
    -- Categoría padre (para catálogos jerárquicos)
    -- CategoriaId INT NULL,
    
    -- ==========================================
    -- CAMPOS DE AUDITORÍA
    -- ==========================================
    Activo BIT NOT NULL 
        CONSTRAINT DF_{NombreCatalogo}_Activo DEFAULT 1,
    
    FechaCreacion DATETIME2(3) NOT NULL 
        CONSTRAINT DF_{NombreCatalogo}_FechaCreacion DEFAULT GETUTCDATE(),
    
    UsuarioCreacion NVARCHAR(100) NOT NULL 
        CONSTRAINT DF_{NombreCatalogo}_UsuarioCreacion DEFAULT SYSTEM_USER,
    
    FechaModificacion DATETIME2(3) NULL,
    
    UsuarioModificacion NVARCHAR(100) NULL,
    
    -- ==========================================
    -- CONSTRAINTS
    -- ==========================================
    CONSTRAINT PK_{NombreCatalogo} 
        PRIMARY KEY CLUSTERED (Id),
    
    CONSTRAINT UX_{NombreCatalogo}_Codigo 
        UNIQUE (Codigo),
    
    CONSTRAINT UX_{NombreCatalogo}_Nombre 
        UNIQUE (Nombre)
    
    -- Para catálogos jerárquicos:
    -- CONSTRAINT FK_{NombreCatalogo}_Categoria
    --     FOREIGN KEY (CategoriaId) 
    --     REFERENCES [{Schema}].[{NombreCatalogo}](Id)
);
GO

-- =============================================
-- ÍNDICES
-- =============================================

-- Índice para búsqueda por código
CREATE NONCLUSTERED INDEX IX_{NombreCatalogo}_Codigo
    ON [{Schema}].[{NombreCatalogo}](Codigo)
    WHERE Activo = 1;
GO

-- Índice para listados ordenados
CREATE NONCLUSTERED INDEX IX_{NombreCatalogo}_Orden
    ON [{Schema}].[{NombreCatalogo}](Orden, Nombre)
    WHERE Activo = 1;
GO

-- =============================================
-- DATOS INICIALES (SEED)
-- =============================================
/*
-- Insertar valores iniciales del catálogo
INSERT INTO [{Schema}].[{NombreCatalogo}] (Codigo, Nombre, Descripcion, Orden)
VALUES 
    ('COD1', 'Valor 1', 'Descripción del valor 1', 1),
    ('COD2', 'Valor 2', 'Descripción del valor 2', 2),
    ('COD3', 'Valor 3', 'Descripción del valor 3', 3);
*/

-- =============================================
-- EJEMPLOS DE CATÁLOGOS COMUNES
-- =============================================

/*
-- EJEMPLO 1: Tipo de Documento
CREATE TABLE [dbo].[TipoDocumento]
(
    Id INT IDENTITY(1,1) NOT NULL,
    Codigo NVARCHAR(20) NOT NULL,      -- 'DNI', 'NIE', 'PASAPORTE'
    Nombre NVARCHAR(100) NOT NULL,      -- 'DNI', 'NIE', 'Pasaporte'
    Descripcion NVARCHAR(500) NULL,
    Orden INT NOT NULL DEFAULT 0,
    RequiereValidacion BIT NOT NULL DEFAULT 0,  -- Campo específico
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2(3) NOT NULL DEFAULT GETUTCDATE(),
    UsuarioCreacion NVARCHAR(100) NOT NULL DEFAULT SYSTEM_USER,
    FechaModificacion DATETIME2(3) NULL,
    UsuarioModificacion NVARCHAR(100) NULL,
    CONSTRAINT PK_TipoDocumento PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UX_TipoDocumento_Codigo UNIQUE (Codigo)
);

INSERT INTO dbo.TipoDocumento (Codigo, Nombre, Orden, RequiereValidacion)
VALUES 
    ('DNI', 'DNI', 1, 1),
    ('NIE', 'NIE', 2, 1),
    ('PASAPORTE', 'Pasaporte', 3, 0),
    ('OTRO', 'Otro documento', 99, 0);


-- EJEMPLO 2: Estado de Solicitud (con colores)
CREATE TABLE [dbo].[EstadoSolicitud]
(
    Id INT IDENTITY(1,1) NOT NULL,
    Codigo NVARCHAR(20) NOT NULL,       -- 'PEND', 'APROB', 'RECH'
    Nombre NVARCHAR(100) NOT NULL,       -- 'Pendiente', 'Aprobada', 'Rechazada'
    Descripcion NVARCHAR(500) NULL,
    Orden INT NOT NULL DEFAULT 0,
    Color NVARCHAR(7) NULL,              -- '#FFC107', '#28A745', '#DC3545'
    EsFinal BIT NOT NULL DEFAULT 0,      -- Indica si es estado terminal
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2(3) NOT NULL DEFAULT GETUTCDATE(),
    UsuarioCreacion NVARCHAR(100) NOT NULL DEFAULT SYSTEM_USER,
    FechaModificacion DATETIME2(3) NULL,
    UsuarioModificacion NVARCHAR(100) NULL,
    CONSTRAINT PK_EstadoSolicitud PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UX_EstadoSolicitud_Codigo UNIQUE (Codigo)
);

INSERT INTO dbo.EstadoSolicitud (Codigo, Nombre, Color, Orden, EsFinal)
VALUES 
    ('BORRADOR', 'Borrador', '#6C757D', 1, 0),
    ('PENDIENTE', 'Pendiente de revisión', '#FFC107', 2, 0),
    ('EN_REVISION', 'En revisión', '#17A2B8', 3, 0),
    ('APROBADA', 'Aprobada', '#28A745', 4, 1),
    ('RECHAZADA', 'Rechazada', '#DC3545', 5, 1),
    ('CANCELADA', 'Cancelada', '#6C757D', 6, 1);


-- EJEMPLO 3: Catálogo jerárquico (Categorías)
CREATE TABLE [dbo].[Categoria]
(
    Id INT IDENTITY(1,1) NOT NULL,
    CategoriaPadreId INT NULL,           -- NULL = categoría raíz
    Codigo NVARCHAR(20) NOT NULL,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(500) NULL,
    Nivel INT NOT NULL DEFAULT 1,
    Orden INT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME2(3) NOT NULL DEFAULT GETUTCDATE(),
    UsuarioCreacion NVARCHAR(100) NOT NULL DEFAULT SYSTEM_USER,
    FechaModificacion DATETIME2(3) NULL,
    UsuarioModificacion NVARCHAR(100) NULL,
    CONSTRAINT PK_Categoria PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UX_Categoria_Codigo UNIQUE (Codigo),
    CONSTRAINT FK_Categoria_CategoriaPadre 
        FOREIGN KEY (CategoriaPadreId) REFERENCES dbo.Categoria(Id)
);
*/

-- =============================================
-- SP PARA OBTENER CATÁLOGO (patrón recomendado)
-- =============================================
/*
CREATE OR ALTER PROCEDURE [dbo].[usp_{NombreCatalogo}_GetAll]
    @SoloActivos BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        Codigo,
        Nombre,
        Descripcion,
        Orden,
        Activo
    FROM [{Schema}].[{NombreCatalogo}]
    WHERE (@SoloActivos = 0 OR Activo = 1)
    ORDER BY Orden, Nombre;
END
GO
*/

-- =============================================
-- VISTA PARA CATÁLOGO (alternativa)
-- =============================================
/*
CREATE OR ALTER VIEW [dbo].[vw_{NombreCatalogo}Activos]
AS
    SELECT 
        Id,
        Codigo,
        Nombre,
        Descripcion,
        Orden
    FROM [{Schema}].[{NombreCatalogo}]
    WHERE Activo = 1;
GO
*/
