# EVT-XXXX: [Nombre del Evolutivo]

> 📋 Este es un archivo de ejemplo. Copia este formato para tus especificaciones.
> Usa con: `/nuevo-evolutivo "EVT-XXXX: Nombre" --spec _duran/specs/EVT-XXXX.md`

## Información General

| Campo | Valor |
|-------|-------|
| **Código** | EVT-XXXX |
| **Prioridad** | 🔴 Alta / 🟠 Media / 🟡 Baja |
| **Fecha límite** | YYYY-MM-DD |
| **Solicitante** | [Área/Persona] |

## Descripción

[Descripción detallada del evolutivo]

## Endpoints

### POST /api/[recurso]
[Descripción del endpoint]

**Request:**
| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| campo1 | string | Sí | Descripción |
| campo2 | int | No | Descripción |

**Responses:**
- 201: Creado correctamente
- 400: Error de validación
- 409: Conflicto (ya existe)

### GET /api/[recurso]/{id}
[Descripción]

**Responses:**
- 200: OK
- 404: No encontrado

## Stored Procedures

> ⚠️ **IMPORTANTE**: Solo consumir, NO modificar estos SPs existentes.

| SP | Parámetros | Retorno | Uso |
|----|------------|---------|-----|
| sp_Nombre_Accion | @Param1 INT, @Param2 NVARCHAR(50) | Tabla | Descripción |
| sp_Nombre_Validar | @Id INT | BIT + mensaje | Validación de negocio |

## Validaciones de Negocio

1. **[Validación 1]**: Descripción de la regla de negocio
2. **[Validación 2]**: Descripción de la regla de negocio
3. **[Validación 3]**: Descripción de la regla de negocio

## Integraciones Externas

### [Nombre del servicio]
- **URL**: https://api.ejemplo.com/v1/endpoint
- **Auth**: OAuth2 / API Key / Basic
- **Timeout**: 30 segundos
- **Retry**: 3 intentos

## Modelo de Datos

### Tablas Nuevas

```sql
CREATE TABLE [NombreTabla] (
    Id INT IDENTITY PRIMARY KEY,
    Campo1 NVARCHAR(100) NOT NULL,
    Campo2 INT,
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Tabla_Referencia FOREIGN KEY (Campo2)
        REFERENCES OtraTabla(Id)
)
```

### Tablas a Modificar
Ninguna / [Describir cambios]

## Criterios de Aceptación

> ✅ Estos criterios se convierten automáticamente en el checklist del evolutivo.

- [ ] Endpoint POST funciona según especificación
- [ ] Endpoint GET funciona según especificación
- [ ] Validaciones de negocio implementadas
- [ ] Integración con [servicio] operativa
- [ ] Tests unitarios con cobertura > 80%
- [ ] Tests de integración para SPs
- [ ] Documentación de API actualizada

## Notas Adicionales

[Cualquier información adicional relevante para el desarrollo]
