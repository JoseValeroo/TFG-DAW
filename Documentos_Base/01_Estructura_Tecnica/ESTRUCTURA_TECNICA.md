# Documento de Estructura Técnica

Guía técnica para proyectos de la Oficina de Transformación Digital (OTD) de la Universidad Pontificia Comillas.

---

## 1. Stack Tecnológico

### 1.1 Tecnologías Recomendadas (Microsoft)

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| Backend | .NET / C# | 8+ LTS | Estándar corporativo, soporte largo plazo |
| Acceso a datos | Dapper | Última estable | Rendimiento, control sobre SQL |
| Base de datos | SQL Server | 2017 (14.0) | Infraestructura existente |
| Intercalación BD | SQL_Latin1_General_CP1250_CI_AS | - | Compatibilidad con producción |
| Cloud | Azure | - | Contrato corporativo |
| Contenedores | Docker | - | Estandarización de entornos |
| Caché | Redis | 7+ | Caché distribuida para balanceo |
| Almacenamiento | Azure Blob Storage | - | Archivos en infraestructura balanceada |

### 1.2 Tecnologías Permitidas (con justificación)

| Categoría | Alternativas | Cuándo usar |
|-----------|--------------|-------------|
| Acceso a datos | ADO.NET, EF Core | Proyectos legacy, requisitos específicos |
| Base de datos | Oracle | Integración con sistemas existentes |
| Frontend | React, Angular | Requisitos de cliente, equipo especializado |
| Cloud | AWS | Requisito explícito del cliente |

**Proceso para usar tecnología alternativa:**
1. Desarrollador propone alternativa con justificación técnica
2. JP y Líder Técnico evalúan impacto y viabilidad
3. Se documenta la decisión en el proyecto
4. Se actualiza este documento si aplica a más proyectos

---

## 2. Arquitectura de Referencia

### 2.1 Patrón: Clean Architecture

```
Solución/
├── Proyecto.API/              # Capa de presentación
│   ├── Controllers/
│   ├── Middleware/
│   └── Program.cs
│
├── Proyecto.Application/      # Casos de uso
│   ├── Services/
│   ├── DTOs/
│   └── Interfaces/
│
├── Proyecto.Domain/           # Entidades y lógica de negocio
│   ├── Entities/
│   ├── ValueObjects/
│   └── Exceptions/
│
├── Proyecto.Infrastructure/   # Implementaciones externas
│   ├── Repositories/
│   ├── ExternalServices/
│   ├── BlobStorage/          # Servicios de Azure Blob
│   └── Persistence/
│
└── Proyecto.Tests/            # Pruebas
    ├── Unit/
    └── Integration/
```

### 2.2 Principios Obligatorios

- [ ] Separación de responsabilidades por capas
- [ ] Inyección de dependencias
- [ ] Interfaces para servicios externos
- [ ] Sin lógica de negocio en controladores
- [ ] Configuración externalizada (no hardcoded)
- [ ] Sin estado local (preparado para balanceo)

---

## 3. Seguridad (CRÍTICO)

### 3.1 OWASP Top 10 - Checklist Obligatorio

| Vulnerabilidad | Mitigación | Implementación |
|----------------|------------|----------------|
| **Injection (SQL, NoSQL)** | Queries parametrizadas | Dapper con parámetros, nunca concatenar strings |
| **Broken Authentication** | Azure AD / JWT | Tokens con expiración, refresh tokens |
| **Sensitive Data Exposure** | Cifrado, HTTPS | TLS 1.2+, datos sensibles cifrados en BD |
| **XML External Entities** | Deshabilitar DTD | `XmlReaderSettings.DtdProcessing = Prohibit` |
| **Broken Access Control** | Autorización por roles | `[Authorize(Roles = "...")]`, claims |
| **Security Misconfiguration** | Headers seguros | HSTS, X-Content-Type-Options, CSP |
| **Cross-Site Scripting (XSS)** | Encoding de output | Razor encoding automático, validar inputs |
| **Insecure Deserialization** | Validar tipos | No deserializar datos no confiables |
| **Vulnerable Components** | Actualizar dependencias | Dependabot, auditorías NuGet |
| **Insufficient Logging** | Logging completo | Application Insights, no loguear datos sensibles |

### 3.2 Azure Key Vault (OBLIGATORIO)

**NUNCA almacenar secretos en código ni en appsettings.json**

```csharp
// Program.cs - Configuración obligatoria
var keyVaultName = builder.Configuration["KeyVaultName"];
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());
```

**Secretos que DEBEN estar en Key Vault:**
- Cadenas de conexión a bases de datos
- API Keys de servicios externos
- Certificados SSL/TLS
- Credenciales de integración
- Claves de cifrado

**Para desarrollo local:**
```bash
# Usar User Secrets de .NET
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost..."
```

### 3.3 Autenticación y Autorización

**Método recomendado: Azure AD + JWT**

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));
});
```

**Principios:**
- Tokens JWT verificables por cualquier instancia (sin estado local)
- Claims para permisos granulares
- Refresh tokens con rotación
- Expiración de sesión configurable

### 3.4 Validación de Inputs

```csharp
// Usar FluentValidation o DataAnnotations
public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100)
            .Matches(@"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$");
    }
}
```

---

## 4. Infraestructura Balanceada (CRÍTICO)

### 4.1 Principio Fundamental

**TODAS las aplicaciones se despliegan en múltiples servidores balanceados. El código DEBE diseñarse sin estado local.**

### 4.2 Azure Blob Storage (OBLIGATORIO)

**Todo archivo generado o subido debe almacenarse en Blob Storage, tanto en Frontend como en Backend.**

```csharp
// Servicio de almacenamiento
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;

    public BlobStorageService(IConfiguration configuration)
    {
        // Connection string desde Key Vault
        var connectionString = configuration["AzureStorage:ConnectionString"];
        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadFileAsync(Stream content, string fileName, string container)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(container);
        await containerClient.CreateIfNotExistsAsync();

        var blobClient = containerClient.GetBlobClient(fileName);
        await blobClient.UploadAsync(content, overwrite: true);

        return blobClient.Uri.ToString();
    }

    public async Task<Stream> DownloadFileAsync(string fileName, string container)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(container);
        var blobClient = containerClient.GetBlobClient(fileName);

        var response = await blobClient.DownloadAsync();
        return response.Value.Content;
    }
}
```

**Casos de uso obligatorios para Blob Storage:**
- Archivos subidos por usuarios (documentos, imágenes)
- Reportes generados (PDF, Excel)
- Logs de aplicación (si no se usa Application Insights)
- Archivos temporales de procesamiento
- Exports de datos
- Backups de configuración

### 4.3 Redis - Caché Distribuida (OBLIGATORIO)

```csharp
// Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "MiProyecto_";
});

// Uso en servicios
public class MiServicio
{
    private readonly IDistributedCache _cache;

    public async Task<DatosDto> ObtenerDatosAsync(string id)
    {
        var cacheKey = $"datos_{id}";
        var cached = await _cache.GetStringAsync(cacheKey);

        if (cached != null)
            return JsonSerializer.Deserialize<DatosDto>(cached);

        var datos = await _repository.ObtenerAsync(id);

        await _cache.SetStringAsync(cacheKey,
            JsonSerializer.Serialize(datos),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
            });

        return datos;
    }
}
```

### 4.4 Tabla Resumen: NO hacer vs SÍ hacer

| Escenario | ❌ NO hacer | ✅ SÍ hacer |
|-----------|-------------|-------------|
| Sesiones de usuario | `MemoryCache`, `Session` en memoria | Redis, SQL Server distribuido |
| Archivos subidos | `wwwroot/uploads/`, disco local | Azure Blob Storage |
| Archivos generados | `Path.GetTempPath()`, disco local | Azure Blob Storage |
| Tareas programadas | `Timer`, `Task.Run()` con delay | Azure Functions, Hangfire con SQL/Redis |
| Caché de datos | `MemoryCache` | `IDistributedCache` con Redis |
| Logs | Archivos locales | Application Insights |
| Estado de aplicación | Variables estáticas | Redis, base de datos |

---

## 5. Proyectos Legacy (WebForms)

### 5.1 Contexto

Por esta plantilla pueden pasar proyectos antiguos desarrollados en **ASP.NET WebForms**. No existe obligación de migración, pero sí es **obligatorio** realizar un estudio de viabilidad.

### 5.2 Estudio de Migración (OBLIGATORIO)

**Todo proyecto WebForms debe pasar por este análisis antes de cualquier desarrollo:**

#### Paso 1: Inventario Técnico

| Aspecto | Qué analizar | Herramientas |
|---------|--------------|--------------|
| Tamaño | Nº de páginas .aspx, .ascx | Script de conteo |
| Complejidad | Code-behind, controles personalizados | Revisión manual |
| Base de datos | Stored procedures, ADO.NET | SQL Server |
| Dependencias | DLLs terceros, COM | NuGet, referencias |
| Integraciones | Web services, APIs externas | Documentación |

#### Paso 2: Evaluación de Riesgos de Seguridad

| Riesgo | Verificar | Criticidad |
|--------|-----------|------------|
| SQL Injection | Queries dinámicas sin parametrizar | ALTA |
| ViewState sin cifrar | Datos sensibles en ViewState | ALTA |
| Autenticación obsoleta | Forms Auth sin tokens | MEDIA |
| HTTPS | Certificados, redirección | ALTA |
| Headers de seguridad | HSTS, CSP, X-Frame-Options | MEDIA |

#### Paso 3: Estimación de Tiempos

**Matriz de estimación según complejidad:**

| Complejidad | Páginas | Estimación Base | Con mitigación seguridad |
|-------------|---------|-----------------|--------------------------|
| **Baja** | 1-10 | 2-4 semanas | +1 semana |
| **Media** | 11-30 | 1-2 meses | +2 semanas |
| **Alta** | 31-50 | 2-4 meses | +1 mes |
| **Muy Alta** | 50+ | 4-6 meses | +1-2 meses |

**Factores multiplicadores:**
- Controles de terceros sin soporte: x1.5
- Integración con sistemas legacy: x1.3
- Lógica de negocio compleja en code-behind: x1.4
- Sin documentación: x1.2
- Sin tests: x1.3

### 5.3 Opciones de Actuación

#### Opción A: Migración Completa a .NET 8

**Cuándo elegir:**
- Proyecto con desarrollo activo previsto
- Presupuesto y tiempo disponible
- Equipo con capacidad

**Beneficios:**
- Arquitectura moderna
- Mejor rendimiento
- Soporte a largo plazo
- Compatible con infraestructura balanceada

#### Opción B: Migración Incremental

**Cuándo elegir:**
- Proyecto grande (50+ páginas)
- Presupuesto limitado
- Necesidad de mantener operativo

**Estrategia:**
1. Crear API .NET 8 para nueva funcionalidad
2. WebForms consume la API
3. Migrar páginas gradualmente
4. Coexistencia temporal

#### Opción C: Hardening de Seguridad (Mínimo Obligatorio)

**Cuándo elegir:**
- Sin presupuesto para migración
- Proyecto en mantenimiento mínimo
- Fecha de fin de vida cercana

**Acciones obligatorias:**

```csharp
// web.config - Configuración mínima de seguridad

<!-- HTTPS obligatorio -->
<system.webServer>
  <rewrite>
    <rules>
      <rule name="HTTPS Redirect">
        <match url="(.*)" />
        <conditions>
          <add input="{HTTPS}" pattern="off" />
        </conditions>
        <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" />
      </rule>
    </rules>
  </rewrite>

  <!-- Headers de seguridad -->
  <httpProtocol>
    <customHeaders>
      <add name="X-Content-Type-Options" value="nosniff" />
      <add name="X-Frame-Options" value="SAMEORIGIN" />
      <add name="X-XSS-Protection" value="1; mode=block" />
      <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
    </customHeaders>
  </httpProtocol>
</system.webServer>

<!-- ViewState cifrado -->
<system.web>
  <machineKey validation="SHA1" decryption="AES"
              validationKey="[DESDE KEY VAULT]"
              decryptionKey="[DESDE KEY VAULT]" />
  <pages viewStateEncryptionMode="Always" />
</system.web>
```

**Checklist mínimo de seguridad para WebForms:**

- [ ] HTTPS obligatorio con redirección
- [ ] Headers de seguridad configurados
- [ ] ViewState cifrado
- [ ] Queries SQL parametrizadas (revisar TODO el código)
- [ ] Validación de inputs en servidor
- [ ] Autenticación revisada
- [ ] Logging de accesos habilitado
- [ ] Dependencias actualizadas (si es posible)

### 5.4 Documento de Decisión

**Para cada proyecto WebForms, el desarrollador debe entregar al JP:**

```markdown
# Análisis de Proyecto WebForms: [Nombre]

## 1. Inventario
- Páginas .aspx: XX
- User Controls: XX
- Stored Procedures: XX
- Integraciones: [lista]

## 2. Riesgos de Seguridad Identificados
| Riesgo | Severidad | Ubicación |
|--------|-----------|-----------|
| ... | Alta/Media/Baja | archivo:línea |

## 3. Recomendación
[ ] Migración completa - Estimación: X semanas/meses
[ ] Migración incremental - Estimación fase 1: X semanas
[ ] Hardening de seguridad - Estimación: X semanas

## 4. Justificación
[Explicación de la recomendación]

## 5. Riesgos de NO actuar
[Consecuencias de mantener el estado actual]
```

---

## 6. Entorno de Desarrollo

### 6.1 Docker Compose

**Servicios incluidos:**

| Servicio | Puerto | Imagen | Uso |
|----------|--------|--------|-----|
| SQL Server 2017 | 1433 | `mcr.microsoft.com/mssql/server:2017-latest` | Base de datos |
| Redis | 6379 | `redis:7-alpine` | Caché distribuida |
| Azurite | 10000-10002 | `mcr.microsoft.com/azure-storage/azurite` | Emulador Blob Storage |
| Mailhog | 1025/8025 | `mailhog/mailhog` | SMTP de pruebas |

**Configuración SQL Server compatible con producción:**
```yaml
sqlserver:
  image: mcr.microsoft.com/mssql/server:2017-latest
  environment:
    - ACCEPT_EULA=Y
    - MSSQL_SA_PASSWORD=${SA_PASSWORD}
    - MSSQL_COLLATION=SQL_Latin1_General_CP1250_CI_AS
```

### 6.2 Archivos de Configuración

| Archivo | Contenido | Commitear |
|---------|-----------|-----------|
| `appsettings.json` | Config base sin secretos | Sí |
| `appsettings.Development.json` | Config desarrollo | Sí |
| `.env` | Variables Docker | NO |
| `.env.example` | Plantilla variables | Sí |
| `docker-compose.yml` | Servicios | Sí |

---

## 7. Buenas Prácticas de Código

### 7.1 Obligatorias

- [ ] Nombres de código: inglés o castellano (consistente en todo el proyecto)
- [ ] Comentarios solo donde el código no sea autoexplicativo
- [ ] Manejo de excepciones centralizado
- [ ] Logging estructurado con Application Insights
- [ ] Sin warnings en compilación
- [ ] Async/await para operaciones I/O

### 7.2 Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Clases | PascalCase | `UserService` |
| Interfaces | IPascalCase | `IUserRepository` |
| Métodos | PascalCase | `GetUserById` |
| Variables locales | camelCase | `userName` |
| Constantes | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Parámetros | camelCase | `userId` |

### 7.3 Estructura de Excepciones

```csharp
// Excepciones de dominio
public class DomainException : Exception
{
    public string Code { get; }
    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }
}

// Middleware global de excepciones
public class ExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (DomainException ex)
        {
            _logger.LogWarning(ex, "Domain exception: {Code}", ex.Code);
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message, code = ex.Code });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(new { error = "Error interno del servidor" });
        }
    }
}
```

---

## 8. Control de Versiones

### 8.1 Estrategia de Ramas

```
main                    # Producción
├── develop             # Integración
├── feature/XXX-desc    # Nuevas funcionalidades
├── bugfix/XXX-desc     # Correcciones
├── hotfix/XXX-desc     # Urgentes a producción
└── release/X.X.X       # Preparación de release
```

### 8.2 Convención de Commits

```
tipo(alcance): descripción breve

Tipos: feat, fix, docs, style, refactor, test, chore, security
Ejemplo: feat(auth): añadir login con Azure AD
Ejemplo: security(sql): parametrizar queries en UserRepository
```

### 8.3 Pull Requests

- Mínimo 1 revisor
- Tests pasando
- Sin conflictos
- Descripción clara de cambios

---

## 9. Testing

### 9.1 Cobertura Mínima

| Tipo | Cobertura Objetivo | Obligatorio |
|------|-------------------|-------------|
| Unitarios | 70% lógica de negocio | Sí |
| Integración | Endpoints críticos | Sí |
| E2E | Flujos principales | Recomendado |

### 9.2 Estructura de Tests

```csharp
// Patrón Arrange-Act-Assert
[Fact]
public async Task GetUser_WithValidId_ReturnsUser()
{
    // Arrange
    var userId = Guid.NewGuid();
    var expectedUser = new User { Id = userId, Name = "Test" };
    _mockRepository.Setup(r => r.GetByIdAsync(userId))
        .ReturnsAsync(expectedUser);

    // Act
    var result = await _service.GetUserAsync(userId);

    // Assert
    Assert.NotNull(result);
    Assert.Equal(expectedUser.Name, result.Name);
}
```

---

## 10. Logging y Monitorización

### 10.1 Application Insights (Obligatorio)

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();

// En servicios
public class MiServicio
{
    private readonly TelemetryClient _telemetry;

    public async Task ProcesarAsync(DatosDto datos)
    {
        using var operation = _telemetry.StartOperation<RequestTelemetry>("Procesar");

        try
        {
            // Lógica
            _telemetry.TrackEvent("DatosProcesados", new Dictionary<string, string>
            {
                ["TipoOperacion"] = datos.Tipo
            });
        }
        catch (Exception ex)
        {
            _telemetry.TrackException(ex);
            throw;
        }
    }
}
```

### 10.2 Qué Loguear

| Nivel | Cuándo usar | Ejemplo |
|-------|-------------|---------|
| **Error** | Excepciones, fallos críticos | Error de conexión BD |
| **Warning** | Situaciones anómalas recuperables | Retry de operación |
| **Information** | Eventos de negocio importantes | Usuario creado |
| **Debug** | Información de diagnóstico | Parámetros de query |

### 10.3 Qué NO Loguear

- Contraseñas
- Tokens de autenticación
- Datos personales (DNI, email completo)
- Números de tarjeta
- Datos médicos

---

**Versión:** 1.0
**Fecha:** Diciembre 2025
**Responsable:** Comité Técnico OTD
**Última revisión:** [Fecha]
**Próxima revisión:** [Fecha + 3 meses]
