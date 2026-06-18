-- =============================================================
-- Cambia la restricción UNIQUE de dbo.users(phone_number) por un
-- ÍNDICE ÚNICO FILTRADO, para permitir varios NULL (usuarios sin
-- teléfono) manteniendo la unicidad de los teléfonos reales.
-- Idempotente: se puede ejecutar varias veces sin error.
-- =============================================================
SET NOCOUNT ON;

-- 1) Quitar la restricción UNIQUE existente sobre phone_number (nombre autogenerado).
DECLARE @constraintName sysname;
SELECT @constraintName = i.name
FROM sys.indexes i
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('dbo.users')
  AND i.is_unique = 1
  AND i.is_primary_key = 0
  AND c.name = 'phone_number';

IF @constraintName IS NOT NULL
BEGIN
    DECLARE @sql nvarchar(max) =
        N'ALTER TABLE dbo.users DROP CONSTRAINT ' + QUOTENAME(@constraintName) + N';';
    EXEC sp_executesql @sql;
    PRINT 'Restricción UNIQUE eliminada: ' + @constraintName;
END

-- 2) Crear el índice único filtrado (solo aplica a valores no NULL).
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_users_phone_number' AND object_id = OBJECT_ID('dbo.users')
)
BEGIN
    CREATE UNIQUE INDEX UX_users_phone_number
        ON dbo.users(phone_number)
        WHERE phone_number IS NOT NULL;
    PRINT 'Índice único filtrado creado: UX_users_phone_number';
END

-- -------------------------------------------------------------
-- REVERTIR (si alguna vez quieres volver a la restricción UNIQUE clásica):
--   DROP INDEX UX_users_phone_number ON dbo.users;
--   ALTER TABLE dbo.users ADD CONSTRAINT UQ_users_phone UNIQUE (phone_number);
-- (Nota: la UNIQUE clásica solo admite un NULL.)
-- -------------------------------------------------------------
