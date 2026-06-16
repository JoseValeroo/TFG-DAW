# 📁 Plantillas SQL - Base de Datos

## Descripción

Esta carpeta contiene plantillas estándar para objetos de base de datos SQL Server.
Estas plantillas siguen las convenciones de nombrado y estándares definidos por STIC.

## Contenido

| Archivo | Descripción |
|---------|-------------|
| `PLANTILLA_STORED_PROCEDURE.sql` | Plantilla completa para Stored Procedures |
| `PLANTILLA_TABLA.sql` | Plantilla de tabla con campos de auditoría |
| `PLANTILLA_TABLA_CATALOGO.sql` | Plantilla para tablas de catálogo/lookup |
| `PLANTILLA_VISTA.sql` | Plantilla de vista estándar |
| `PLANTILLA_FUNCION.sql` | Plantillas de funciones (escalar y tabla) |
| `PLANTILLA_MIGRACION.sql` | Script de migración con rollback |
| `CONVENCION_SCHEMAS.sql` | Estructura de schemas recomendada |

## Uso

1. **Copiar** la plantilla correspondiente
2. **Renombrar** según el objeto a crear
3. **Reemplazar** los placeholders `{...}` con valores reales
4. **Eliminar** las secciones que no apliquen
5. **Revisar** antes de ejecutar en producción

## Convenciones de Nombrado

### Objetos de Base de Datos

| Objeto | Convención | Ejemplo |
|--------|------------|---------|
| Tabla | PascalCase, singular | `Estudiante`, `SolicitudBeca` |
| Tabla Catálogo | PascalCase, singular | `TipoDocumento`, `EstadoSolicitud` |
| Columna | PascalCase | `FechaNacimiento`, `NumeroDocumento` |
| Stored Procedure | `usp_{Entidad}_{Accion}` | `usp_Estudiante_GetById` |
| Vista | `vw_{Descripcion}` | `vw_EstudiantesActivos` |
| Función Escalar | `fn_{Descripcion}` | `fn_CalcularEdad` |
| Función Tabla | `fnt_{Descripcion}` | `fnt_BecasPorEstudiante` |
| Trigger | `tr_{Tabla}_{Evento}` | `tr_Estudiante_AfterInsert` |
| Índice | `IX_{Tabla}_{Columnas}` | `IX_Estudiante_Email` |
| Índice Único | `UX_{Tabla}_{Columnas}` | `UX_Estudiante_NumeroDocumento` |
| Primary Key | `PK_{Tabla}` | `PK_Estudiante` |
| Foreign Key | `FK_{TablaHija}_{TablaPadre}` | `FK_Solicitud_Estudiante` |
| Check | `CK_{Tabla}_{Columna}` | `CK_Estudiante_Edad` |
| Default | `DF_{Tabla}_{Columna}` | `DF_Estudiante_FechaRegistro` |
| Schema | lowercase | `academico`, `financiero` |

### Prefijos de Stored Procedures

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `usp_{Entidad}_Insert` | Insertar | `usp_Estudiante_Insert` |
| `usp_{Entidad}_Update` | Actualizar | `usp_Estudiante_Update` |
| `usp_{Entidad}_Delete` | Eliminar físico | `usp_Estudiante_Delete` |
| `usp_{Entidad}_SoftDelete` | Eliminar lógico | `usp_Estudiante_SoftDelete` |
| `usp_{Entidad}_GetById` | Obtener por ID | `usp_Estudiante_GetById` |
| `usp_{Entidad}_GetAll` | Listar con paginación | `usp_Estudiante_GetAll` |
| `usp_{Entidad}_Search` | Búsqueda avanzada | `usp_Estudiante_Search` |
| `usp_{Entidad}_Exists` | Verificar existencia | `usp_Estudiante_Exists` |
| `usp_Rpt_{Nombre}` | Reportes | `usp_Rpt_MatriculasPorCarrera` |

## Campos de Auditoría (OBLIGATORIOS)

Todas las tablas deben incluir estos campos:

```sql
-- Obligatorios
Activo BIT NOT NULL DEFAULT 1,
FechaCreacion DATETIME2(3) NOT NULL DEFAULT GETUTCDATE(),
UsuarioCreacion NVARCHAR(100) NOT NULL DEFAULT SYSTEM_USER,
FechaModificacion DATETIME2(3) NULL,
UsuarioModificacion NVARCHAR(100) NULL
```

## Tipos de Datos Recomendados

| Uso | Tipo | Notas |
|-----|------|-------|
| Identificadores | `INT IDENTITY` | `BIGINT` si >2 mil millones |
| Texto | `NVARCHAR(n)` | Siempre Unicode |
| Texto largo | `NVARCHAR(MAX)` | No usar `TEXT` (deprecado) |
| Fechas | `DATETIME2(3)` | No usar `DATETIME` |
| Solo fecha | `DATE` | Sin hora |
| Dinero | `DECIMAL(18,2)` | No usar `MONEY` |
| Booleanos | `BIT` | 0/1 |

## Entornos

| Entorno | Versión |
|---------|---------|
| Producción principal | SQL Server 2017+ |
| Aplicaciones nuevas | SQL Server 2019/2022 |
| Cloud | Azure SQL |

## Referencia

- Regla completa: `.claude/rules/database.md`
- Documentación SQL Server: https://docs.microsoft.com/sql
