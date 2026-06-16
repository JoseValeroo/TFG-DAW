-- =============================================
-- TABLE TEMPLATE
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Instructions:
--   1. Replace {Placeholders} with actual values
--   2. Adjust columns as needed
--   3. Add corresponding Foreign Keys
--   4. Create necessary indexes
-- =============================================

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      {BriefDescription}
-- Ticket/Feature:   {FeatureCode}
-- =============================================

-- =============================================
-- CREATE TABLE
-- =============================================
CREATE TABLE [{Schema}].[{TableName}]
(
    -- ==========================================
    -- PRIMARY KEY
    -- ==========================================
    Id INT IDENTITY(1,1) NOT NULL,

    -- ==========================================
    -- BUSINESS COLUMNS
    -- ==========================================
    -- Adjust according to business needs

    Codigo NVARCHAR(20) NOT NULL,               -- Unique business code
    Nombre NVARCHAR(100) NOT NULL,              -- Descriptive name
    Descripcion NVARCHAR(500) NULL,             -- Optional description

    -- Example: Text fields
    -- Campo1 NVARCHAR(100) NOT NULL,
    -- Campo2 NVARCHAR(MAX) NULL,

    -- Example: Numeric fields
    -- Cantidad INT NOT NULL DEFAULT 0,
    -- Monto DECIMAL(18,2) NOT NULL DEFAULT 0,
    -- Porcentaje DECIMAL(5,2) NULL,

    -- Example: Date fields
    -- FechaInicio DATE NOT NULL,
    -- FechaFin DATE NULL,
    -- FechaHoraEvento DATETIME2(3) NULL,

    -- Example: Boolean fields
    -- EsPrincipal BIT NOT NULL DEFAULT 0,

    -- ==========================================
    -- FOREIGN KEYS (columns)
    -- ==========================================
    -- {RelatedEntity}Id INT NOT NULL,
    -- {OtherEntity}Id INT NULL,

    -- ==========================================
    -- AUDIT FIELDS (MANDATORY)
    -- ==========================================
    Activo BIT NOT NULL
        CONSTRAINT DF_{TableName}_Activo DEFAULT 1,

    FechaCreacion DATETIME2(3) NOT NULL
        CONSTRAINT DF_{TableName}_FechaCreacion DEFAULT GETUTCDATE(),

    UsuarioCreacion NVARCHAR(100) NOT NULL
        CONSTRAINT DF_{TableName}_UsuarioCreacion DEFAULT SYSTEM_USER,

    FechaModificacion DATETIME2(3) NULL,

    UsuarioModificacion NVARCHAR(100) NULL,

    -- ==========================================
    -- CONSTRAINTS
    -- ==========================================

    -- Primary Key
    CONSTRAINT PK_{TableName}
        PRIMARY KEY CLUSTERED (Id),

    -- Unique constraints
    CONSTRAINT UX_{TableName}_Codigo
        UNIQUE (Codigo)

    -- Foreign Keys (uncomment and adjust)
    -- CONSTRAINT FK_{TableName}_{RelatedEntity}
    --     FOREIGN KEY ({RelatedEntity}Id)
    --     REFERENCES {Schema}.{RelatedEntity}(Id),

    -- Check constraints (examples)
    -- CONSTRAINT CK_{TableName}_Monto
    --     CHECK (Monto >= 0),
    -- CONSTRAINT CK_{TableName}_Porcentaje
    --     CHECK (Porcentaje BETWEEN 0 AND 100)
);
GO

-- =============================================
-- INDEXES
-- =============================================

-- Index for frequent searches
CREATE NONCLUSTERED INDEX IX_{TableName}_Codigo
    ON [{Schema}].[{TableName}](Codigo)
    WHERE Activo = 1;
GO

-- Index for Foreign Keys (ALWAYS create)
-- CREATE NONCLUSTERED INDEX IX_{TableName}_{RelatedEntity}Id
--     ON [{Schema}].[{TableName}]({RelatedEntity}Id);
-- GO

-- Covering index for frequent queries
-- CREATE NONCLUSTERED INDEX IX_{TableName}_Covering
--     ON [{Schema}].[{TableName}](Columna1, Columna2)
--     INCLUDE (Columna3, Columna4)
--     WHERE Activo = 1;
-- GO

-- Index for date ordering
CREATE NONCLUSTERED INDEX IX_{TableName}_FechaCreacion
    ON [{Schema}].[{TableName}](FechaCreacion DESC)
    WHERE Activo = 1;
GO

-- =============================================
-- PERMISSIONS (adjust as needed)
-- =============================================
-- GRANT SELECT ON [{Schema}].[{TableName}] TO [db_app_reader];
-- GRANT INSERT, UPDATE, DELETE ON [{Schema}].[{TableName}] TO [db_app_writer];
-- GO

-- =============================================
-- DOCUMENTATION
-- =============================================
/*
Table: {Schema}.{TableName}
Description: {DetailedDescription}

Main columns:
- Id: Unique auto-incremental identifier
- Codigo: Unique business code
- Nombre: Descriptive name

Relationships:
- {RelatedEntity}: FK to {Schema}.{RelatedEntity}

Indexes:
- PK_{TableName}: Clustered on Id
- IX_{TableName}_Codigo: For code searches
- IX_{TableName}_FechaCreacion: For chronological ordering
*/
