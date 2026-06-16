-- =============================================
-- PLANTILLA DE SCRIPT DE MIGRACIÓN
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Este archivo contiene:
--   1. Plantilla de migración estándar
--   2. Script de rollback correspondiente
-- =============================================

-- #############################################
-- PARTE 1: SCRIPT DE MIGRACIÓN
-- #############################################

-- =============================================
-- Migración: {NombreDescriptivo}
-- Ticket/Evolutivo: {CodigoEvolutivo}
-- Autor: {NombreAutor}
-- Fecha: {YYYY-MM-DD}
-- =============================================
-- DESCRIPCIÓN:
--   {DescripcionDetallada}
--
-- CAMBIOS:
--   - {Cambio1}
--   - {Cambio2}
--   - {Cambio3}
--
-- PRECONDICIONES:
--   - {Precondicion1}
--   - {Precondicion2}
--
-- TIEMPO ESTIMADO: {X} minutos
-- REQUIERE DOWNTIME: {Sí/No}
-- =============================================
-- ⚠️ IMPORTANTE:
--   - Ejecutar en horario de bajo uso
--   - Hacer BACKUP antes de ejecutar en producción
--   - Probar primero en entorno de desarrollo/staging
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- Información de ejecución
PRINT '================================================';
PRINT 'MIGRACIÓN: {NombreDescriptivo}';
PRINT 'Inicio: ' + CONVERT(VARCHAR(30), GETDATE(), 121);
PRINT 'Base de datos: ' + DB_NAME();
PRINT 'Servidor: ' + @@SERVERNAME;
PRINT 'Usuario: ' + SYSTEM_USER;
PRINT '================================================';

BEGIN TRY
    BEGIN TRANSACTION;
    
    -- ==========================================
    -- PASO 1: VERIFICACIONES PREVIAS
    -- ==========================================
    PRINT '';
    PRINT '[1/5] Verificando precondiciones...';
    
    -- Verificar que no se haya ejecutado antes
    IF EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('{Schema}.{Tabla}') 
        AND name = '{NuevaColumna}'
    )
    BEGIN
        PRINT '  ⚠️ La migración ya fue ejecutada. Abortando.';
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Verificar que existe la tabla/objeto requerido
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('{Schema}.{Tabla}'))
    BEGIN
        RAISERROR('La tabla {Schema}.{Tabla} no existe. Abortando.', 16, 1);
    END
    
    PRINT '  ✓ Precondiciones verificadas';
    
    -- ==========================================
    -- PASO 2: CAMBIOS DE ESTRUCTURA
    -- ==========================================
    PRINT '';
    PRINT '[2/5] Aplicando cambios de estructura...';
    
    -- Ejemplo: Agregar columna
    ALTER TABLE [{Schema}].[{Tabla}]
    ADD [{NuevaColumna}] {TipoDato} NULL;
    
    PRINT '  ✓ Columna {NuevaColumna} agregada';
    
    -- Ejemplo: Agregar constraint
    -- ALTER TABLE [{Schema}].[{Tabla}]
    -- ADD CONSTRAINT DF_{Tabla}_{NuevaColumna} DEFAULT {Valor} FOR [{NuevaColumna}];
    -- PRINT '  ✓ Constraint default agregado';
    
    -- Ejemplo: Crear índice
    -- CREATE NONCLUSTERED INDEX IX_{Tabla}_{NuevaColumna}
    --     ON [{Schema}].[{Tabla}]([{NuevaColumna}]);
    -- PRINT '  ✓ Índice creado';
    
    -- ==========================================
    -- PASO 3: MIGRACIÓN DE DATOS
    -- ==========================================
    PRINT '';
    PRINT '[3/5] Migrando datos...';
    
    DECLARE @RowsUpdated INT = 0;
    
    -- Ejemplo: Actualizar datos existentes
    UPDATE [{Schema}].[{Tabla}]
    SET [{NuevaColumna}] = {ValorPorDefecto}
    WHERE [{NuevaColumna}] IS NULL;
    
    SET @RowsUpdated = @@ROWCOUNT;
    PRINT '  ✓ ' + CAST(@RowsUpdated AS VARCHAR(20)) + ' registros actualizados';
    
    -- ==========================================
    -- PASO 4: APLICAR CONSTRAINTS FINALES
    -- ==========================================
    PRINT '';
    PRINT '[4/5] Aplicando constraints finales...';
    
    -- Ejemplo: Hacer columna NOT NULL (después de migrar datos)
    -- ALTER TABLE [{Schema}].[{Tabla}]
    -- ALTER COLUMN [{NuevaColumna}] {TipoDato} NOT NULL;
    -- PRINT '  ✓ Columna marcada como NOT NULL';
    
    -- Ejemplo: Agregar Foreign Key
    -- ALTER TABLE [{Schema}].[{Tabla}]
    -- ADD CONSTRAINT FK_{Tabla}_{TablaRelacionada}
    --     FOREIGN KEY ([{NuevaColumna}]) 
    --     REFERENCES [{Schema}].[{TablaRelacionada}](Id);
    -- PRINT '  ✓ Foreign Key agregada';
    
    PRINT '  ✓ Constraints aplicados';
    
    -- ==========================================
    -- PASO 5: VALIDACIÓN POST-MIGRACIÓN
    -- ==========================================
    PRINT '';
    PRINT '[5/5] Validando migración...';
    
    -- Verificar que la columna existe
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('{Schema}.{Tabla}') 
        AND name = '{NuevaColumna}'
    )
    BEGIN
        RAISERROR('Validación fallida: La columna no existe después de la migración.', 16, 1);
    END
    
    -- Verificar integridad de datos
    DECLARE @NullCount INT;
    SELECT @NullCount = COUNT(*) 
    FROM [{Schema}].[{Tabla}] 
    WHERE [{NuevaColumna}] IS NULL AND Activo = 1;
    
    IF @NullCount > 0
    BEGIN
        PRINT '  ⚠️ Advertencia: ' + CAST(@NullCount AS VARCHAR(20)) + ' registros activos con valor NULL';
    END
    ELSE
    BEGIN
        PRINT '  ✓ Todos los registros tienen valor asignado';
    END
    
    -- ==========================================
    -- COMMIT
    -- ==========================================
    COMMIT TRANSACTION;
    
    PRINT '';
    PRINT '================================================';
    PRINT '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
    PRINT 'Fin: ' + CONVERT(VARCHAR(30), GETDATE(), 121);
    PRINT '================================================';
    
END TRY
BEGIN CATCH
    -- ==========================================
    -- MANEJO DE ERRORES
    -- ==========================================
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    PRINT '';
    PRINT '================================================';
    PRINT '❌ ERROR EN MIGRACIÓN';
    PRINT 'Error número: ' + CAST(ERROR_NUMBER() AS VARCHAR(20));
    PRINT 'Mensaje: ' + ERROR_MESSAGE();
    PRINT 'Línea: ' + CAST(ERROR_LINE() AS VARCHAR(20));
    PRINT 'Procedimiento: ' + ISNULL(ERROR_PROCEDURE(), 'Script');
    PRINT '================================================';
    
    -- Re-lanzar error
    THROW;
END CATCH
GO


-- #############################################
-- PARTE 2: SCRIPT DE ROLLBACK
-- #############################################

/*
-- =============================================
-- ROLLBACK: {NombreDescriptivo}
-- Ticket/Evolutivo: {CodigoEvolutivo}
-- =============================================
-- ⚠️ EJECUTAR SOLO SI LA MIGRACIÓN FALLÓ O SE REQUIERE REVERTIR
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

PRINT '================================================';
PRINT 'ROLLBACK: {NombreDescriptivo}';
PRINT 'Inicio: ' + CONVERT(VARCHAR(30), GETDATE(), 121);
PRINT '================================================';

BEGIN TRY
    BEGIN TRANSACTION;
    
    -- Verificar que existe lo que vamos a eliminar
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('{Schema}.{Tabla}') 
        AND name = '{NuevaColumna}'
    )
    BEGIN
        PRINT '  ⚠️ La columna no existe. Nada que revertir.';
        ROLLBACK TRANSACTION;
        RETURN;
    END
    
    -- Eliminar constraints dependientes primero
    -- IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_{Tabla}_{TablaRelacionada}')
    -- BEGIN
    --     ALTER TABLE [{Schema}].[{Tabla}] DROP CONSTRAINT FK_{Tabla}_{TablaRelacionada};
    --     PRINT '  ✓ Foreign Key eliminada';
    -- END
    
    -- IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_{Tabla}_{NuevaColumna}')
    -- BEGIN
    --     DROP INDEX IX_{Tabla}_{NuevaColumna} ON [{Schema}].[{Tabla}];
    --     PRINT '  ✓ Índice eliminado';
    -- END
    
    -- IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_{Tabla}_{NuevaColumna}')
    -- BEGIN
    --     ALTER TABLE [{Schema}].[{Tabla}] DROP CONSTRAINT DF_{Tabla}_{NuevaColumna};
    --     PRINT '  ✓ Default constraint eliminado';
    -- END
    
    -- Eliminar columna
    ALTER TABLE [{Schema}].[{Tabla}]
    DROP COLUMN [{NuevaColumna}];
    
    PRINT '  ✓ Columna {NuevaColumna} eliminada';
    
    COMMIT TRANSACTION;
    
    PRINT '';
    PRINT '================================================';
    PRINT '✅ ROLLBACK COMPLETADO';
    PRINT '================================================';
    
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    
    PRINT '';
    PRINT '================================================';
    PRINT '❌ ERROR EN ROLLBACK';
    PRINT 'Error: ' + ERROR_MESSAGE();
    PRINT '================================================';
    
    THROW;
END CATCH
GO
*/


-- #############################################
-- PLANTILLA PARA MIGRACIONES DE DATOS MASIVOS
-- #############################################

/*
-- Para migraciones de grandes volúmenes de datos,
-- usar procesamiento por lotes para evitar bloqueos:

DECLARE @BatchSize INT = 10000;
DECLARE @RowsAffected INT = 1;
DECLARE @TotalRows INT = 0;

WHILE @RowsAffected > 0
BEGIN
    UPDATE TOP (@BatchSize) [{Schema}].[{Tabla}]
    SET [{NuevaColumna}] = {ValorCalculado}
    WHERE [{NuevaColumna}] IS NULL;
    
    SET @RowsAffected = @@ROWCOUNT;
    SET @TotalRows = @TotalRows + @RowsAffected;
    
    PRINT 'Procesados: ' + CAST(@TotalRows AS VARCHAR(20)) + ' registros';
    
    -- Pequeña pausa para no saturar el servidor
    WAITFOR DELAY '00:00:01';
END

PRINT 'Total actualizado: ' + CAST(@TotalRows AS VARCHAR(20));
*/
