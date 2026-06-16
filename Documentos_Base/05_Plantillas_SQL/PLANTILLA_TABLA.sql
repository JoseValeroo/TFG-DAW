-- =============================================
-- PLANTILLA DE TABLA
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Instrucciones:
--   1. Reemplazar {Placeholders} con valores reales
--   2. Ajustar columnas según necesidad
--   3. Agregar Foreign Keys correspondientes
--   4. Crear índices necesarios
-- =============================================

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     {DescripcionBreve}
-- Ticket/Evolutivo: {CodigoEvolutivo}
-- =============================================

-- =============================================
-- CREAR TABLA
-- =============================================
CREATE TABLE [{Schema}].[{NombreTabla}]
(
    -- ==========================================
    -- PRIMARY KEY
    -- ==========================================
    Id INT IDENTITY(1,1) NOT NULL,
    
    -- ==========================================
    -- COLUMNAS DE NEGOCIO
    -- ==========================================
    -- Ajustar según necesidades del negocio
    
    Codigo NVARCHAR(20) NOT NULL,               -- Código único de negocio
    Nombre NVARCHAR(100) NOT NULL,              -- Nombre descriptivo
    Descripcion NVARCHAR(500) NULL,             -- Descripción opcional
    
    -- Ejemplo: Campos de texto
    -- Campo1 NVARCHAR(100) NOT NULL,
    -- Campo2 NVARCHAR(MAX) NULL,
    
    -- Ejemplo: Campos numéricos
    -- Cantidad INT NOT NULL DEFAULT 0,
    -- Monto DECIMAL(18,2) NOT NULL DEFAULT 0,
    -- Porcentaje DECIMAL(5,2) NULL,
    
    -- Ejemplo: Campos de fecha
    -- FechaInicio DATE NOT NULL,
    -- FechaFin DATE NULL,
    -- FechaHoraEvento DATETIME2(3) NULL,
    
    -- Ejemplo: Campos booleanos
    -- EsPrincipal BIT NOT NULL DEFAULT 0,
    
    -- ==========================================
    -- FOREIGN KEYS (columnas)
    -- ==========================================
    -- {EntidadRelacionada}Id INT NOT NULL,
    -- {OtraEntidad}Id INT NULL,
    
    -- ==========================================
    -- CAMPOS DE AUDITORÍA (OBLIGATORIOS)
    -- ==========================================
    Activo BIT NOT NULL 
        CONSTRAINT DF_{NombreTabla}_Activo DEFAULT 1,
    
    FechaCreacion DATETIME2(3) NOT NULL 
        CONSTRAINT DF_{NombreTabla}_FechaCreacion DEFAULT GETUTCDATE(),
    
    UsuarioCreacion NVARCHAR(100) NOT NULL 
        CONSTRAINT DF_{NombreTabla}_UsuarioCreacion DEFAULT SYSTEM_USER,
    
    FechaModificacion DATETIME2(3) NULL,
    
    UsuarioModificacion NVARCHAR(100) NULL,
    
    -- ==========================================
    -- CONSTRAINTS
    -- ==========================================
    
    -- Primary Key
    CONSTRAINT PK_{NombreTabla} 
        PRIMARY KEY CLUSTERED (Id),
    
    -- Unique constraints
    CONSTRAINT UX_{NombreTabla}_Codigo 
        UNIQUE (Codigo)
    
    -- Foreign Keys (descomentar y ajustar)
    -- CONSTRAINT FK_{NombreTabla}_{EntidadRelacionada}
    --     FOREIGN KEY ({EntidadRelacionada}Id) 
    --     REFERENCES {Schema}.{EntidadRelacionada}(Id),
    
    -- Check constraints (ejemplos)
    -- CONSTRAINT CK_{NombreTabla}_Monto 
    --     CHECK (Monto >= 0),
    -- CONSTRAINT CK_{NombreTabla}_Porcentaje 
    --     CHECK (Porcentaje BETWEEN 0 AND 100)
);
GO

-- =============================================
-- ÍNDICES
-- =============================================

-- Índice para búsquedas frecuentes
CREATE NONCLUSTERED INDEX IX_{NombreTabla}_Codigo
    ON [{Schema}].[{NombreTabla}](Codigo)
    WHERE Activo = 1;
GO

-- Índice para Foreign Keys (SIEMPRE crear)
-- CREATE NONCLUSTERED INDEX IX_{NombreTabla}_{EntidadRelacionada}Id
--     ON [{Schema}].[{NombreTabla}]({EntidadRelacionada}Id);
-- GO

-- Índice covering para consultas frecuentes
-- CREATE NONCLUSTERED INDEX IX_{NombreTabla}_Covering
--     ON [{Schema}].[{NombreTabla}](Columna1, Columna2)
--     INCLUDE (Columna3, Columna4)
--     WHERE Activo = 1;
-- GO

-- Índice para ordenamiento por fecha
CREATE NONCLUSTERED INDEX IX_{NombreTabla}_FechaCreacion
    ON [{Schema}].[{NombreTabla}](FechaCreacion DESC)
    WHERE Activo = 1;
GO

-- =============================================
-- PERMISOS (ajustar según necesidad)
-- =============================================
-- GRANT SELECT ON [{Schema}].[{NombreTabla}] TO [db_app_reader];
-- GRANT INSERT, UPDATE, DELETE ON [{Schema}].[{NombreTabla}] TO [db_app_writer];
-- GO

-- =============================================
-- DOCUMENTACIÓN
-- =============================================
/*
Tabla: {Schema}.{NombreTabla}
Descripción: {DescripcionDetallada}

Columnas principales:
- Id: Identificador único autoincremental
- Codigo: Código de negocio único
- Nombre: Nombre descriptivo

Relaciones:
- {EntidadRelacionada}: FK hacia {Schema}.{EntidadRelacionada}

Índices:
- PK_{NombreTabla}: Clustered en Id
- IX_{NombreTabla}_Codigo: Para búsquedas por código
- IX_{NombreTabla}_FechaCreacion: Para ordenamiento cronológico
*/
