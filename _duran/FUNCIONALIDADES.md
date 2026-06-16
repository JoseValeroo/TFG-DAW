# Catalogo de Funcionalidades

> **INSTRUCCIONES PARA CLAUDE**: Este archivo documenta todas las funcionalidades de la aplicacion.
> Antes de modificar cualquier funcionalidad, revisa este catalogo para entender el contexto.
> Despues de implementar una nueva funcionalidad, actualiza este archivo.

---

## Preguntas para Contextualizar (usar en /onboarding)

### Sobre el Alcance General
- [ ] ¿Cuantos modulos/areas funcionales tiene la aplicacion?
- [ ] ¿Cual es el flujo principal de uso de la aplicacion?
- [ ] ¿Cuales son las 3-5 funcionalidades mas criticas?
- [ ] ¿Hay funcionalidades que estan deprecadas o en desuso?

### Sobre Cada Funcionalidad
- [ ] ¿Que hace exactamente esta funcionalidad?
- [ ] ¿Quien la usa (rol/perfil de usuario)?
- [ ] ¿Con que frecuencia se usa (diaria, semanal, mensual)?
- [ ] ¿Que datos maneja?
- [ ] ¿Tiene validaciones especiales de negocio?
- [ ] ¿Genera notificaciones o alertas?
- [ ] ¿Se integra con sistemas externos?

### Sobre el Estado Actual
- [ ] ¿Hay funcionalidades con bugs conocidos?
- [ ] ¿Hay funcionalidades planificadas pero no implementadas?
- [ ] ¿Que funcionalidades tienen mas incidencias de usuarios?

---

## Indice de Modulos

| Modulo | Descripcion | Estado | Criticidad |
|--------|-------------|--------|------------|
| [Nombre] | [Descripcion breve] | [Activo/Deprecado/EnDesarrollo] | [Alta/Media/Baja] |

---

## Detalle de Funcionalidades

### Modulo: [NOMBRE_MODULO]

#### [CODIGO]-001: [Nombre de la Funcionalidad]

**Descripcion**:
[Descripcion detallada de que hace esta funcionalidad]

**Usuario objetivo**:
- Rol: [Administrador/Usuario/Gestor/...]
- Frecuencia de uso: [Diaria/Semanal/Mensual/Esporadica]

**Flujo principal**:
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Reglas de negocio**:
- [Regla 1]
- [Regla 2]

**Archivos principales**:
```
src/[Modulo]/
├── Controllers/[Nombre]Controller.cs
├── Services/[Nombre]Service.cs
├── Models/[Nombre].cs
└── Views/[Nombre]/
```

**Dependencias internas**:
- Depende de: [Otras funcionalidades]
- Dependientes: [Funcionalidades que dependen de esta]

**Integraciones externas**:
- [Sistema externo]: [Tipo de integracion]

**Tests**:
- Ubicacion: `tests/[Modulo]/[Nombre]Tests.cs`
- Cobertura: [X]%

**Historial de cambios relevantes**:
| Fecha | Cambio | Motivo |
|-------|--------|--------|
| [YYYY-MM-DD] | [Descripcion] | [Por que se hizo] |

**Problemas conocidos**:
- [Problema 1]: [Estado/Workaround]

**Notas para desarrollo**:
> [Cualquier informacion util para futuros desarrollos]

---

### Modulo: [OTRO_MODULO]

<!-- Repetir estructura para cada modulo -->

---

## Funcionalidades Planificadas (Backlog)

| Codigo | Nombre | Descripcion | Prioridad | Sprint estimado |
|--------|--------|-------------|-----------|-----------------|
| [XXX-000] | [Nombre] | [Descripcion] | [Alta/Media/Baja] | [Sprint X] |

---

## Funcionalidades Deprecadas

| Codigo | Nombre | Fecha deprecacion | Motivo | Alternativa |
|--------|--------|-------------------|--------|-------------|
| [XXX-000] | [Nombre] | [YYYY-MM-DD] | [Motivo] | [Funcionalidad alternativa] |

---

## Matriz de Uso por Rol

| Funcionalidad | Admin | Gestor | Usuario | Externo |
|---------------|-------|--------|---------|---------|
| [Nombre] | RW | R | R | - |

> Leyenda: R = Lectura, W = Escritura, RW = Ambos, - = Sin acceso

---

## Preguntas que Claude debe hacer al modificar funcionalidades

### Antes de Modificar
1. "He identificado que [funcionalidad] tiene dependencias con [X, Y, Z]. ¿Quieres que revise el impacto?"
2. "Esta funcionalidad tiene [N] tests. ¿Debo ejecutarlos antes de empezar?"
3. "Veo que hay reglas de negocio especificas. ¿Siguen siendo validas para este cambio?"

### Durante la Modificacion
4. "Este cambio podria afectar a [funcionalidad dependiente]. ¿Lo tenemos en cuenta?"
5. "¿Debo actualizar la documentacion de usuario para este cambio?"
6. "¿Hay casos de uso especiales que deba considerar?"

### Despues de Modificar
7. "He actualizado [funcionalidad]. ¿Quieres que actualice este catalogo?"
8. "¿Debo notificar a alguien sobre este cambio?"
9. "¿Necesitas que genere documentacion del cambio para el changelog?"

---

**Ultima actualizacion**: [YYYY-MM-DD]
**Actualizado por**: [Nombre]
