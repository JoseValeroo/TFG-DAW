# Design and Usability Guide

Visual and user experience standards for OTD applications - Universidad Pontificia Comillas.

---

## 1. Visual Identity

### 1.1 Logos

| Logo | Use | Location |
|------|-----|-----------|
| **Comillas (primary)** | Application header | `assets/logo_comillas.svg` |
| **OTD** | Footer or secondary | `assets/logo_otd.svg` |

**Usage rules:**
- Comillas logo always visible in header
- Minimum space around logo: logo height
- Do not deform, rotate, or change colors
- Light background preferred, if dark use white version

### 1.2 Color Palette

#### Primary Colors (Corporate)

| Name | HEX | RGB | Use |
|--------|-----|-----|-----|
| **Comillas Blue** | `#003366` | rgb(0, 51, 102) | Headers, primary buttons |
| **Light Blue** | `#0066CC` | rgb(0, 102, 204) | Links, accents |
| **White** | `#FFFFFF` | rgb(255, 255, 255) | Backgrounds, text on dark |

#### Secondary Colors

| Name | HEX | RGB | Use |
|--------|-----|-----|-----|
| **Dark Gray** | `#333333` | rgb(51, 51, 51) | Main text |
| **Medium Gray** | `#666666` | rgb(102, 102, 102) | Secondary text |
| **Light Gray** | `#F5F5F5` | rgb(245, 245, 245) | Alternate backgrounds |
| **Border** | `#DDDDDD` | rgb(221, 221, 221) | Lines, separators |

#### State Colors

| State | HEX | Use |
|--------|-----|-----|
| **Success** | `#28A745` | Confirmations, completed |
| **Warning** | `#FFC107` | Alerts, pending |
| **Error** | `#DC3545` | Errors, deletion |
| **Information** | `#17A2B8` | Information, help |

#### CSS Variables

```css
:root {
    /* Primary */
    --color-primary: #003366;
    --color-primary-light: #0066CC;
    --color-white: #FFFFFF;

    /* Secondary */
    --color-text: #333333;
    --color-text-secondary: #666666;
    --color-background: #F5F5F5;
    --color-border: #DDDDDD;

    /* States */
    --color-success: #28A745;
    --color-warning: #FFC107;
    --color-error: #DC3545;
    --color-info: #17A2B8;
}
```

---

## 2. Typography

### 2.1 Fonts

| Type | Font | Fallback | Use |
|------|--------|----------|-----|
| **Primary** | Segoe UI | Tahoma, sans-serif | All text |
| **Code** | Consolas | Monaco, monospace | Code, technical data |

### 2.2 Typographic Scale

| Element | Size | Weight | Line-height |
|----------|--------|------|-------------|
| H1 | 2rem (32px) | 600 | 1.2 |
| H2 | 1.5rem (24px) | 600 | 1.3 |
| H3 | 1.25rem (20px) | 600 | 1.4 |
| H4 | 1rem (16px) | 600 | 1.4 |
| Body | 1rem (16px) | 400 | 1.6 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Extra small | 0.75rem (12px) | 400 | 1.4 |

### 2.3 Base CSS

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

## 3. UI Components

### 3.1 Buttons

#### Styles

| Type | Use | Style |
|------|-----|--------|
| **Primary** | Main action | Blue background, white text |
| **Secondary** | Alternative actions | Blue border, white background |
| **Danger** | Delete, cancel | Red background |
| **Disabled** | Not available | Gray, cursor not-allowed |

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

### 3.2 Forms

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

### 3.3 Tables

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

### 3.4 Alerts

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

### 4.1 Main Container

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

### 4.2 Grid System

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

### 4.3 Spacing

| Class | Value | Use |
|-------|-------|-----|
| `.m-1` | 0.25rem (4px) | Minimum margin |
| `.m-2` | 0.5rem (8px) | Small margin |
| `.m-3` | 1rem (16px) | Normal margin |
| `.m-4` | 1.5rem (24px) | Medium margin |
| `.m-5` | 3rem (48px) | Large margin |

*Also applies to padding (`.p-X`) and directions (`.mt-`, `.mb-`, `.ml-`, `.mr-`)*

---

## 5. Navigation

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

| Name | Width | Device |
|--------|-------|-------------|
| **xs** | < 576px | Mobile portrait |
| **sm** | >= 576px | Mobile landscape |
| **md** | >= 768px | Tablet |
| **lg** | >= 992px | Desktop |
| **xl** | >= 1200px | Large desktop |

### 6.2 Media Queries

```css
/* Mobile first */

/* Tablet and up */
@media (min-width: 768px) {
    .container { max-width: 720px; }
}

/* Desktop */
@media (min-width: 992px) {
    .container { max-width: 960px; }
}

/* Large desktop */
@media (min-width: 1200px) {
    .container { max-width: 1140px; }
}
```

### 6.3 Responsive Rules

- **Mobile:** Collapsed navigation (hamburger), 100% width forms
- **Tablet:** Maximum 2-column grid
- **Desktop:** Full layout, visible sidebars

---

## 7. Accessibility (WCAG 2.1 AA)

### 7.1 Color Contrast

| Combination | Minimum Ratio | Status |
|-------------|--------------|--------|
| Normal text on background | 4.5:1 | Mandatory |
| Large text (18px+) on background | 3:1 | Mandatory |
| UI elements | 3:1 | Mandatory |

**Verification tool:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### 7.2 Accessibility Checklist

- [ ] All images have descriptive `alt`
- [ ] Forms have associated `label`
- [ ] Keyboard navigation functional (Tab, Enter, Escape)
- [ ] Visible focus on interactive elements
- [ ] Descriptive link texts (not "click here")
- [ ] Hierarchical heading structure (h1 > h2 > h3)
- [ ] ARIA labels where necessary
- [ ] No content flickering > 3 times/second

### 7.3 Visible Focus

```css
/* Visible focus for accessibility */
:focus {
    outline: 2px solid var(--color-primary-light);
    outline-offset: 2px;
}

/* Hide outline only with mouse, keep with keyboard */
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
<!-- First element of body -->
<a href="#main-content" class="skip-link">Skip to main content</a>

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

## 8. Iconography

### 8.1 Recommended Library

**Bootstrap Icons** (free, MIT license)

```html
<!-- CDN -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<!-- Usage -->
<i class="bi bi-check-circle"></i>
<i class="bi bi-exclamation-triangle"></i>
```

### 8.2 Common Icons

| Action | Icon | Class |
|--------|-------|-------|
| Save | 💾 | `bi-save` |
| Edit | ✏️ | `bi-pencil` |
| Delete | 🗑️ | `bi-trash` |
| Search | 🔍 | `bi-search` |
| Add | ➕ | `bi-plus-circle` |
| Settings | ⚙️ | `bi-gear` |
| User | 👤 | `bi-person` |
| Logout | 🚪 | `bi-box-arrow-right` |

### 8.3 Sizes

```css
.icon-sm { font-size: 1rem; }
.icon-md { font-size: 1.5rem; }
.icon-lg { font-size: 2rem; }
```

---

## 9. Page Templates

### 9.1 Login Page

- Centered logo
- Compact form (max-width: 400px)
- Corporate gradient background
- "Forgot password" link
- Visible error message

### 9.2 Dashboard

- Header with logo and navigation
- Collapsible sidebar (optional)
- Main metrics cards
- Recent data tables
- Quick actions

### 9.3 List (CRUD)

- Navigation breadcrumb
- Title and "New" button
- Filters/search
- Table with pagination
- Row actions (view, edit, delete)

### 9.4 Form

- Descriptive title
- Logically grouped fields
- Real-time validation
- "Save" and "Cancel" buttons
- Confirmation messages

---

## 10. Animations and Transitions

### 10.1 Principles

- **Subtle:** Don't distract from content
- **Fast:** 200-300ms maximum
- **Purposeful:** Indicate state changes

### 10.2 Base Transitions

```css
/* Standard transition */
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

### 10.3 Reduce Motion

```css
/* Respect user preferences */
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

**Version:** 1.0
**Date:** December 2025
**Owner:** OTD Technical Committee
**Last review:** [Date]
**Next review:** [Date + 6 months]
