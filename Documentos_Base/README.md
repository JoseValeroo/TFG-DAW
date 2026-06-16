# Documentos Base del Proyecto

Esta carpeta contiene los **tres documentos base** que contextualizan cada proyecto de la OTD.

---

## Estructura

```
Documentos_Base/
│
├── GUIA_MARKDOWN.html            # Guía de sintaxis Markdown para JP
├── EDITOR_MARKDOWN.html          # Editor genérico (para nuevos documentos)
│
├── 01_Estructura_Tecnica/
│   ├── EDITOR_ESTRUCTURA_TECNICA.html  # Editor con preview en tiempo real
│   ├── ESTRUCTURA_TECNICA.html         # Output visual (Claude genera)
│   └── ESTRUCTURA_TECNICA.md           # Fuente de verdad (JP edita)
│
├── 02_Diseño_Usabilidad/
│   ├── EDITOR_GUIA_ESTILOS.html        # Editor con preview en tiempo real
│   ├── GUIA_ESTILOS.html               # Output visual (Claude genera)
│   └── GUIA_ESTILOS.md                 # Fuente de verdad (JP edita)
│
├── 03_Consideraciones_Comunes/
│   ├── EDITOR_CONSIDERACIONES.html     # Editor con preview en tiempo real
│   ├── CONSIDERACIONES.html            # Output visual (Claude genera)
│   └── CONSIDERACIONES.md              # Fuente de verdad (JP edita)
│
└── README.md                           # Este archivo
```

---

## Flujo de Mantenimiento

### Nuevo Flujo (Sin Word)

```
1. JP abre el EDITOR_*.html del documento a modificar
       ↓
2. Edita el contenido en Markdown con preview en tiempo real
       ↓
3. Guarda el archivo .md (botón "Guardar" o Ctrl+S)
       ↓
4. Reemplaza el .md existente con el descargado
       ↓
5. Solicita a Claude: "Regenera el HTML visual desde el .md actualizado"
       ↓
6. Claude genera el nuevo HTML con estilos corporativos
       ↓
7. Se commitean los cambios (.md + .html)
```

### Herramientas Disponibles

| Herramienta | Ubicación | Uso |
|-------------|-----------|-----|
| **GUIA_MARKDOWN.html** | Raíz de Documentos_Base | Referencia de sintaxis Markdown |
| **EDITOR_*.html** | En cada subcarpeta | Editar con preview en tiempo real |

### Responsabilidades

| Rol | Responsabilidad |
|-----|-----------------|
| **JP** | Edita y aprueba los archivos .md (fuente de verdad) |
| **Líder Técnico** | Propone cambios técnicos al JP |
| **Desarrollador** | Propone mejoras, reporta inconsistencias |
| **Claude Code** | Genera los outputs HTML visuales desde los .md |

---

## Los Tres Documentos

### 1. Estructura Técnica

**Archivo fuente:** `01_Estructura_Tecnica/ESTRUCTURA_TECNICA.md`
**Editor:** `01_Estructura_Tecnica/EDITOR_ESTRUCTURA_TECNICA.html`

**Contenido:**
- Stack tecnológico (Microsoft: .NET 8, SQL Server 2017, Azure)
- Arquitectura de referencia (Clean Architecture)
- Seguridad (OWASP, Azure Key Vault, autenticación)
- Infraestructura balanceada (Azure Blob Storage, Redis)
- Proyectos Legacy (WebForms, estudio de migración)
- Docker y entorno de desarrollo
- Control de versiones (Git)

**Cuándo actualizar:** Cambios en tecnologías, nuevos patrones, actualizaciones de seguridad.

### 2. Diseño y Usabilidad

**Archivo fuente:** `02_Diseño_Usabilidad/GUIA_ESTILOS.md`
**Editor:** `02_Diseño_Usabilidad/EDITOR_GUIA_ESTILOS.html`

**Contenido:**
- Paleta de colores corporativa
- Tipografía y jerarquía visual
- Componentes UI estándar (CSS incluido)
- Layout y espaciado
- Accesibilidad (WCAG 2.1 AA)
- Responsive design

**Cuándo actualizar:** Cambios en imagen corporativa, nuevos componentes, mejoras de UX.

### 3. Consideraciones Comunes

**Archivo fuente:** `03_Consideraciones_Comunes/CONSIDERACIONES.md`
**Editor:** `03_Consideraciones_Comunes/EDITOR_CONSIDERACIONES.html`

**Contenido:**
- RGPD y protección de datos
- Normativa interna de Comillas
- Requisitos de certificación
- Integraciones con sistemas existentes
- Auditoría y trazabilidad
- Accesibilidad obligatoria

**Cuándo actualizar:** Nuevas normativas, cambios legales, nuevas integraciones.

---

## Comandos para Claude

**Para regenerar un HTML desde el .md actualizado:**
```
Lee el archivo ESTRUCTURA_TECNICA.md y regenera ESTRUCTURA_TECNICA.html
con estilos corporativos de Comillas
```

**Para revisar cambios:**
```
Compara el .md actual con el HTML y dime si hay diferencias
```

---

## Notas Importantes

1. **Los archivos .md son la fuente de verdad** - Los HTML son outputs visuales
2. **Usar los editores HTML** - Tienen preview en tiempo real y toolbar de ayuda
3. **Consultar la guía de Markdown** - Para sintaxis correcta (tablas, código, etc.)
4. **Versionado en Git** - Commitear tanto los .md como los HTML generados
5. **Frecuencia de actualización** - Estos documentos cambian pocas veces al año

---

## Atajos de Teclado en los Editores

| Atajo | Acción |
|-------|--------|
| `Ctrl + S` | Guardar/Descargar .md |
| `Ctrl + B` | Negrita |
| `Ctrl + I` | Cursiva |

---

**Versión:** 1.1
**Fecha:** Diciembre 2025
**Responsable:** Comité Técnico OTD
**Cambios v1.1:** Nuevo flujo con editores HTML en lugar de Word
