# Guía de Diseño y Usabilidad

Estándares visuales y de experiencia de usuario para aplicaciones de la OTD - Universidad Pontificia Comillas.

---

## 1. Identidad Visual

### 1.1 Logos

| Logo | Uso | Ubicación |
|------|-----|-----------|
| **Comillas (principal)** | Header de aplicaciones | `assets/logo_comillas.svg` |
| **OTD** | Footer o secundario | `assets/logo_otd.svg` |

**Reglas de uso:**
- Logo de Comillas siempre visible en header
- Espacio mínimo alrededor del logo: altura del logo
- No deformar, rotar ni cambiar colores
- Fondo claro preferido, si oscuro usar versión en blanco

### 1.2 Paleta de Colores

#### Colores Primarios (Corporativos)

| Nombre | HEX | RGB | Uso |
|--------|-----|-----|-----|
| **Azul Comillas** | `#003366` | rgb(0, 51, 102) | Headers, botones primarios |
| **Azul Claro** | `#0066CC` | rgb(0, 102, 204) | Enlaces, acentos |
| **Blanco** | `#FFFFFF` | rgb(255, 255, 255) | Fondos, texto sobre oscuro |

#### Colores Secundarios

| Nombre | HEX | RGB | Uso |
|--------|-----|-----|-----|
| **Gris Oscuro** | `#333333` | rgb(51, 51, 51) | Texto principal |
| **Gris Medio** | `#666666` | rgb(102, 102, 102) | Texto secundario |
| **Gris Claro** | `#F5F5F5` | rgb(245, 245, 245) | Fondos alternos |
| **Borde** | `#DDDDDD` | rgb(221, 221, 221) | Líneas, separadores |

#### Colores de Estado

| Estado | HEX | Uso |
|--------|-----|-----|
| **Éxito** | `#28A745` | Confirmaciones, completado |
| **Advertencia** | `#FFC107` | Alertas, pendiente |
| **Error** | `#DC3545` | Errores, eliminación |
| **Información** | `#17A2B8` | Información, ayuda |

#### Variables CSS

```css
:root {
    /* Primarios */
    --color-primary: #003366;
    --color-primary-light: #0066CC;
    --color-white: #FFFFFF;

    /* Secundarios */
    --color-text: #333333;
    --color-text-secondary: #666666;
    --color-background: #F5F5F5;
    --color-border: #DDDDDD;

    /* Estados */
    --color-success: #28A745;
    --color-warning: #FFC107;
    --color-error: #DC3545;
    --color-info: #17A2B8;
}
```

---

## 2. Tipografía

### 2.1 Fuentes

| Tipo | Fuente | Fallback | Uso |
|------|--------|----------|-----|
| **Principal** | Segoe UI | Tahoma, sans-serif | Todo el texto |
| **Código** | Consolas | Monaco, monospace | Código, datos técnicos |

### 2.2 Escala Tipográfica

| Elemento | Tamaño | Peso | Line-height |
|----------|--------|------|-------------|
| H1 | 2rem (32px) | 600 | 1.2 |
| H2 | 1.5rem (24px) | 600 | 1.3 |
| H3 | 1.25rem (20px) | 600 | 1.4 |
| H4 | 1rem (16px) | 600 | 1.4 |
| Cuerpo | 1rem (16px) | 400 | 1.6 |
| Pequeño | 0.875rem (14px) | 400 | 1.5 |
| Muy pequeño | 0.75rem (12px) | 400 | 1.4 |

### 2.3 CSS Base

```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
}

h1, h2, h3, h4 {
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 0.5em;
}

h1 { font-size: 2rem; line-height: 1.2; }
h2 { font-size: 1.5rem; line-height: 1.3; }
h3 { font-size: 1.25rem; line-height: 1.4; }
h4 { font-size: 1rem; line-height: 1.4; }

code {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    background: #E9ECEF;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
}
```

---

## 3. Componentes UI

### 3.1 Botones

#### Estilos

| Tipo | Uso | Estilo |
|------|-----|--------|
| **Primario** | Acción principal | Fondo azul, texto blanco |
| **Secundario** | Acciones alternativas | Borde azul, fondo blanco |
| **Peligro** | Eliminar, cancelar | Fondo rojo |
| **Deshabilitado** | No disponible | Gris, cursor not-allowed |

#### CSS

```css
.btn {
    display: inline-block;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
    border: 2px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.btn-primary:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
}

.btn-secondary {
    background: white;
    color: var(--color-primary);
    border-color: var(--color-primary);
}

.btn-secondary:hover {
    background: var(--color-primary);
    color: white;
}

.btn-danger {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
}

.btn:disabled {
    background: #CCCCCC;
    border-color: #CCCCCC;
    color: #666666;
    cursor: not-allowed;
}
```

### 3.2 Formularios

#### Inputs

```css
.form-group {
    margin-bottom: 1rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--color-text);
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    font-size: 1rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: var(--color-primary-light);
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
}

.form-control.is-invalid {
    border-color: var(--color-error);
}

.form-control.is-valid {
    border-color: var(--color-success);
}

.form-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
}

.invalid-feedback {
    font-size: 0.875rem;
    color: var(--color-error);
    margin-top: 0.25rem;
}
```

### 3.3 Tablas

```css
.table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

.table th,
.table td {
    padding: 12px;
    text-align: left;
    border: 1px solid var(--color-border);
}

.table th {
    background: var(--color-primary);
    color: white;
    font-weight: 600;
}

.table tr:nth-child(even) {
    background: #F9F9F9;
}

.table tr:hover {
    background: #E3F2FD;
}
```

### 3.4 Alertas

```css
.alert {
    padding: 15px 20px;
    border-radius: 6px;
    margin: 1rem 0;
    border-left: 4px solid;
}

.alert-success {
    background: #D4EDDA;
    border-color: var(--color-success);
    color: #155724;
}

.alert-warning {
    background: #FFF3CD;
    border-color: var(--color-warning);
    color: #856404;
}

.alert-error {
    background: #F8D7DA;
    border-color: var(--color-error);
    color: #721C24;
}

.alert-info {
    background: #D1ECF1;
    border-color: var(--color-info);
    color: #0C5460;
}
```

### 3.5 Cards

```css
.card {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.card-header {
    padding: 15px 20px;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    font-weight: 600;
}

.card-body {
    padding: 20px;
}

.card-footer {
    padding: 15px 20px;
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
}
```

---

## 4. Layout

### 4.1 Contenedor Principal

```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.container-fluid {
    width: 100%;
    padding: 0 20px;
}
```

### 4.2 Grid Sistema

```css
.row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px;
}

.col {
    flex: 1;
    padding: 0 15px;
}

.col-6 { flex: 0 0 50%; max-width: 50%; }
.col-4 { flex: 0 0 33.333%; max-width: 33.333%; }
.col-3 { flex: 0 0 25%; max-width: 25%; }
.col-12 { flex: 0 0 100%; max-width: 100%; }
```

### 4.3 Espaciado

| Clase | Valor | Uso |
|-------|-------|-----|
| `.m-1` | 0.25rem (4px) | Margen mínimo |
| `.m-2` | 0.5rem (8px) | Margen pequeño |
| `.m-3` | 1rem (16px) | Margen normal |
| `.m-4` | 1.5rem (24px) | Margen medio |
| `.m-5` | 3rem (48px) | Margen grande |

*Aplica también para padding (`.p-X`) y direcciones (`.mt-`, `.mb-`, `.ml-`, `.mr-`)*

---

## 5. Navegación

### 5.1 Header

```css
.header {
    background: var(--color-primary);
    color: white;
    padding: 15px 0;
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-logo img {
    height: 40px;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 20px;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 10px 15px;
    border-radius: 4px;
    transition: background 0.2s;
}

.nav-link:hover,
.nav-link.active {
    background: rgba(255, 255, 255, 0.1);
}
```

### 5.2 Breadcrumbs

```css
.breadcrumb {
    display: flex;
    list-style: none;
    padding: 10px 0;
    font-size: 0.875rem;
}

.breadcrumb-item + .breadcrumb-item::before {
    content: "/";
    padding: 0 10px;
    color: var(--color-text-secondary);
}

.breadcrumb-item a {
    color: var(--color-primary-light);
    text-decoration: none;
}

.breadcrumb-item.active {
    color: var(--color-text-secondary);
}
```

---

## 6. Responsive Design

### 6.1 Breakpoints

| Nombre | Ancho | Dispositivo |
|--------|-------|-------------|
| **xs** | < 576px | Móvil vertical |
| **sm** | >= 576px | Móvil horizontal |
| **md** | >= 768px | Tablet |
| **lg** | >= 992px | Desktop |
| **xl** | >= 1200px | Desktop grande |

### 6.2 Media Queries

```css
/* Móvil primero (mobile-first) */

/* Tablet y superior */
@media (min-width: 768px) {
    .container { max-width: 720px; }
}

/* Desktop */
@media (min-width: 992px) {
    .container { max-width: 960px; }
}

/* Desktop grande */
@media (min-width: 1200px) {
    .container { max-width: 1140px; }
}
```

### 6.3 Reglas Responsive

- **Móvil:** Navegación colapsada (hamburger), formularios a 100%
- **Tablet:** Grid de 2 columnas máximo
- **Desktop:** Layout completo, sidebars visibles

---

## 7. Accesibilidad (WCAG 2.1 AA)

### 7.1 Contraste de Color

| Combinación | Ratio Mínimo | Estado |
|-------------|--------------|--------|
| Texto normal sobre fondo | 4.5:1 | Obligatorio |
| Texto grande (18px+) sobre fondo | 3:1 | Obligatorio |
| Elementos UI | 3:1 | Obligatorio |

**Herramienta de verificación:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 7.2 Checklist de Accesibilidad

- [ ] Todas las imágenes tienen `alt` descriptivo
- [ ] Formularios tienen `label` asociados
- [ ] Navegación por teclado funcional (Tab, Enter, Escape)
- [ ] Focus visible en elementos interactivos
- [ ] Textos de enlace descriptivos (no "click aquí")
- [ ] Estructura de encabezados jerárquica (h1 > h2 > h3)
- [ ] ARIA labels donde sea necesario
- [ ] Sin contenido que parpadee > 3 veces/segundo

### 7.3 Focus Visible

```css
/* Focus visible para accesibilidad */
:focus {
    outline: 2px solid var(--color-primary-light);
    outline-offset: 2px;
}

/* Ocultar outline solo con mouse, mantener con teclado */
:focus:not(:focus-visible) {
    outline: none;
}

:focus-visible {
    outline: 2px solid var(--color-primary-light);
    outline-offset: 2px;
}
```

### 7.4 Skip Links

```html
<!-- Primer elemento del body -->
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>

<style>
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: 8px;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
</style>
```

---

## 8. Iconografía

### 8.1 Librería Recomendada

**Bootstrap Icons** (gratuita, MIT license)

```html
<!-- CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<!-- Uso -->
<i class="bi bi-check-circle"></i>
<i class="bi bi-exclamation-triangle"></i>
```

### 8.2 Iconos Comunes

| Acción | Icono | Clase |
|--------|-------|-------|
| Guardar | 💾 | `bi-save` |
| Editar | ✏️ | `bi-pencil` |
| Eliminar | 🗑️ | `bi-trash` |
| Buscar | 🔍 | `bi-search` |
| Añadir | ➕ | `bi-plus-circle` |
| Configuración | ⚙️ | `bi-gear` |
| Usuario | 👤 | `bi-person` |
| Cerrar sesión | 🚪 | `bi-box-arrow-right` |

### 8.3 Tamaños

```css
.icon-sm { font-size: 1rem; }
.icon-md { font-size: 1.5rem; }
.icon-lg { font-size: 2rem; }
```

---

## 9. Plantillas de Página

### 9.1 Página de Login

- Logo centrado
- Formulario compacto (max-width: 400px)
- Fondo con gradiente corporativo
- Enlace "Olvidé mi contraseña"
- Mensaje de error visible

### 9.2 Dashboard

- Header con logo y navegación
- Sidebar colapsable (opcional)
- Cards de métricas principales
- Tablas de datos recientes
- Accesos rápidos

### 9.3 Listado (CRUD)

- Breadcrumb de navegación
- Título y botón "Nuevo"
- Filtros/búsqueda
- Tabla con paginación
- Acciones por fila (ver, editar, eliminar)

### 9.4 Formulario

- Título descriptivo
- Campos agrupados lógicamente
- Validación en tiempo real
- Botones "Guardar" y "Cancelar"
- Mensajes de confirmación

---

## 10. Animaciones y Transiciones

### 10.1 Principios

- **Sutiles:** No distraer del contenido
- **Rápidas:** 200-300ms máximo
- **Con propósito:** Indicar cambios de estado

### 10.2 Transiciones Base

```css
/* Transición estándar */
.transition {
    transition: all 0.2s ease;
}

/* Fade in */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.fade-in {
    animation: fadeIn 0.3s ease;
}

/* Slide down */
@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.slide-down {
    animation: slideDown 0.3s ease;
}
```

### 10.3 Reducir Movimiento

```css
/* Respetar preferencias del usuario */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

**Versión:** 1.0
**Fecha:** Diciembre 2025
**Responsable:** Comité Técnico OTD
**Última revisión:** [Fecha]
**Próxima revisión:** [Fecha + 6 meses]
