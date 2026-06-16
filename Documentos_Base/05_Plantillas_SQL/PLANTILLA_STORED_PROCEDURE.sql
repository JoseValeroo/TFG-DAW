-- =============================================
-- PLANTILLA DE STORED PROCEDURE
-- Universidad Pontificia Comillas - STIC
-- =============================================
-- Instrucciones:
--   1. Reemplazar {Placeholders} con valores reales
--   2. Eliminar secciones que no apliquen
--   3. Revisar antes de ejecutar
-- =============================================

-- =============================================
-- Autor:           {NombreAutor}
-- Fecha Creación:  {YYYY-MM-DD}
-- Descripción:     {DescripcionBreve}
-- Ticket/Evolutivo: {CodigoEvolutivo}
-- =============================================
-- Historial de Cambios:
-- Fecha       | Autor          | Descripción
-- ------------|----------------|------------------------------------------
-- {Fecha}     | {Autor}        | Creación inicial
-- =============================================

CREATE OR ALTER PROCEDURE [{Schema}].[usp_{Entidad}_{Accion}]
    -- ==========================================
    -- PARÁMETROS DE ENTRADA
    -- ==========================================
    @Id INT,                                    -- Identificador (requerido)
    @Parametro1 NVARCHAR(100),                  -- Descripción del parámetro
    @Parametro2 INT = NULL,                     -- Parámetro opcional con default
    @ParametroOpcional NVARCHAR(50) = NULL,     -- Otro parámetro opcional
    
    -- ==========================================
    -- PARÁMETROS DE SALIDA
    -- ==========================================
    @RowsAffected INT = 0 OUTPUT,               -- Filas afectadas
    @ErrorMessage NVARCHAR(500) = NULL OUTPUT   -- Mensaje de error si falla
AS
BEGIN
    -- ==========================================
    -- CONFIGURACIÓN INICIAL
    -- ==========================================
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    -- Variables locales
    DECLARE @Result INT = 0;
    DECLARE @TransactionStarted BIT = 0;
    
    BEGIN TRY
        -- ==========================================
        -- INICIAR TRANSACCIÓN (si no hay una activa)
        -- ==========================================
        IF @@TRANCOUNT = 0
        BEGIN
            BEGIN TRANSACTION;
            SET @TransactionStarted = 1;
        END
        
        -- ==========================================
        -- VALIDACIONES
        -- ==========================================
        
        -- Validar parámetro requerido
        IF @Id IS NULL OR @Id <= 0
        BEGIN
            SET @ErrorMessage = 'El parámetro @Id es requerido y debe ser mayor a 0';
            RAISERROR(@ErrorMessage, 16, 1);
        END
        
        -- Validar existencia del registro
        IF NOT EXISTS (SELECT 1 FROM {Schema}.{Entidad} WHERE Id = @Id)
        BEGIN
            SET @ErrorMessage = CONCAT('No existe registro con Id: ', @Id);
            RAISERROR(@ErrorMessage, 16, 1);
        END
        
        -- Validar reglas de negocio adicionales
        -- IF {condicion}
        -- BEGIN
        --     SET @ErrorMessage = '{mensaje de error}';
        --     RAISERROR(@ErrorMessage, 16, 1);
        -- END
        
        -- ==========================================
        -- LÓGICA PRINCIPAL
        -- ==========================================
        
        -- Ejemplo: UPDATE
        UPDATE {Schema}.{Entidad}
        SET 
            Columna1 = @Parametro1,
            Columna2 = @Parametro2,
            -- Auditoría (automático)
            FechaModificacion = GETUTCDATE(),
            UsuarioModificacion = SYSTEM_USER
        WHERE Id = @Id
          AND Activo = 1;
        
        SET @RowsAffected = @@ROWCOUNT;
        
        -- Validar que se actualizó algo
        IF @RowsAffected = 0
        BEGIN
            SET @ErrorMessage = 'No se actualizó ningún registro';
            RAISERROR(@ErrorMessage, 16, 1);
        END
        
        -- ==========================================
        -- COMMIT Y RETORNO EXITOSO
        -- ==========================================
        IF @TransactionStarted = 1
            COMMIT TRANSACTION;
        
        SET @Result = 0;  -- 0 = Éxito
        
    END TRY
    BEGIN CATCH
        -- ==========================================
        -- MANEJO DE ERRORES
        -- ==========================================
        
        -- Rollback si iniciamos la transacción
        IF @TransactionStarted = 1 AND @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Capturar información del error
        SET @ErrorMessage = CONCAT(
            'Error ', ERROR_NUMBER(), ': ', ERROR_MESSAGE(),
            ' [Línea ', ERROR_LINE(), ' en ', ERROR_PROCEDURE(), ']'
        );
        
        SET @Result = -1;  -- -1 = Error
        
        -- Opcional: Registrar en tabla de errores
        -- EXEC dbo.usp_Error_Registrar 
        --     @Procedimiento = '{Schema}.usp_{Entidad}_{Accion}',
        --     @ParametrosEntrada = @ParametrosJSON;
        
        -- Re-lanzar el error (opcional, según necesidad)
        -- THROW;
        
    END CATCH
    
    RETURN @Result;
END
GO

-- =============================================
-- PERMISOS (ajustar según necesidad)
-- =============================================
-- GRANT EXECUTE ON [{Schema}].[usp_{Entidad}_{Accion}] TO [db_app_executor];
-- GO

-- =============================================
-- EJEMPLO DE USO
-- =============================================
/*
DECLARE @Rows INT, @Error NVARCHAR(500);

EXEC [{Schema}].[usp_{Entidad}_{Accion}]
    @Id = 1,
    @Parametro1 = 'Valor',
    @Parametro2 = 100,
    @RowsAffected = @Rows OUTPUT,
    @ErrorMessage = @Error OUTPUT;

SELECT 
    FilasAfectadas = @Rows,
    MensajeError = @Error;
*/
