# Fase 6: Documentacion

## Objetivo

Estandarizar la documentacion del proyecto usando las plantillas OTD.

## Herramienta Principal

**Claude Code** - Generacion automatica de documentacion con `/prepara-entrega`

---

## Estructura

```
06_Documentacion/
├── API/                    # Documentacion de API
│   ├── swagger.json        # Especificacion OpenAPI
│   └── ENDPOINTS.md        # Documentacion adicional
│
├── Tecnica/                # Documentacion tecnica
│   ├── DOCUMENTACION_TECNICA.md   ← Usar plantilla
│   ├── ARQUITECTURA.md
│   └── DIAGRAMAS/
│
└── Manuales/               # Documentacion funcional
    ├── MANUAL_USUARIO.md          ← Usar plantilla
    ├── MANUAL_ADMINISTRADOR.md
    └── GUIA_INSTALACION.md
```

---

## Plantillas Disponibles

Las plantillas estan en `Documentos_Base/04_Plantillas_Documentacion/`:

| Plantilla | Usar para | Copiar a |
|-----------|-----------|----------|
| `PLANTILLA_DOC_TECNICA.md` | Doc. tecnica | `Tecnica/DOCUMENTACION_TECNICA.md` |
| `PLANTILLA_DOC_FUNCIONAL.md` | Manual usuario | `Manuales/MANUAL_USUARIO.md` |
| `PLANTILLA_API.md` | Doc. API | `API/ENDPOINTS.md` |

---

## Checklist de Documentacion

### Documentacion Tecnica
- [ ] Arquitectura del sistema
- [ ] Stack tecnologico
- [ ] Modelo de datos
- [ ] API/Endpoints
- [ ] Seguridad
- [ ] Integraciones
- [ ] Despliegue
- [ ] Operaciones

### Documentacion Funcional
- [ ] Manual de usuario
- [ ] Manual de administrador
- [ ] Guia de instalacion
- [ ] FAQ

### Documentacion Operativa (para UAP)
- [ ] Runbook de operaciones
- [ ] Procedimiento de backup/restore
- [ ] Contactos de escalado
- [ ] Procedimientos de emergencia

---

## Generacion con Claude

### Comando /prepara-entrega

Al ejecutar `/prepara-entrega`, Claude:

1. Verifica documentacion existente
2. Detecta secciones faltantes
3. Genera/actualiza usando las plantillas
4. Pregunta por informacion adicional
5. Crea resumen de cambios

### Actualizacion Incremental

Claude mantiene la documentacion actualizada:
- Con cada `/commit` significativo
- Antes de cada `/prepara-entrega`
- Cuando se ejecuta `/sync`

---

## Documentacion Obligatoria para UAP

Para que un proyecto pueda pasar a soporte UAP, DEBE tener:

| Documento | Ubicacion | Obligatorio |
|-----------|-----------|-------------|
| Manual de usuario | Manuales/ | Si |
| Manual de admin | Manuales/ | Si |
| Runbook | ../07_UAP/Runbooks/ | Si |
| Backup/Restore | ../07_UAP/Runbooks/ | Si |
| Contactos escalado | ../07_UAP/Escalado/ | Si |

Ver `07_UAP/REQUISITOS_UAP.md` para lista completa.

---

## Buenas Practicas

1. **Usar las plantillas**: Mantienen consistencia entre proyectos
2. **Actualizar con cambios**: No dejar para el final
3. **Incluir ejemplos**: Facilitan comprension
4. **Capturas de pantalla**: En documentacion funcional
5. **Versionado**: Control de versiones del documento

---

## Enlaces

- [Plantillas de documentacion](../Documentos_Base/04_Plantillas_Documentacion/)
- [README principal](../README.md)
- [Anterior: CI/CD](../05_CICD/)
- [Siguiente: UAP](../07_UAP/)
