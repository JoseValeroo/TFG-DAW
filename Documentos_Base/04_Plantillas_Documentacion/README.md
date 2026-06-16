# 04_Plantillas_Documentacion

Plantillas estandar para la documentacion de proyectos OTD.

---

## Contenido

| Plantilla | Proposito | Usado en |
|-----------|-----------|----------|
| `PLANTILLA_DOC_TECNICA.md` | Documentacion tecnica del sistema | 06_Documentacion/Tecnica/ |
| `PLANTILLA_DOC_FUNCIONAL.md` | Documentacion funcional para usuarios | 06_Documentacion/Manuales/ |
| `PLANTILLA_API.md` | Documentacion de endpoints API | 06_Documentacion/API/ |
| `PLANTILLA_RUNBOOK.md` | Procedimientos operativos | 07_UAP/Runbooks/ |

---

## Uso

Estas plantillas se utilizan:

1. **Manualmente**: Copiar y adaptar al proyecto
2. **Con /prepara-entrega**: Claude las usa para generar documentacion
3. **Con /sync**: Claude verifica que la documentacion siga la estructura

---

## Relacion con 06_Documentacion

```
Documentos_Base/04_Plantillas_Documentacion/
    └── PLANTILLA_DOC_TECNICA.md (PLANTILLA)
                │
                ▼
06_Documentacion/Tecnica/
    └── DOCUMENTACION_TECNICA.md (DOCUMENTO DEL PROYECTO)
```

La plantilla define la estructura; el documento del proyecto contiene el contenido especifico.
