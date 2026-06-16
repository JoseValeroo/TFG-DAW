# Fase 7: UAP (Unidad de Atención Prioritaria)

## Objetivo

Gestionar el soporte y la resolución de incidencias en producción.

---

## Estructura

```
07_UAP/
├── Incidencias/      # Registro de incidencias
├── Runbooks/         # Procedimientos operativos
└── Escalado/         # Contactos y procedimientos
```

---

## Niveles de Soporte

| Nivel | Responsable | Tiempo respuesta |
|-------|-------------|------------------|
| **L1** | Help desk IT | 4h laborables |
| **L2** | Equipo desarrollo | 8h laborables |
| **L3** | Líder técnico/Vendor | Según SLA |

---

## Clasificación de Incidencias

| Severidad | Descripción | Tiempo resolución |
|-----------|-------------|-------------------|
| **Crítica** | Sistema caído, pérdida de datos | 4h |
| **Alta** | Funcionalidad principal afectada | 8h |
| **Media** | Funcionalidad secundaria afectada | 24h |
| **Baja** | Mejoras, cosméticos | Próximo sprint |

---

## Checklist

- [ ] Definir niveles de soporte
- [ ] Crear runbook de operaciones
- [ ] Documentar procedimiento de backup/restore
- [ ] Configurar contactos de escalado
- [ ] Establecer SLAs con cliente
- [ ] Configurar monitorización y alertas
- [ ] Documentar procedimientos de emergencia

---

## Documentación Obligatoria

Ver `Documentos_Base/03_Consideraciones_Comunes/` sección 8 (Soporte y Mantenimiento):

- Manual de usuario
- Manual de administración
- Runbook de operaciones
- Procedimiento de backup/restore
- Contactos de escalado

---

## Proceso de Escalado

```
Incidencia detectada
       ↓
  L1 - Help desk
  (4h respuesta)
       ↓
  ¿Resuelto? → Sí → Cerrar
       ↓ No
  L2 - Desarrollo
  (8h respuesta)
       ↓
  ¿Resuelto? → Sí → Cerrar
       ↓ No
  L3 - Líder técnico
  (Según SLA)
```

---

## Plantilla de Incidencia

```markdown
# INC-[YYYYMMDD]-[NNN]

**Severidad:** [Crítica/Alta/Media/Baja]
**Estado:** [Abierta/En progreso/Resuelta/Cerrada]
**Reportado por:** [Nombre]
**Fecha reporte:** [YYYY-MM-DD HH:MM]

## Descripción
[Descripción del problema]

## Impacto
[Usuarios/funcionalidades afectadas]

## Pasos para reproducir
1. ...
2. ...

## Resolución
[Acciones tomadas]

## Causa raíz
[Análisis de causa raíz]

## Acciones preventivas
[Medidas para evitar recurrencia]
```

---

## Enlaces

- [README principal](../README.md)
- [Anterior: Documentación](../06_Documentacion/)
