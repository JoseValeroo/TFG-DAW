-- =============================================
-- CATALOG TABLE TEMPLATE (LOOKUP)
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Use: Master tables for predefined values
-- Examples: TipoDocumento, EstadoSolicitud, Pais, etc.
-- =============================================

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      Catalog of {CatalogDescription}
-- Ticket/Feature:   {FeatureCode}
-- =============================================

-- =============================================
-- NAMING CONVENTION FOR CATALOGS
-- =============================================
/*
Use descriptive singular names without prefix:

✅ CORRECT:
   - TipoDocumento
   - EstadoSolicitud
   - NivelEstudios
   - Pais
   - Provincia
   - MotivoBaja

❌ AVOID:
   - Cat_TipoDocumento    (unnecessary prefix)
   - Lkp_Estado           (unnecessary prefix)
   - TiposDocumentos      (plural)
   - tbl_TipoDocumento    (Hungarian prefix)
   - TIPO_DOCUMENTO       (uppercase)
*/

-- =============================================
-- STANDARD CATALOG STRUCTURE
-- =============================================
CREATE TABLE [{Schema}].[{CatalogName}]
(
    -- Primary Key (INT for small catalogs)
    Id INT IDENTITY(1,1) NOT NULL,

    -- ==========================================
    -- STANDARD CATALOG FIELDS
    -- ==========================================

    -- Short code (for use in code/reports)
    Codigo NVARCHAR(20) NOT NULL,

    -- Name to display in UI
    Nombre NVARCHAR(100) NOT NULL,

    -- Extended description (tooltips, help)
    Descripcion NVARCHAR(500) NULL,

    -- Display order in lists
    Orden INT NOT NULL DEFAULT 0,

    -- ==========================================
    -- OPTIONAL FIELDS (as needed)
    -- ==========================================

    -- Associated value (for calculations)
    -- Valor DECIMAL(18,2) NULL,

    -- External code (integration with other systems)
    -- CodigoExterno NVARCHAR(50) NULL,

    -- Icon or CSS class (for UI)
    -- Icono NVARCHAR(50) NULL,

    -- Color (for badges, visual states)
    -- Color NVARCHAR(7) NULL,  -- Format: #RRGGBB

    -- JSON configuration (flexible data)
    -- Configuracion NVARCHAR(MAX) NULL,

    -- Parent category (for hierarchical catalogs)
    -- CategoriaId INT NULL,

    -- ==========================================
    -- AUDIT FIELDS
    -- ==========================================
    Activo BIT NOT NULL
        CONSTRAINT DF_{CatalogName}_Activo DEFAULT 1,

    FechaCreacion DATETIME2(3) NOT NULL
        CONSTRAINT DF_{CatalogName}_FechaCreacion DEFAULT GETUTCDATE(),

    UsuarioCreacion NVARCHAR(100) NOT NULL
        CONSTRAINT DF_{CatalogName}_UsuarioCreacion DEFAULT SYSTEM_USER,

    FechaModificacion DATETIME2(3) NULL,

    UsuarioModificacion NVARCHAR(100) NULL,

    -- ==========================================
    -- CONSTRAINTS
    -- ==========================================
    CONSTRAINT PK_{CatalogName}
        PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT UX_{CatalogName}_Codigo
        UNIQUE (Codigo),

    CONSTRAINT UX_{CatalogName}_Nombre
        UNIQUE (Nombre)

    -- For hierarchical catalogs:
    -- CONSTRAINT FK_{CatalogName}_Categoria
    --     FOREIGN KEY (CategoriaId)
    --     REFERENCES [{Schema}].[{CatalogName}](Id)
);
GO

-- =============================================
-- INDEXES
-- =============================================

-- Index for code search
CREATE NONCLUSTERED INDEX IX_{CatalogName}_Codigo
    ON [{Schema}].[{CatalogName}](Codigo)
    WHERE Activo = 1;
GO

-- Index for ordered listings
CREATE NONCLUSTERED INDEX IX_{CatalogName}_Orden
    ON [{Schema}].[{CatalogName}](Orden, Nombre)
    WHERE Activo = 1;
GO

-- =============================================
-- INITIAL DATA (SEED)
-- =============================================
/*
-- Insert initial catalog values
INSERT INTO [{Schema}].[{CatalogName}] (Codigo, Nombre, Descripcion, Orden)
VALUES
    ('COD1', 'Value 1', 'Description of value 1', 1),
    ('COD2', 'Value 2', 'Description of value 2', 2),
    ('COD3', 'Value 3', 'Description of value 3', 3);
*/

-- =============================================
-- COMMON CATALOG EXAMPLES
-- =============================================

/*
-- EXAMPLE 1: Document Type
CREATE TABLE [dbo].[TipoDocumento]
(
    Id INT IDENTITY(1,1) NOT NULL,
    Codigo NVARCHAR(20) NOT NULL,      -- 'DNI', 'NIE', 'PASAPORTE'
    Nombre NVARCHAR(100) NOT NULL,      -- 'DNI', 'NIE', 'Pasaporte'
    Descripcion NVARCHAR(500) NULL,
    Orden INT NOT NULL DEFAULT 0,
    RequiereValidacion BIT NOT NULL DEFAULT 0,  -- Specific field
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
    ('OTRO', 'Other document', 99, 0);


-- EXAMPLE 2: Application Status (with colors)
CREATE TABLE [dbo].[EstadoSolicitud]
(
    Id INT IDENTITY(1,1) NOT NULL,
    Codigo NVARCHAR(20) NOT NULL,       -- 'PEND', 'APROB', 'RECH'
    Nombre NVARCHAR(100) NOT NULL,       -- 'Pending', 'Approved', 'Rejected'
    Descripcion NVARCHAR(500) NULL,
    Orden INT NOT NULL DEFAULT 0,
    Color NVARCHAR(7) NULL,              -- '#FFC107', '#28A745', '#DC3545'
    EsFinal BIT NOT NULL DEFAULT 0,      -- Indicates if it's a terminal state
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
    ('BORRADOR', 'Draft', '#6C757D', 1, 0),
    ('PENDIENTE', 'Pending review', '#FFC107', 2, 0),
    ('EN_REVISION', 'Under review', '#17A2B8', 3, 0),
    ('APROBADA', 'Approved', '#28A745', 4, 1),
    ('RECHAZADA', 'Rejected', '#DC3545', 5, 1),
    ('CANCELADA', 'Canceled', '#6C757D', 6, 1);


-- EXAMPLE 3: Hierarchical catalog (Categories)
CREATE TABLE [dbo].[Categoria]
(
    Id INT IDENTITY(1,1) NOT NULL,
    CategoriaPadreId INT NULL,           -- NULL = root category
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
-- SP TO GET CATALOG (recommended pattern)
-- =============================================
/*
CREATE OR ALTER PROCEDURE [dbo].[usp_{CatalogName}_GetAll]
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
    FROM [{Schema}].[{CatalogName}]
    WHERE (@SoloActivos = 0 OR Activo = 1)
    ORDER BY Orden, Nombre;
END
GO
*/

-- =============================================
-- VIEW FOR CATALOG (alternative)
-- =============================================
/*
CREATE OR ALTER VIEW [dbo].[vw_{CatalogName}Activos]
AS
    SELECT
        Id,
        Codigo,
        Nombre,
        Descripcion,
        Orden
    FROM [{Schema}].[{CatalogName}]
    WHERE Activo = 1;
GO
*/
