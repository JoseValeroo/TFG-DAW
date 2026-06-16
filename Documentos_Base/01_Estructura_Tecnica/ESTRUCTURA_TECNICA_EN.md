# Technical Structure Document

Technical guide for projects from the Digital Transformation Office (OTD) at Universidad Pontificia Comillas.

---

## 1. Technology Stack

### 1.1 Recommended Technologies (Microsoft)

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Backend | .NET / C# | 8+ LTS | Corporate standard, long-term support |
| Data access | Dapper | Latest stable | Performance, SQL control |
| Database | SQL Server | 2017 (14.0) | Existing infrastructure |
| DB Collation | SQL_Latin1_General_CP1250_CI_AS | - | Production compatibility |
| Cloud | Azure | - | Corporate contract |
| Containers | Docker | - | Environment standardization |
| Cache | Redis | 7+ | Distributed cache for load balancing |
| Storage | Azure Blob Storage | - | Files in load-balanced infrastructure |

### 1.2 Permitted Technologies (with justification)

| Category | Alternatives | When to use |
|----------|--------------|-------------|
| Data access | ADO.NET, EF Core | Legacy projects, specific requirements |
| Database | Oracle | Integration with existing systems |
| Frontend | React, Angular | Client requirements, specialized team |
| Cloud | AWS | Explicit client requirement |

**Process for using alternative technology:**
1. Developer proposes alternative with technical justification
2. PM and Technical Lead evaluate impact and feasibility
3. Decision is documented in the project
4. This document is updated if applicable to more projects

---

## 2. Reference Architecture

### 2.1 Pattern: Clean Architecture

```
Solution/
├── Project.API/              # Presentation layer
│   ├── Controllers/
│   ├── Middleware/
│   └── Program.cs
│
├── Project.Application/      # Use cases
│   ├── Services/
│   ├── DTOs/
│   └── Interfaces/
│
├── Project.Domain/           # Entities and business logic
│   ├── Entities/
│   ├── ValueObjects/
│   └── Exceptions/
│
├── Project.Infrastructure/   # External implementations
│   ├── Repositories/
│   ├── ExternalServices/
│   ├── BlobStorage/          # Azure Blob services
│   └── Persistence/
│
└── Project.Tests/            # Tests
    ├── Unit/
    └── Integration/
```

### 2.2 Mandatory Principles

- [ ] Separation of concerns by layers
- [ ] Dependency injection
- [ ] Interfaces for external services
- [ ] No business logic in controllers
- [ ] Externalized configuration (not hardcoded)
- [ ] No local state (prepared for load balancing)

---

## 3. Security (CRITICAL)

### 3.1 OWASP Top 10 - Mandatory Checklist

| Vulnerability | Mitigation | Implementation |
|---------------|------------|----------------|
| **Injection (SQL, NoSQL)** | Parameterized queries | Dapper with parameters, never concatenate strings |
| **Broken Authentication** | Azure AD / JWT | Tokens with expiration, refresh tokens |
| **Sensitive Data Exposure** | Encryption, HTTPS | TLS 1.2+, sensitive data encrypted in DB |
| **XML External Entities** | Disable DTD | `XmlReaderSettings.DtdProcessing = Prohibit` |
| **Broken Access Control** | Role-based authorization | `[Authorize(Roles = "...")]`, claims |
| **Security Misconfiguration** | Secure headers | HSTS, X-Content-Type-Options, CSP |
| **Cross-Site Scripting (XSS)** | Output encoding | Razor automatic encoding, validate inputs |
| **Insecure Deserialization** | Validate types | Don't deserialize untrusted data |
| **Vulnerable Components** | Update dependencies | Dependabot, NuGet audits |
| **Insufficient Logging** | Complete logging | Application Insights, don't log sensitive data |

### 3.2 Azure Key Vault (MANDATORY)

**NEVER store secrets in code or appsettings.json**

```csharp
// Program.cs - Mandatory configuration
var keyVaultName = builder.Configuration["KeyVaultName"];
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());
```

**Secrets that MUST be in Key Vault:**
- Database connection strings
- External service API Keys
- SSL/TLS certificates
- Integration credentials
- Encryption keys

**For local development:**
```bash
# Use .NET User Secrets
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost..."
```

### 3.3 Authentication and Authorization

**Recommended method: Azure AD + JWT**

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

**Principles:**
- JWT tokens verifiable by any instance (no local state)
- Claims for granular permissions
- Refresh tokens with rotation
- Configurable session expiration

### 3.4 Input Validation

```csharp
// Use FluentValidation or DataAnnotations
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

## 4. Load-Balanced Infrastructure (CRITICAL)

### 4.1 Fundamental Principle

**ALL applications are deployed on multiple load-balanced servers. Code MUST be designed without local state.**

### 4.2 Azure Blob Storage (MANDATORY)

**All generated or uploaded files must be stored in Blob Storage, both in Frontend and Backend.**

```csharp
// Storage service
public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;

    public BlobStorageService(IConfiguration configuration)
    {
        // Connection string from Key Vault
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

        var download = await blobClient.DownloadAsync();
        return download.Value.Content;
    }
}
```

**Registration in Program.cs:**
```csharp
builder.Services.AddSingleton<IBlobStorageService, BlobStorageService>();
```

**Usage example:**
```csharp
public class DocumentController : ControllerBase
{
    private readonly IBlobStorageService _blobStorage;

    public async Task<IActionResult> UploadDocument(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var url = await _blobStorage.UploadFileAsync(stream, file.FileName, "documents");
        return Ok(new { Url = url });
    }
}
```

### 4.3 Redis Distributed Cache (MANDATORY)

**Session and cache MUST be distributed to support load balancing.**

```csharp
// Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "ComillasApp_";
});

// Usage example
public class ProductService
{
    private readonly IDistributedCache _cache;

    public async Task<Product> GetProductAsync(int id)
    {
        var cacheKey = $"product_{id}";
        var cached = await _cache.GetStringAsync(cacheKey);

        if (cached != null)
            return JsonSerializer.Deserialize<Product>(cached);

        var product = await _repository.GetByIdAsync(id);
        await _cache.SetStringAsync(cacheKey,
            JsonSerializer.Serialize(product),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) });

        return product;
    }
}
```

### 4.4 What NOT to do / What TO do

| ❌ DO NOT | ✅ DO |
|-----------|-------|
| Save files to `wwwroot/uploads/` | Use Azure Blob Storage |
| Use `Session["key"]` | Use `IDistributedCache` with Redis |
| Store in-memory cache | Use Redis distributed cache |
| Use `Server.MapPath()` | Use configuration from appsettings.json |
| Local temp files | Azure Blob Storage for temporary files |
| Singleton with mutable state | Scoped or Transient services |

---

## 5. Legacy Projects (WebForms)

### 5.1 Detect if project is legacy

**Indicators:**
- `.aspx` and `.aspx.cs` files
- `Web.config` instead of `appsettings.json`
- `System.Web` references
- ViewState and PostBack
- `<asp:*>` controls

### 5.2 Security headers in Web.config

```xml
<system.webServer>
    <httpProtocol>
        <customHeaders>
            <add name="X-Content-Type-Options" value="nosniff" />
            <add name="X-Frame-Options" value="SAMEORIGIN" />
            <add name="X-XSS-Protection" value="1; mode=block" />
            <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
        </customHeaders>
    </httpProtocol>
    <security>
        <requestFiltering>
            <requestLimits maxAllowedContentLength="104857600" /> <!-- 100 MB -->
        </requestFiltering>
    </security>
</system.webServer>
```

### 5.3 Connection strings in Web.config

```xml
<connectionStrings>
    <!-- ❌ NEVER hardcode in production -->
    <add name="DefaultConnection"
         connectionString="Data Source=SERVER;Initial Catalog=DB;Integrated Security=True;"
         providerName="System.Data.SqlClient" />
</connectionStrings>
```

**For production:** Use encrypted sections or Key Vault via custom configuration provider.

### 5.4 Decision Document for Legacy Projects

**When evaluating a legacy project, create a document answering:**

1. **Technical Assessment**
   - .NET version (4.x?)
   - Database version and compatibility
   - External dependencies (outdated libraries?)
   - Known security vulnerabilities

2. **Business Impact**
   - Number of active users
   - Criticality (low/medium/high/critical)
   - Frequency of changes
   - Integration with other systems

3. **Recommendation**
   - [ ] **Maintain as-is** (minimal changes, hardening only)
   - [ ] **Modernize in place** (update to .NET 4.8, secure headers)
   - [ ] **Gradual migration** (API-first, then migrate frontend)
   - [ ] **Full rewrite** (Clean Architecture, .NET 8+)

4. **Risks of Migration**
   - Estimated time and cost
   - Business interruption
   - Data migration complexity
   - Training required

**Template:** Save this analysis in `Documentos_Base/05_Migracion_Legacy/ANALISIS_[ProjectName].md`

---

## 6. Docker Compose for Development Environment

### 6.1 Standard Configuration

```yaml
# docker-compose.yml - For local development
version: '3.8'

services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "DevPassword123!"
      MSSQL_COLLATION: SQL_Latin1_General_CP1250_CI_AS
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  azurite:
    image: mcr.microsoft.com/azure-storage/azurite
    ports:
      - "10000:10000"  # Blob service
      - "10001:10001"  # Queue service
      - "10002:10002"  # Table service
    volumes:
      - azurite_data:/data

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI

volumes:
  sqlserver_data:
  redis_data:
  azurite_data:
```

### 6.2 Local appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=MyProject;User Id=sa;Password=DevPassword123!;TrustServerCertificate=True;",
    "Redis": "localhost:6379"
  },
  "AzureStorage": {
    "ConnectionString": "UseDevelopmentStorage=true"
  },
  "Email": {
    "SmtpHost": "localhost",
    "SmtpPort": 1025
  }
}
```

### 6.3 How to use

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Access services
# SQL Server: localhost,1433 (user: sa, password: DevPassword123!)
# Redis: localhost:6379
# Azurite Blob Storage: http://127.0.0.1:10000
# MailHog UI: http://localhost:8025
```

---

## 7. Version Control (Git)

### 7.1 Branch Strategy

```
main              ← Production
  ├── develop     ← Integration
  │   ├── feature/JIRA-123-user-crud
  │   ├── feature/JIRA-124-auth
  │   └── bugfix/JIRA-125-fix-validation
  └── hotfix/JIRA-126-critical-bug
```

### 7.2 Commit Message Convention

```
<type>(<scope>): <subject>

Examples:
feat(auth): add Azure AD authentication
fix(api): resolve null reference in user endpoint
docs(readme): update installation instructions
refactor(services): simplify user service logic
```

### 7.3 .gitignore Mandatory

```gitignore
# Secrets (NEVER commit)
appsettings.Production.json
*.pfx
*.p12

# Build output
bin/
obj/
publish/

# User-specific
.vs/
.vscode/
*.user
*.suo

# NuGet
packages/
*.nupkg

# Docker
.docker/
```

---

## 8. NuGet Packages - Recommended

### 8.1 Core Packages

| Package | Version | Purpose |
|---------|---------|---------|
| Dapper | 2.x | Data access (micro-ORM) |
| FluentValidation | 11.x | Input validation |
| Serilog.AspNetCore | 7.x | Structured logging |
| Azure.Storage.Blobs | 12.x | Blob Storage |
| StackExchange.Redis | 2.x | Redis cache |
| Azure.Identity | 1.x | Azure AD authentication |
| Azure.Extensions.AspNetCore.Configuration.Secrets | 1.x | Key Vault integration |

### 8.2 Testing Packages

| Package | Version | Purpose |
|---------|---------|---------|
| xUnit | 2.x | Test framework |
| FluentAssertions | 6.x | Assertion library |
| Moq | 4.x | Mocking framework |
| Testcontainers | 3.x | Integration tests with Docker |

---

## 9. Performance and Monitoring

### 9.1 Response Time Targets

| Endpoint Type | Target | Maximum |
|---------------|--------|---------|
| Simple GET (cache hit) | < 50ms | 100ms |
| GET with DB query | < 200ms | 500ms |
| POST/PUT (simple) | < 300ms | 1s |
| Complex operations | < 1s | 3s |
| File upload | < 5s | 15s |

### 9.2 Caching Strategy

```csharp
// Cache frequently accessed data
public class ProductRepository
{
    private readonly IDistributedCache _cache;
    private readonly IDbConnection _db;

    public async Task<List<Category>> GetCategoriesAsync()
    {
        const string cacheKey = "categories_all";
        var cached = await _cache.GetStringAsync(cacheKey);

        if (cached != null)
            return JsonSerializer.Deserialize<List<Category>>(cached);

        var categories = await _db.QueryAsync<Category>("SELECT * FROM Categories");
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(categories),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1) });

        return categories.ToList();
    }
}
```

---

## 10. Application Insights (Telemetry)

### 10.1 Basic Configuration

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});
```

### 10.2 Custom Telemetry

```csharp
public class OrderService
{
    private readonly TelemetryClient _telemetry;

    public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
    {
        using var operation = _telemetry.StartOperation<RequestTelemetry>("CreateOrder");

        try
        {
            var order = await _repository.CreateAsync(dto);

            _telemetry.TrackEvent("OrderCreated", new Dictionary<string, string>
            {
                ["OrderId"] = order.Id.ToString(),
                ["Amount"] = order.TotalAmount.ToString(),
                ["CustomerId"] = order.CustomerId.ToString()
            });

            return order;
        }
        catch (Exception ex)
        {
            operation.Telemetry.Success = false;
            _telemetry.TrackException(ex);
            throw;
        }
    }
}
```

### 10.3 What NOT to log

❌ **Never log:**
- Passwords
- Credit card numbers
- Social security numbers (DNI/NIE)
- Full email addresses (only domain)
- Session tokens
- Personal health information

✅ **Safe to log:**
- User IDs (anonymized)
- Operation duration
- Error codes
- IP addresses (anonymized)
- Non-sensitive metadata

---

## 11. Deployment Checklist

### 11.1 Pre-Production

- [ ] All secrets in Azure Key Vault
- [ ] Connection strings tested
- [ ] Redis cache configured
- [ ] Blob Storage configured
- [ ] Application Insights enabled
- [ ] HTTPS enforced (HSTS header)
- [ ] Security headers configured
- [ ] Error pages configured (not revealing stack traces)
- [ ] Logging configured (not logging sensitive data)
- [ ] Database migrations tested

### 11.2 Production

- [ ] Health check endpoint (`/health`)
- [ ] Monitoring alerts configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan
- [ ] Performance tested (load testing)
- [ ] Security scan completed (OWASP)
- [ ] Documentation updated
- [ ] Rollback plan defined

---

## 12. Common Patterns

### 12.1 Repository Pattern

```csharp
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(int id);
}

public class UserRepository : IUserRepository
{
    private readonly IDbConnection _db;

    public UserRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<User> GetByIdAsync(int id)
    {
        return await _db.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Id = @Id",
            new { Id = id });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _db.QueryAsync<User>("SELECT * FROM Users WHERE IsDeleted = 0");
    }
}
```

### 12.2 Service Layer Pattern

```csharp
public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    private readonly IValidator<CreateUserDto> _validator;

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        // 1. Validate
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        // 2. Map DTO to Entity
        var user = new User
        {
            Email = dto.Email,
            Name = dto.Name
        };

        // 3. Business logic
        user.NormalizeEmail();

        // 4. Persist
        await _repository.CreateAsync(user);

        // 5. Return DTO
        return new UserDto { Id = user.Id, Email = user.Email, Name = user.Name };
    }
}
```

---

## 13. References

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Azure Architecture Center**: https://learn.microsoft.com/azure/architecture/
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **.NET Documentation**: https://learn.microsoft.com/dotnet/

---

**Document version**: 3.0
**Last updated**: January 2026
**Owner**: Digital Transformation Office Technical Committee
