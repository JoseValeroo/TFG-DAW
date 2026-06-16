-- =============================================
-- MIGRATION SCRIPT TEMPLATE
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- This file contains:
--   1. Standard migration template
--   2. Corresponding rollback script
-- =============================================

-- #############################################
-- PART 1: MIGRATION SCRIPT
-- #############################################

-- =============================================
-- Migration: {DescriptiveName}
-- Ticket/Feature: {FeatureCode}
-- Author: {AuthorName}
-- Date: {YYYY-MM-DD}
-- =============================================
-- DESCRIPTION:
--   {DetailedDescription}
--
-- CHANGES:
--   - {Change1}
--   - {Change2}
--   - {Change3}
--
-- PRECONDITIONS:
--   - {Precondition1}
--   - {Precondition2}
--
-- ESTIMATED TIME: {X} minutes
-- REQUIRES DOWNTIME: {Yes/No}
-- =============================================
-- ⚠️ IMPORTANT:
--   - Execute during low usage hours
--   - Make BACKUP before executing in production
--   - Test first in development/staging environment
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- Execution information
PRINT '================================================';
PRINT 'MIGRATION: {DescriptiveName}';
PRINT 'Start: ' + CONVERT(VARCHAR(30), GETDATE(), 121);
PRINT 'Database: ' + DB_NAME();
PRINT 'Server: ' + @@SERVERNAME;
PRINT 'User: ' + SYSTEM_USER;
PRINT '================================================';

BEGIN TRY
    BEGIN TRANSACTION;

    -- ==========================================
    -- STEP 1: PRIOR VERIFICATIONS
    -- ==========================================
    PRINT '';
    PRINT '[1/5] Verifying preconditions...';

    -- Verify it hasn't been executed before
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('{Schema}.{Table}')
        AND name = '{NewColumn}'
    )
    BEGIN
        PRINT '  ⚠️ Migration already executed. Aborting.';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Verify required table/object exists
    IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('{Schema}.{Table}'))
    BEGIN
        RAISERROR('Table {Schema}.{Table} does not exist. Aborting.', 16, 1);
    END

    PRINT '  ✓ Preconditions verified';

    -- ==========================================
    -- STEP 2: STRUCTURE CHANGES
    -- ==========================================
    PRINT '';
    PRINT '[2/5] Applying structure changes...';

    -- Example: Add column
    ALTER TABLE [{Schema}].[{Table}]
    ADD [{NewColumn}] {DataType} NULL;

    PRINT '  ✓ Column {NewColumn} added';

    -- Example: Add constraint
    -- ALTER TABLE [{Schema}].[{Table}]
    -- ADD CONSTRAINT DF_{Table}_{NewColumn} DEFAULT {Value} FOR [{NewColumn}];
    -- PRINT '  ✓ Default constraint added';

    -- Example: Create index
    -- CREATE NONCLUSTERED INDEX IX_{Table}_{NewColumn}
    --     ON [{Schema}].[{Table}]([{NewColumn}]);
    -- PRINT '  ✓ Index created';

    -- ==========================================
    -- STEP 3: DATA MIGRATION
    -- ==========================================
    PRINT '';
    PRINT '[3/5] Migrating data...';

    DECLARE @RowsUpdated INT = 0;

    -- Example: Update existing data
    UPDATE [{Schema}].[{Table}]
    SET [{NewColumn}] = {DefaultValue}
    WHERE [{NewColumn}] IS NULL;

    SET @RowsUpdated = @@ROWCOUNT;
    PRINT '  ✓ ' + CAST(@RowsUpdated AS VARCHAR(20)) + ' records updated';

    -- ==========================================
    -- STEP 4: APPLY FINAL CONSTRAINTS
    -- ==========================================
    PRINT '';
    PRINT '[4/5] Applying final constraints...';

    -- Example: Make column NOT NULL (after migrating data)
    -- ALTER TABLE [{Schema}].[{Table}]
    -- ALTER COLUMN [{NewColumn}] {DataType} NOT NULL;
    -- PRINT '  ✓ Column marked as NOT NULL';

    -- Example: Add Foreign Key
    -- ALTER TABLE [{Schema}].[{Table}]
    -- ADD CONSTRAINT FK_{Table}_{RelatedTable}
    --     FOREIGN KEY ([{NewColumn}])
    --     REFERENCES [{Schema}].[{RelatedTable}](Id);
    -- PRINT '  ✓ Foreign Key added';

    PRINT '  ✓ Constraints applied';

    -- ==========================================
    -- STEP 5: POST-MIGRATION VALIDATION
    -- ==========================================
    PRINT '';
    PRINT '[5/5] Validating migration...';

    -- Verify column exists
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('{Schema}.{Table}')
        AND name = '{NewColumn}'
    )
    BEGIN
        RAISERROR('Validation failed: Column does not exist after migration.', 16, 1);
    END

    -- Verify data integrity
    DECLARE @NullCount INT;
    SELECT @NullCount = COUNT(*)
    FROM [{Schema}].[{Table}]
    WHERE [{NewColumn}] IS NULL AND Activo = 1;

    IF @NullCount > 0
    BEGIN
        PRINT '  ⚠️ Warning: ' + CAST(@NullCount AS VARCHAR(20)) + ' active records with NULL value';
    END
    ELSE
    BEGIN
        PRINT '  ✓ All records have assigned value';
    END

    -- ==========================================
    -- COMMIT
    -- ==========================================
    COMMIT TRANSACTION;

    PRINT '';
    PRINT '================================================';
    PRINT '✅ MIGRATION COMPLETED SUCCESSFULLY';
    PRINT 'End: ' + CONVERT(VARCHAR(30), GETDATE(), 121);
    PRINT '================================================';

END TRY
BEGIN CATCH
    -- ==========================================
    -- ERROR HANDLING
    -- ==========================================
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '================================================';
    PRINT '❌ MIGRATION ERROR';
    PRINT 'Error number: ' + CAST(ERROR_NUMBER() AS VARCHAR(20));
    PRINT 'Message: ' + ERROR_MESSAGE();
    PRINT 'Line: ' + CAST(ERROR_LINE() AS VARCHAR(20));
    PRINT 'Procedure: ' + ISNULL(ERROR_PROCEDURE(), 'Script');
    PRINT '================================================';

    -- Re-throw error
    THROW;
END CATCH
GO


-- #############################################
-- PART 2: ROLLBACK SCRIPT
-- #############################################

/*
-- =============================================
-- ROLLBACK: {DescriptiveName}
-- Ticket/Feature: {FeatureCode}
-- =============================================
-- ⚠️ EXECUTE ONLY IF MIGRATION FAILED OR ROLLBACK IS REQUIRED
-- =============================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

PRINT '================================================';
PRINT 'ROLLBACK: {DescriptiveName}';
PRINT 'Start: ' + CONVERT(VARCHAR(30), GETDATE(), 121);
PRINT '================================================';

BEGIN TRY
    BEGIN TRANSACTION;

    -- Verify what we're going to delete exists
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID('{Schema}.{Table}')
        AND name = '{NewColumn}'
    )
    BEGIN
        PRINT '  ⚠️ Column does not exist. Nothing to rollback.';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Remove dependent constraints first
    -- IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_{Table}_{RelatedTable}')
    -- BEGIN
    --     ALTER TABLE [{Schema}].[{Table}] DROP CONSTRAINT FK_{Table}_{RelatedTable};
    --     PRINT '  ✓ Foreign Key removed';
    -- END

    -- IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_{Table}_{NewColumn}')
    -- BEGIN
    --     DROP INDEX IX_{Table}_{NewColumn} ON [{Schema}].[{Table}];
    --     PRINT '  ✓ Index removed';
    -- END

    -- IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_{Table}_{NewColumn}')
    -- BEGIN
    --     ALTER TABLE [{Schema}].[{Table}] DROP CONSTRAINT DF_{Table}_{NewColumn};
    --     PRINT '  ✓ Default constraint removed';
    -- END

    -- Remove column
    ALTER TABLE [{Schema}].[{Table}]
    DROP COLUMN [{NewColumn}];

    PRINT '  ✓ Column {NewColumn} removed';

    COMMIT TRANSACTION;

    PRINT '';
    PRINT '================================================';
    PRINT '✅ ROLLBACK COMPLETED';
    PRINT '================================================';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT '';
    PRINT '================================================';
    PRINT '❌ ROLLBACK ERROR';
    PRINT 'Error: ' + ERROR_MESSAGE();
    PRINT '================================================';

    THROW;
END CATCH
GO
*/


-- #############################################
-- TEMPLATE FOR MASSIVE DATA MIGRATIONS
-- #############################################

/*
-- For large volume data migrations,
-- use batch processing to avoid locks:

DECLARE @BatchSize INT = 10000;
DECLARE @RowsAffected INT = 1;
DECLARE @TotalRows INT = 0;

WHILE @RowsAffected > 0
BEGIN
    UPDATE TOP (@BatchSize) [{Schema}].[{Table}]
    SET [{NewColumn}] = {CalculatedValue}
    WHERE [{NewColumn}] IS NULL;

    SET @RowsAffected = @@ROWCOUNT;
    SET @TotalRows = @TotalRows + @RowsAffected;

    PRINT 'Processed: ' + CAST(@TotalRows AS VARCHAR(20)) + ' records';

    -- Small pause to not saturate the server
    WAITFOR DELAY '00:00:01';
END

PRINT 'Total updated: ' + CAST(@TotalRows AS VARCHAR(20));
*/
