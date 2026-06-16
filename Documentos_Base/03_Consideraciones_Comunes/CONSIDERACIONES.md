# Consideraciones Comunes

Normativas, requisitos legales y advertencias transversales para proyectos de la OTD - Universidad Pontificia Comillas.

---

## 1. Protección de Datos (RGPD/LOPDGDD)

### 1.1 Marco Legal

| Normativa | Ámbito | Obligatoriedad |
|-----------|--------|----------------|
| **RGPD** (Reglamento UE 2016/679) | Datos personales ciudadanos UE | Obligatorio |
| **LOPDGDD** (LO 3/2018) | Adaptación española | Obligatorio |
| **Política Comillas** | Normativa interna | Obligatorio |

### 1.2 Checklist de Cumplimiento

#### Antes de Empezar el Proyecto

- [ ] Identificar qué datos personales se tratarán
- [ ] Determinar la base legal del tratamiento (consentimiento, contrato, interés legítimo...)
- [ ] Verificar si se necesita Evaluación de Impacto (EIPD)
- [ ] Consultar con el DPO de Comillas si hay dudas

#### Durante el Desarrollo

- [ ] Implementar consentimiento explícito donde sea necesario
- [ ] Diseñar formularios con casillas de aceptación (no premarcadas)
- [ ] Incluir enlaces a política de privacidad
- [ ] Implementar derecho de acceso, rectificación y supresión
- [ ] Cifrar datos sensibles en base de datos
- [ ] Logs de acceso a datos personales

#### Datos Sensibles (Categorías Especiales)

**Requieren protección adicional:**
- Datos de salud
- Origen étnico
- Opiniones políticas
- Creencias religiosas
- Datos biométricos
- Orientación sexual

**Medidas obligatorias:**
- Cifrado AES-256 en reposo
- Acceso restringido por roles
- Logs de auditoría completos
- Consentimiento explícito documentado

### 1.3 Retención de Datos

| Tipo de dato | Periodo máximo | Acción al vencer |
|--------------|----------------|------------------|
| Datos de sesión | Duración sesión | Eliminar automáticamente |
| Logs de acceso | 2 años | Anonimizar o eliminar |
| Datos académicos | Según normativa | Archivar o eliminar |
| Datos de contacto | Mientras dure relación | Solicitar renovación o eliminar |

### 1.4 Transferencias Internacionales

- **Dentro de UE/EEE:** Permitido sin restricciones
- **Fuera de UE:** Requiere garantías adicionales (cláusulas tipo, decisión de adecuación)
- **Servidores Azure:** Verificar ubicación del datacenter (preferir Europa)

---

## 2. Accesibilidad (WCAG 2.1)

### 2.1 Obligatoriedad

| Tipo de proyecto | Nivel requerido | Normativa |
|------------------|-----------------|-----------|
| Webs públicas de Comillas | AA | RD 1112/2018 |
| Aplicaciones internas | AA (recomendado) | Buenas prácticas |
| Apps móviles | AA | Directiva UE 2016/2102 |

### 2.2 Checklist por Principio WCAG

#### Perceptible
- [ ] Textos alternativos en imágenes (`alt`)
- [ ] Subtítulos en vídeos
- [ ] Contraste mínimo 4.5:1 (texto normal)
- [ ] Contenido adaptable a diferentes tamaños
- [ ] No depender solo del color para transmitir información

#### Operable
- [ ] Navegación completa por teclado
- [ ] Tiempo suficiente para leer/interactuar
- [ ] Sin contenido que cause convulsiones (parpadeos)
- [ ] Ayudas de navegación (breadcrumbs, skip links)
- [ ] Focus visible en elementos interactivos

#### Comprensible
- [ ] Idioma de la página declarado (`lang="es"`)
- [ ] Navegación consistente
- [ ] Etiquetas en formularios
- [ ] Mensajes de error claros y sugerencias
- [ ] Ayuda contextual disponible

#### Robusto
- [ ] HTML válido y semántico
- [ ] ARIA usado correctamente
- [ ] Compatible con tecnologías asistivas
- [ ] Funciona en diferentes navegadores

### 2.3 Herramientas de Validación

| Herramienta | Uso | URL |
|-------------|-----|-----|
| WAVE | Análisis automático | webaim.org/wave |
| axe DevTools | Extensión navegador | deque.com/axe |
| Lighthouse | Auditoría Chrome | Integrado en DevTools |
| NVDA | Lector de pantalla (test) | nvaccess.org |

### 2.4 Declaración de Accesibilidad

**Obligatorio en webs públicas:** Incluir página de "Accesibilidad" con:
- Estado de conformidad
- Contenido no accesible (si lo hay)
- Mecanismo de contacto para problemas
- Fecha de última revisión

---

## 3. Normativa Interna de Comillas

### 3.1 Identidad Corporativa

- [ ] Usar logos oficiales (solicitar a Comunicación)
- [ ] Respetar paleta de colores corporativa
- [ ] Tipografías autorizadas
- [ ] Footer con información legal requerida

### 3.2 Dominios y URLs

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Producción | *.comillas.edu | app.comillas.edu |
| Desarrollo | *.dev.comillas.edu | app.dev.comillas.edu |
| APIs | api.*.comillas.edu | api.app.comillas.edu |

**Proceso para nuevo dominio:**
1. Solicitar a IT
2. Aprobar con Comunicación
3. Configurar certificado SSL
4. Añadir a DNS corporativo

### 3.3 Autenticación Corporativa

**Método obligatorio:** Azure AD de Comillas

```csharp
// Integración con Azure AD corporativo
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));
```

**Configuración requerida:**
- TenantId de Comillas
- ClientId de la aplicación (solicitar a IT)
- Redirect URIs aprobadas

### 3.4 Correo Electrónico

**Para envío desde aplicaciones:**
- Usar servidor SMTP corporativo (solicitar credenciales)
- Dominio remitente: @comillas.edu
- Incluir firma corporativa en emails formales
- No enviar más de X emails/hora (consultar límites)

---

## 4. Integraciones con Sistemas Existentes

### 4.1 Sistemas Core de Comillas

| Sistema | Tipo | Contacto |
|---------|------|----------|
| **Oracle/PeopleSoft** | ERP académico | IT - Sistemas |
| **Moodle** | LMS | IT - Educación |
| **SharePoint** | Documentos | IT - Colaboración |
| **Power BI** | Reporting | IT - BI |

### 4.2 Proceso de Integración

```
1. Identificar necesidad de integración
       ↓
2. Contactar con responsable del sistema
       ↓
3. Solicitar documentación de API/interfaz
       ↓
4. Definir alcance y datos a intercambiar
       ↓
5. Desarrollar en entorno de pruebas
       ↓
6. Pruebas de integración conjuntas
       ↓
7. Aprobación y paso a producción
```

### 4.3 Consideraciones Técnicas

#### Oracle/Bases de datos legacy

- Pueden requerir ADO.NET en lugar de Dapper
- Verificar versión de Oracle Client
- Cadenas de conexión específicas (TNS)
- Posibles stored procedures existentes

#### APIs REST existentes

- Solicitar documentación Swagger/OpenAPI
- Verificar autenticación requerida
- Rate limits y cuotas
- SLAs de disponibilidad

### 4.4 Datos Maestros

**Fuente de verdad para:**

| Dato | Sistema origen | Cómo obtener |
|------|----------------|--------------|
| Usuarios/empleados | Azure AD | Microsoft Graph API |
| Estudiantes | Oracle/PeopleSoft | API específica |
| Asignaturas | Oracle/PeopleSoft | API específica |
| Estructura organizativa | RRHH | Consultar con RRHH |

**Regla:** No duplicar datos maestros. Siempre consumir del sistema origen.

---

## 5. Auditoría y Trazabilidad

### 5.1 Requisitos de Logging

#### Obligatorio Registrar

| Evento | Datos a guardar | Retención |
|--------|-----------------|-----------|
| Login/Logout | Usuario, IP, timestamp, resultado | 2 años |
| Acceso a datos sensibles | Usuario, dato accedido, timestamp | 2 años |
| Modificaciones | Usuario, antes/después, timestamp | 2 años |
| Eliminaciones | Usuario, dato eliminado, timestamp | 5 años |
| Errores de seguridad | Detalle completo | 2 años |

#### Prohibido Registrar

- Contraseñas (ni cifradas)
- Tokens de sesión completos
- Datos de tarjetas de crédito
- Datos médicos en texto claro

### 5.2 Implementación

```csharp
// Servicio de auditoría
public class AuditService : IAuditService
{
    public async Task LogAccessAsync(string userId, string resource, string action)
    {
        var audit = new AuditLog
        {
            UserId = userId,
            Resource = resource,
            Action = action,
            Timestamp = DateTime.UtcNow,
            IpAddress = GetClientIp(),
            UserAgent = GetUserAgent()
        };

        await _auditRepository.SaveAsync(audit);
    }
}

// Uso con atributo
[AuditAccess("Expediente académico")]
public async Task<ExpedienteDto> GetExpediente(string estudianteId)
{
    // ...
}
```

### 5.3 Consulta de Auditoría

**Quién puede consultar:**
- Administradores de la aplicación
- DPO (para investigaciones)
- Auditoría interna (con autorización)

**Interfaz requerida:**
- Búsqueda por usuario
- Búsqueda por fecha
- Búsqueda por recurso/acción
- Exportación a Excel/PDF

---

## 6. Certificaciones y Requisitos Especiales

### 6.1 Ubicación del Usuario

**Cuándo aplica:** Aplicaciones que requieren verificar la ubicación física del usuario (ej: exámenes online, fichaje).

**Consideraciones:**
- Solicitar permiso de geolocalización
- Informar al usuario del propósito
- Almacenar con precisión limitada (no exacta)
- Alternativas si el usuario rechaza

### 6.2 Firma Electrónica

**Cuándo aplica:** Documentos que requieren firma con validez legal.

**Opciones:**
- Firma simple (email + checkbox) - validez limitada
- Firma avanzada (certificado digital) - validez legal
- Firma cualificada (prestador cualificado) - máxima validez

**Proveedor recomendado:** Consultar con Secretaría General

### 6.3 Facturación Electrónica

**Cuándo aplica:** Proyectos que generen o reciban facturas.

**Requisitos:**
- Formato Facturae 3.2.x
- Firma electrónica de la factura
- Conservación 4 años mínimo
- Integración con FACe si es sector público

---

## 7. Entornos y Despliegues

### 7.1 Entornos Obligatorios

| Entorno | Propósito | Datos |
|---------|-----------|-------|
| **Desarrollo** | Desarrollo activo | Datos ficticios |
| **Staging/Pre** | Pruebas de aceptación | Datos anonimizados |
| **Producción** | Usuarios reales | Datos reales |

### 7.2 Promoción entre Entornos

```
Desarrollo → Staging → Producción
    ↓           ↓           ↓
  Tests      UAT/QA     Monitorización
 automáticos  manual       continua
```

**Aprobaciones requeridas:**
- Dev → Staging: Líder técnico
- Staging → Producción: JP + Líder técnico

### 7.3 Ventanas de Despliegue

| Tipo | Horario permitido | Aprobación |
|------|-------------------|------------|
| Menor (bugfix) | Horario laboral | Líder técnico |
| Mayor (features) | Viernes tarde o finde | JP |
| Crítico (seguridad) | Inmediato | JP + IT |

---

## 8. Soporte y Mantenimiento

### 8.1 Niveles de Soporte

| Nivel | Responsable | Tiempo respuesta |
|-------|-------------|------------------|
| **L1** | Help desk IT | 4h laborables |
| **L2** | Equipo desarrollo | 8h laborables |
| **L3** | Líder técnico/Vendor | Según SLA |

### 8.2 Clasificación de Incidencias

| Severidad | Descripción | Tiempo resolución |
|-----------|-------------|-------------------|
| **Crítica** | Sistema caído, pérdida de datos | 4h |
| **Alta** | Funcionalidad principal afectada | 8h |
| **Media** | Funcionalidad secundaria afectada | 24h |
| **Baja** | Mejoras, cosméticos | Próximo sprint |

### 8.3 Documentación de Soporte

**Obligatorio entregar:**
- Manual de usuario
- Manual de administración
- Runbook de operaciones
- Procedimiento de backup/restore
- Contactos de escalado

---

## 9. Checklist Final de Proyecto

### 9.1 Antes de Ir a Producción

#### Legal y Compliance
- [ ] RGPD: Consentimientos implementados
- [ ] RGPD: Política de privacidad publicada
- [ ] Accesibilidad: Nivel AA verificado
- [ ] Identidad corporativa: Logos y colores correctos

#### Técnico
- [ ] Azure Key Vault configurado
- [ ] Blob Storage para archivos
- [ ] Redis para caché
- [ ] Application Insights activo
- [ ] Logs de auditoría funcionando
- [ ] HTTPS con certificado válido
- [ ] Headers de seguridad configurados

#### Integraciones
- [ ] Azure AD corporativo funcionando
- [ ] APIs de sistemas conectadas
- [ ] Pruebas de integración pasadas

#### Operaciones
- [ ] Backups configurados
- [ ] Monitorización activa
- [ ] Alertas configuradas
- [ ] Runbook documentado
- [ ] Equipo de soporte informado

### 9.2 Revisiones Periódicas

| Revisión | Frecuencia | Responsable |
|----------|------------|-------------|
| Seguridad (dependencias) | Mensual | Líder técnico |
| Accesibilidad | Trimestral | QA |
| RGPD compliance | Semestral | DPO |
| Auditoría de logs | Anual | Auditoría interna |

---

## 10. Contactos de Referencia

### 10.1 Internos Comillas

| Área | Contacto | Para qué |
|------|----------|----------|
| **IT - Sistemas** | [email] | Infraestructura, servidores |
| **IT - Desarrollo** | [email] | APIs, integraciones |
| **DPO** | [email] | Protección de datos |
| **Comunicación** | [email] | Identidad corporativa |
| **Secretaría General** | [email] | Normativa, legal |

### 10.2 Externos

| Servicio | Proveedor | Contacto |
|----------|-----------|----------|
| Azure | Microsoft | Portal Azure |
| Certificados SSL | [Proveedor] | [Contacto] |
| Firma electrónica | [Proveedor] | [Contacto] |

---

**Versión:** 1.0
**Fecha:** Diciembre 2025
**Responsable:** Comité Técnico OTD
**Última revisión:** [Fecha]
**Próxima revisión:** [Fecha + 6 meses]

---

## Historial de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | Dic 2025 | Versión inicial | Comité Técnico |
