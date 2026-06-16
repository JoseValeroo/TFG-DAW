# Sesión Actual

> **Propósito**: Mantener contexto entre sesiones de trabajo y usuarios.
> **Actualizar**: Al final de cada sesión con Claude.

---

## Estado de la Última Sesión

| Campo | Valor |
|-------|-------|
| **Fecha** | [YYYY-MM-DD] |
| **Usuario** | [Iniciales o nombre] |
| **Evolutivo activo** | [ID o "ninguno"] |
| **Duración aprox.** | [X horas] |

---

## Resumen de lo Trabajado

### Objetivos cumplidos
- [ ] [Objetivo 1]
- [ ] [Objetivo 2]
- [ ] [Objetivo 3]

### Archivos modificados
- `[ruta/archivo1]` - [descripción breve]
- `[ruta/archivo2]` - [descripción breve]

### Decisiones tomadas
- **D1**: [Decisión] - [Justificación breve]
- **D2**: [Decisión] - [Justificación breve]

---

## Contexto para Próxima Sesión

### Estado del evolutivo actual
```
ID: [HV-XX o ninguno]
Fase: [Análisis / Desarrollo / Testing / Completado]
Progreso: [X%]
Bloqueadores: [ninguno o descripción]
```

### Tareas pendientes prioritarias
1. [ ] [Tarea más urgente]
2. [ ] [Segunda tarea]
3. [ ] [Tercera tarea]

### Notas importantes
- [Información crítica que no debe perderse]
- [Dependencias o consideraciones especiales]
- [Contexto técnico relevante]

---

## Historial Reciente

| Fecha | Usuario | Trabajo principal |
|-------|---------|-------------------|
| [YYYY-MM-DD] | [XX] | [Resumen breve] |
| [YYYY-MM-DD] | [XX] | [Resumen breve] |
| [YYYY-MM-DD] | [XX] | [Resumen breve] |

---

## Cómo Usar Este Archivo

### Al iniciar sesión
1. Claude lee automáticamente este archivo (importado en CLAUDE.md)
2. Revisar "Contexto para Próxima Sesión" para entender estado actual
3. Continuar con tareas pendientes o iniciar nueva solicitud

### Al finalizar sesión
1. Ejecutar `/acta` para documentar en detalle (si la sesión fue significativa)
2. Actualizar este archivo con resumen breve:
   - Qué se hizo
   - Qué quedó pendiente
   - Notas para quien continúe
3. Actualizar el historial reciente

### Trabajo en equipo
- Este archivo sirve como "handoff" entre sesiones y usuarios
- Cada persona actualiza al terminar su sesión
- El historial muestra quién trabajó en qué

### Comandos relacionados
- `/estado` - Ver estado completo del proyecto
- `/acta` - Generar acta detallada de la sesión
- `/pausar` - Pausar evolutivo actual (guarda contexto)
- `/continuar` - Retomar evolutivo pausado

---

*Archivo de contexto de sesion - STIC.IA v3.13.0*
