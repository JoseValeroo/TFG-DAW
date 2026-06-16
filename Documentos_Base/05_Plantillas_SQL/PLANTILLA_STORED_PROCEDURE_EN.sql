-- =============================================
-- STORED PROCEDURE TEMPLATE
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Instructions:
--   1. Replace {Placeholders} with actual values
--   2. Remove sections that don't apply
--   3. Review before executing
-- =============================================

-- =============================================
-- Author:           {AuthorName}
-- Creation Date:    {YYYY-MM-DD}
-- Description:      {BriefDescription}
-- Ticket/Feature:   {FeatureCode}
-- =============================================
-- Change History:
-- Date        | Author         | Description
-- ------------|----------------|------------------------------------------
-- {Date}      | {Author}       | Initial creation
-- =============================================

CREATE OR ALTER PROCEDURE [{Schema}].[usp_{Entity}_{Action}]
    -- ==========================================
    -- INPUT PARAMETERS
    -- ==========================================
    @Id INT,                                    -- Identifier (required)
    @Parametro1 NVARCHAR(100),                  -- Parameter description
    @Parametro2 INT = NULL,                     -- Optional parameter with default
    @ParametroOpcional NVARCHAR(50) = NULL,     -- Another optional parameter

    -- ==========================================
    -- OUTPUT PARAMETERS
    -- ==========================================
    @RowsAffected INT = 0 OUTPUT,               -- Affected rows
    @ErrorMessage NVARCHAR(500) = NULL OUTPUT   -- Error message if fails
AS
BEGIN
    -- ==========================================
    -- INITIAL CONFIGURATION
    -- ==========================================
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Local variables
    DECLARE @Result INT = 0;
    DECLARE @TransactionStarted BIT = 0;

    BEGIN TRY
        -- ==========================================
        -- START TRANSACTION (if none active)
        -- ==========================================
        IF @@TRANCOUNT = 0
        BEGIN
            BEGIN TRANSACTION;
            SET @TransactionStarted = 1;
        END

        -- ==========================================
        -- VALIDATIONS
        -- ==========================================

        -- Validate required parameter
        IF @Id IS NULL OR @Id <= 0
        BEGIN
            SET @ErrorMessage = 'Parameter @Id is required and must be greater than 0';
            RAISERROR(@ErrorMessage, 16, 1);
        END

        -- Validate record existence
        IF NOT EXISTS (SELECT 1 FROM {Schema}.{Entity} WHERE Id = @Id)
        BEGIN
            SET @ErrorMessage = CONCAT('Record with Id does not exist: ', @Id);
            RAISERROR(@ErrorMessage, 16, 1);
        END

        -- Validate additional business rules
        -- IF {condition}
        -- BEGIN
        --     SET @ErrorMessage = '{error message}';
        --     RAISERROR(@ErrorMessage, 16, 1);
        -- END

        -- ==========================================
        -- MAIN LOGIC
        -- ==========================================

        -- Example: UPDATE
        UPDATE {Schema}.{Entity}
        SET
            Columna1 = @Parametro1,
            Columna2 = @Parametro2,
            -- Audit (automatic)
            FechaModificacion = GETUTCDATE(),
            UsuarioModificacion = SYSTEM_USER
        WHERE Id = @Id
          AND Activo = 1;

        SET @RowsAffected = @@ROWCOUNT;

        -- Validate that something was updated
        IF @RowsAffected = 0
        BEGIN
            SET @ErrorMessage = 'No records were updated';
            RAISERROR(@ErrorMessage, 16, 1);
        END

        -- ==========================================
        -- COMMIT AND SUCCESSFUL RETURN
        -- ==========================================
        IF @TransactionStarted = 1
            COMMIT TRANSACTION;

        SET @Result = 0;  -- 0 = Success

    END TRY
    BEGIN CATCH
        -- ==========================================
        -- ERROR HANDLING
        -- ==========================================

        -- Rollback if we started the transaction
        IF @TransactionStarted = 1 AND @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Capture error information
        SET @ErrorMessage = CONCAT(
            'Error ', ERROR_NUMBER(), ': ', ERROR_MESSAGE(),
            ' [Line ', ERROR_LINE(), ' in ', ERROR_PROCEDURE(), ']'
        );

        SET @Result = -1;  -- -1 = Error

        -- Optional: Log to error table
        -- EXEC dbo.usp_Error_Registrar
        --     @Procedimiento = '{Schema}.usp_{Entity}_{Action}',
        --     @ParametrosEntrada = @ParametrosJSON;

        -- Re-throw error (optional, as needed)
        -- THROW;

    END CATCH

    RETURN @Result;
END
GO

-- =============================================
-- PERMISSIONS (adjust as needed)
-- =============================================
-- GRANT EXECUTE ON [{Schema}].[usp_{Entity}_{Action}] TO [db_app_executor];
-- GO

-- =============================================
-- USAGE EXAMPLE
-- =============================================
/*
DECLARE @Rows INT, @Error NVARCHAR(500);

EXEC [{Schema}].[usp_{Entity}_{Action}]
    @Id = 1,
    @Parametro1 = 'Value',
    @Parametro2 = 100,
    @RowsAffected = @Rows OUTPUT,
    @ErrorMessage = @Error OUTPUT;

SELECT
    AffectedRows = @Rows,
    ErrorMessage = @Error;
*/
