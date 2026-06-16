# Guia de Resiliencia - Comillas STIC

> **Version**: 1.0.0
> **Fecha**: 2026-02-10
> **Autor**: STIC - Universidad Pontificia Comillas
> **Proposito**: Guia completa de resiliencia para proyectos .NET 10

---

## Indice

1. [Introduccion](#1-introduccion)
2. [Polly v8+](#2-polly-v8)
3. [HttpClientFactory + Resilience](#3-httpclientfactory--resilience)
4. [Health Checks](#4-health-checks)
5. [Graceful Shutdown](#5-graceful-shutdown)
6. [Estrategias de Retry](#6-estrategias-de-retry)
7. [Checklist de Resiliencia](#7-checklist-de-resiliencia)
8. [Paquetes NuGet](#8-paquetes-nuget)
9. [Referencias](#9-referencias)

---

## 1. Introduccion

### 1.1 Que es la resiliencia

La resiliencia es la capacidad de un sistema para recuperarse de fallos y seguir funcionando de forma aceptable. En sistemas distribuidos (APIs, bases de datos, servicios externos), los fallos son inevitables. Un sistema resiliente asume que las cosas fallaran y esta preparado para gestionarlo.

### 1.2 Por que importa en Comillas

- Las aplicaciones dependen de SQL Server, Azure AD, servicios externos (Banner, Oracle HCM, Sigma)
- La infraestructura balanceada requiere que cada instancia gestione sus fallos de forma independiente
- Los picos de carga (matriculaciones, inicio de curso) pueden saturar servicios

### 1.3 Patrones clave de resiliencia

| Patron | Descripcion | Analogia |
|--------|-------------|----------|
| **Retry** | Reintentar una operacion fallida con espera entre intentos | Llamar de nuevo a un telefono que comunica |
| **Circuit Breaker** | Dejar de llamar a un servicio que falla repetidamente para darle tiempo a recuperarse | Cortar la luz cuando hay sobrecarga electrica |
| **Timeout** | Limitar el tiempo maximo de espera de una operacion | No esperar indefinidamente en una cola |
| **Bulkhead** | Aislar fallos limitando recursos por servicio, evitando que un fallo se propague | Compartimentos estancos de un barco |
| **Fallback** | Proporcionar una respuesta alternativa cuando la operacion principal falla | Plan B preparado de antemano |

---

## 2. Polly v8+

### 2.1 API de Resilience Pipeline (v8+)

Polly v8 introduce una nueva API basada en `ResiliencePipeline` que reemplaza la antigua API de `Policy`. La nueva API es mas composable, mas eficiente y soporta generics de forma nativa.

> **IMPORTANTE**: No usar la API legacy de Policy (v7). Los ejemplos en este documento usan exclusivamente la API v8+.

### 2.2 Retry: reintentos con backoff exponencial y jitter

```csharp
using Polly;
using Polly.Retry;

// Configurar retry con backoff exponencial + jitter
var retryPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddRetry(new RetryStrategyOptions<HttpResponseMessage>
    {
        // Cuantas veces reintentar
        MaxRetryAttempts = 3,

        // Backoff exponencial con jitter (recomendado)
        BackoffType = DelayBackoffType.Exponential,
        Delay = TimeSpan.FromSeconds(1),        // 1s, 2s, 4s + jitter
        UseJitter = true,                        // Evita "thundering herd"

        // Que respuestas HTTP reintentar
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(response =>
                response.StatusCode == System.Net.HttpStatusCode.RequestTimeout ||       // 408
                response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||       // 429
                response.StatusCode >= System.Net.HttpStatusCode.InternalServerError),    // 500+

        // Logging de cada reintento
        OnRetry = args =>
        {
            Log.Warning(
                "Reintento {RetryAttempt} de {MaxRetries} tras {Delay}ms. Motivo: {Outcome}",
                args.AttemptNumber + 1,
                3,
                args.RetryDelay.TotalMilliseconds,
                args.Outcome.Exception?.Message ?? args.Outcome.Result?.StatusCode.ToString());
            return default;
        }
    })
    .Build();
```

### 2.3 Circuit Breaker: cortar llamadas a servicios que fallan

```csharp
using Polly.CircuitBreaker;

var circuitBreakerPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>
    {
        // Abrir el circuito si falla el 50% de las peticiones
        FailureRatio = 0.5,

        // En una ventana de muestreo de 30 segundos
        SamplingDuration = TimeSpan.FromSeconds(30),

        // Con un minimo de 10 peticiones para evaluar
        MinimumThroughput = 10,

        // Mantener el circuito abierto durante 30 segundos
        BreakDuration = TimeSpan.FromSeconds(30),

        // Que se considera fallo
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(r => r.StatusCode >= System.Net.HttpStatusCode.InternalServerError),

        // Eventos del circuit breaker
        OnOpened = args =>
        {
            Log.Warning("Circuit Breaker ABIERTO. Duracion: {BreakDuration}s. Motivo: {Outcome}",
                args.BreakDuration.TotalSeconds,
                args.Outcome.Exception?.Message ?? "respuestas con error");
            return default;
        },
        OnClosed = args =>
        {
            Log.Information("Circuit Breaker CERRADO. Servicio recuperado");
            return default;
        },
        OnHalfOpened = args =>
        {
            Log.Information("Circuit Breaker SEMI-ABIERTO. Probando servicio...");
            return default;
        }
    })
    .Build();
```

### 2.4 Timeout: limitar tiempo de espera

```csharp
using Polly.Timeout;

var timeoutPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddTimeout(new TimeoutStrategyOptions
    {
        // Timeout por peticion individual
        Timeout = TimeSpan.FromSeconds(10),

        OnTimeout = args =>
        {
            Log.Warning("Timeout alcanzado tras {Timeout}s", args.Timeout.TotalSeconds);
            return default;
        }
    })
    .Build();
```

### 2.5 Bulkhead: limitar peticiones concurrentes

```csharp
using Polly.RateLimiting;

var bulkheadPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddConcurrencyLimiter(new ConcurrencyLimiterOptions
    {
        // Maximo 25 peticiones concurrentes a este servicio
        PermitLimit = 25,

        // Cola de espera de 50 peticiones
        QueueLimit = 50
    })
    .Build();
```

### 2.6 Pipeline combinado (recomendado)

El orden importa. Se ejecutan de fuera hacia dentro: Timeout total > Retry > Circuit Breaker > Timeout por intento.

```csharp
// Pipeline combinado con orden correcto
var resiliencePipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    // 1. Timeout total (para toda la operacion incluyendo retries)
    .AddTimeout(new TimeoutStrategyOptions
    {
        Timeout = TimeSpan.FromSeconds(60),
        Name = "TotalTimeout"
    })
    // 2. Retry (reintenta la operacion)
    .AddRetry(new RetryStrategyOptions<HttpResponseMessage>
    {
        MaxRetryAttempts = 3,
        BackoffType = DelayBackoffType.Exponential,
        Delay = TimeSpan.FromSeconds(1),
        UseJitter = true,
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(r => (int)r.StatusCode >= 500),
        Name = "Retry"
    })
    // 3. Circuit Breaker (protege el servicio destino)
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>
    {
        FailureRatio = 0.5,
        SamplingDuration = TimeSpan.FromSeconds(30),
        MinimumThroughput = 10,
        BreakDuration = TimeSpan.FromSeconds(30),
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .HandleResult(r => (int)r.StatusCode >= 500),
        Name = "CircuitBreaker"
    })
    // 4. Timeout por intento individual
    .AddTimeout(new TimeoutStrategyOptions
    {
        Timeout = TimeSpan.FromSeconds(10),
        Name = "AttemptTimeout"
    })
    .Build();
```

### 2.7 Nota sobre Polly v8 vs v7

| Aspecto | Polly v7 (legacy) | Polly v8+ (actual) |
|---------|-------------------|-------------------|
| API | `Policy.Handle<T>().WaitAndRetryAsync()` | `ResiliencePipelineBuilder.AddRetry()` |
| Composicion | `Policy.WrapAsync()` | Builder fluido con `.Add*()` |
| Performance | Reflexion | Optimizado, menos allocations |
| Generics | Limitado | Nativo |
| Microsoft.Extensions | Separado | Integrado |

---

## 3. HttpClientFactory + Resilience

### 3.1 Standard Resilience Handler

.NET 10 incluye `Microsoft.Extensions.Http.Resilience` que integra Polly directamente con `HttpClientFactory`.

```csharp
// Program.cs - Resiliencia estandar (recomendado para la mayoria de casos)
builder.Services.AddHttpClient("BannerApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["BannerApi:BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler();
// ^ Incluye: Retry (3), Circuit Breaker, Timeout (30s), Bulkhead, Total Timeout
```

### 3.2 Resiliencia personalizada por servicio

```csharp
// Configuracion personalizada para un servicio critico
builder.Services.AddHttpClient("OracleHCM", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["OracleHCM:BaseUrl"]!);
})
.AddResilienceHandler("oracle-resilience", builder =>
{
    // Timeout total mas largo para Oracle
    builder.AddTimeout(new TimeoutStrategyOptions
    {
        Timeout = TimeSpan.FromSeconds(90)
    });

    builder.AddRetry(new HttpRetryStrategyOptions
    {
        MaxRetryAttempts = 2,
        BackoffType = DelayBackoffType.Exponential,
        Delay = TimeSpan.FromSeconds(2),
        UseJitter = true
    });

    builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
    {
        FailureRatio = 0.3,           // Oracle es mas sensible
        SamplingDuration = TimeSpan.FromSeconds(60),
        MinimumThroughput = 5,
        BreakDuration = TimeSpan.FromSeconds(60)
    });

    builder.AddTimeout(new TimeoutStrategyOptions
    {
        Timeout = TimeSpan.FromSeconds(30)
    });
});
```

### 3.3 Configuracion via appsettings.json

```json
{
  "Resilience": {
    "BannerApi": {
      "Retry": {
        "MaxRetryAttempts": 3,
        "BackoffType": "Exponential",
        "DelaySeconds": 1,
        "UseJitter": true
      },
      "CircuitBreaker": {
        "FailureRatio": 0.5,
        "SamplingDurationSeconds": 30,
        "MinimumThroughput": 10,
        "BreakDurationSeconds": 30
      },
      "Timeout": {
        "TimeoutSeconds": 10
      },
      "TotalTimeout": {
        "TimeoutSeconds": 60
      }
    }
  }
}
```

---

## 4. Health Checks

### 4.1 Tres endpoints obligatorios

| Endpoint | Proposito | Que valida | Usado por |
|----------|-----------|-----------|-----------|
| `/health` | Estado general | Todo | Dashboards, monitoreo |
| `/health/ready` | Listo para recibir trafico | BD, dependencias externas | Load balancer, Kubernetes readiness |
| `/health/live` | La aplicacion esta viva | Self-check basico | Kubernetes liveness, supervisor |

### 4.2 Diferencia entre liveness y readiness

- **Liveness**: "Esta el proceso vivo?". Si falla, reiniciar la instancia.
- **Readiness**: "Puede recibir trafico?". Si falla, sacar del balanceador (no reiniciar).

Ejemplo: la aplicacion esta viva (liveness=OK) pero SQL Server esta caido (readiness=FAIL). El balanceador deja de enviar trafico pero no reinicia la instancia.

### 4.3 Configuracion completa

```csharp
// Program.cs

// =============================================
// Registrar health checks
// =============================================
builder.Services.AddHealthChecks()
    // OBLIGATORIO: SQL Server (readiness)
    .AddSqlServer(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection")!,
        healthQuery: "SELECT 1",
        name: "sqlserver",
        failureStatus: HealthStatus.Unhealthy,
        tags: ["ready", "db"])

    // OBLIGATORIO: Self check (liveness)
    .AddCheck("self", () => HealthCheckResult.Healthy("Aplicacion activa"),
        tags: ["live"])

    // OPCIONAL: Redis (si se usa)
    .AddRedis(
        redisConnectionString: builder.Configuration.GetConnectionString("Redis")!,
        name: "redis",
        failureStatus: HealthStatus.Degraded,
        tags: ["ready", "cache"])

    // OPCIONAL: Azure Blob Storage (si se usa)
    .AddAzureBlobStorage(
        connectionString: builder.Configuration.GetConnectionString("AzureStorage")!,
        name: "azure-blob",
        failureStatus: HealthStatus.Degraded,
        tags: ["ready", "storage"])

    // OPCIONAL: API externa
    .AddUrlGroup(
        new Uri(builder.Configuration["BannerApi:HealthUrl"]!),
        name: "banner-api",
        failureStatus: HealthStatus.Degraded,
        tags: ["ready", "external"]);

// =============================================
// Mapear endpoints
// =============================================
var app = builder.Build();

// Endpoint general
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// Readiness: solo checks con tag "ready"
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// Liveness: solo checks con tag "live"
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

### 4.4 Custom health check

```csharp
public class BannerApiHealthCheck : IHealthCheck
{
    private readonly IHttpClientFactory _httpClientFactory;

    public BannerApiHealthCheck(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("BannerApi");
            var response = await client.GetAsync("/health",
                cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return HealthCheckResult.Healthy("Banner API disponible");
            }

            return HealthCheckResult.Degraded(
                $"Banner API responde con {response.StatusCode}");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(
                "Banner API no disponible",
                exception: ex);
        }
    }
}

// Registrar
builder.Services.AddHealthChecks()
    .AddCheck<BannerApiHealthCheck>("banner-api", tags: ["ready", "external"]);
```

### 4.5 Seguridad de los health checks

Los health checks NO deben exponer informacion sensible:

```csharp
// En produccion, limitar la informacion
app.MapHealthChecks("/health", new HealthCheckOptions
{
    // No mostrar detalles en produccion
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";

        var result = new
        {
            status = report.Status.ToString(),
            // Solo mostrar nombres de checks, no detalles
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString()
                // NO incluir: e.Value.Description, e.Value.Exception
            })
        };

        await context.Response.WriteAsJsonAsync(result);
    }
})
.RequireAuthorization(); // Proteger con autenticacion en produccion
```

---

## 5. Graceful Shutdown

### 5.1 IHostApplicationLifetime

```csharp
// Program.cs - Configurar graceful shutdown
var app = builder.Build();

var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();

lifetime.ApplicationStarted.Register(() =>
{
    Log.Information("Aplicacion iniciada");
});

lifetime.ApplicationStopping.Register(() =>
{
    Log.Warning("Aplicacion deteniendose... Drenando peticiones");
});

lifetime.ApplicationStopped.Register(() =>
{
    Log.Information("Aplicacion detenida correctamente");
});

// Configurar timeout de shutdown
builder.WebHost.ConfigureKestrel(options =>
{
    // Timeout para cerrar conexiones existentes
    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(30);
});

// Timeout global de shutdown
builder.Host.ConfigureHostOptions(options =>
{
    options.ShutdownTimeout = TimeSpan.FromSeconds(30);
});
```

### 5.2 Drain requests en BackgroundService

```csharp
public class OrderProcessorWorker : BackgroundService
{
    private readonly ILogger<OrderProcessorWorker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ConcurrentDictionary<Guid, Task> _activeTasks = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var taskId = Guid.NewGuid();
                var task = ProcessNextItemAsync(stoppingToken);
                _activeTasks.TryAdd(taskId, task);

                _ = task.ContinueWith(_ => _activeTasks.TryRemove(taskId, out _));

                await Task.Delay(1000, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogWarning("Shutdown solicitado. Esperando {Count} tareas activas...",
            _activeTasks.Count);

        // Esperar a que terminen las tareas activas (con timeout)
        if (_activeTasks.Any())
        {
            var pendingTasks = _activeTasks.Values.ToArray();
            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);

            await Task.WhenAny(Task.WhenAll(pendingTasks), timeoutTask);

            var remaining = _activeTasks.Count;
            if (remaining > 0)
            {
                _logger.LogError("Timeout de shutdown. {Count} tareas no completadas", remaining);
            }
        }

        _logger.LogInformation("Worker detenido correctamente");
        await base.StopAsync(cancellationToken);
    }

    private async Task ProcessNextItemAsync(CancellationToken ct)
    {
        // Procesar item...
    }
}
```

### 5.3 Signal handling

.NET maneja automaticamente las senales de sistema cuando se usa el host generico:

| Senal | Plataforma | Accion .NET |
|-------|-----------|-------------|
| `SIGTERM` | Linux / Docker / Kubernetes | Dispara `ApplicationStopping`, inicia shutdown |
| `SIGINT` (Ctrl+C) | Todas | Dispara `ApplicationStopping`, inicia shutdown |
| Windows Service Stop | Windows | Dispara `ApplicationStopping`, inicia shutdown |

### 5.4 Deregistracion del load balancer

El proceso recomendado de shutdown:

```
1. Load balancer envia SIGTERM
2. Aplicacion marca /health/ready como Unhealthy
3. Load balancer deja de enviar nuevas peticiones
4. Aplicacion drena peticiones existentes (max 30s)
5. Aplicacion cierra conexiones y libera recursos
6. Proceso termina
```

```csharp
// Marcar como no-ready durante shutdown
public class ReadinessHealthCheck : IHealthCheck
{
    private static volatile bool _isReady = true;

    public static void SetNotReady() => _isReady = false;

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_isReady
            ? HealthCheckResult.Healthy("Listo")
            : HealthCheckResult.Unhealthy("Apagandose"));
    }
}

// En Program.cs
lifetime.ApplicationStopping.Register(() =>
{
    ReadinessHealthCheck.SetNotReady();
    // Dar tiempo al load balancer para detectar el cambio
    Thread.Sleep(5000);
});
```

---

## 6. Estrategias de Retry

### 6.1 Comparativa de estrategias

| Estrategia | Delay entre reintentos | Cuando usar | Riesgo |
|------------|----------------------|-------------|--------|
| **Inmediato** | 0, 0, 0 | Nunca en produccion | Sobrecarga el servicio |
| **Intervalo fijo** | 2s, 2s, 2s | Rara vez | Thundering herd |
| **Exponencial** | 1s, 2s, 4s | Aceptable | Reintentos sincronizados |
| **Exponencial + jitter** | 1.2s, 2.7s, 3.9s | **RECOMENDADO** | Bajo riesgo |

> **Jitter** anade una variacion aleatoria al delay para evitar que multiples instancias reintenten al mismo tiempo (thundering herd problem).

### 6.2 Cuando reintentar

**Reintentar (fallos transitorios):**

| Codigo HTTP | Descripcion | Reintentable |
|-------------|-------------|-------------|
| 408 | Request Timeout | Si |
| 429 | Too Many Requests | Si (respetar Retry-After header) |
| 500 | Internal Server Error | Si |
| 502 | Bad Gateway | Si |
| 503 | Service Unavailable | Si |
| 504 | Gateway Timeout | Si |

**NO reintentar (fallos permanentes):**

| Codigo HTTP | Descripcion | Por que no reintentar |
|-------------|-------------|----------------------|
| 400 | Bad Request | Los datos enviados son incorrectos |
| 401 | Unauthorized | Credenciales invalidas |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | El recurso no existe |
| 409 | Conflict | Conflicto de estado |
| 422 | Unprocessable Entity | Validacion fallida |

### 6.3 Idempotencia

Antes de reintentar una operacion de escritura, asegurar que es **idempotente** (ejecutarla multiples veces produce el mismo resultado):

```csharp
// IDEMPOTENTE: Usar un IdempotencyKey unico por operacion
public class CreateBecaCommand
{
    // Si el retry reenvia el mismo comando, el servidor detecta el duplicado
    public Guid IdempotencyKey { get; init; } = Guid.NewGuid();
    public string Nombre { get; init; } = string.Empty;
    public decimal Importe { get; init; }
}

// En el handler
public async Task<BecaDto> Handle(CreateBecaCommand request, CancellationToken ct)
{
    // Verificar si ya se proceso esta operacion
    var existing = await _repository.GetByIdempotencyKeyAsync(request.IdempotencyKey, ct);
    if (existing is not null)
    {
        return existing.ToDto(); // Retornar resultado anterior sin duplicar
    }

    // Procesar normalmente...
}
```

---

## 7. Checklist de Resiliencia

### Antes de ir a produccion

- [ ] Health checks configurados: `/health`, `/health/ready`, `/health/live`
- [ ] SQL Server health check registrado como obligatorio
- [ ] Polly resilience pipelines para todos los `HttpClient` que llaman a servicios externos
- [ ] Circuit breaker configurado para cada servicio externo (Banner, Oracle HCM, Sigma)
- [ ] Timeout configurado en todas las llamadas HTTP (30s default, ajustar por servicio)
- [ ] Retry con backoff exponencial + jitter (3 intentos maximo)
- [ ] Graceful shutdown implementado con timeout de 30 segundos
- [ ] Logs de resiliencia: cada retry, cada apertura/cierre de circuit breaker
- [ ] Operaciones de escritura con retry son idempotentes
- [ ] Health check UI habilitado solo en desarrollo (no exponer en produccion)
- [ ] Health checks de produccion protegidos con autenticacion o IP whitelist
- [ ] `AddStandardResilienceHandler()` como minimo para HttpClients sin configuracion especifica
- [ ] Alertas configuradas para circuit breakers abiertos prolongadamente

---

## 8. Paquetes NuGet

| Paquete | Version | Proposito |
|---------|---------|-----------|
| `Microsoft.Extensions.Http.Resilience` | 10.* | Integracion Polly + HttpClientFactory (.NET 10) |
| `Polly.Core` | 8.* | Core de Polly v8 (ResiliencePipeline) |
| `Polly.Extensions` | 8.* | Extensiones para DI y telemetria |
| `Microsoft.Extensions.Http.Polly` | 8.* | Polly + HttpClientFactory (alternativa legacy) |
| `AspNetCore.HealthChecks.SqlServer` | 8.* | Health check para SQL Server |
| `AspNetCore.HealthChecks.Redis` | 8.* | Health check para Redis |
| `AspNetCore.HealthChecks.AzureBlobStorage` | 8.* | Health check para Azure Blob Storage |
| `AspNetCore.HealthChecks.Uris` | 8.* | Health check para URLs externas |
| `AspNetCore.HealthChecks.UI` | 8.* | UI para visualizar health checks (solo dev) |
| `AspNetCore.HealthChecks.UI.Client` | 8.* | Serializer para respuestas detalladas |

---

## 9. Referencias

### Archivos relacionados en la plantilla

| Archivo | Contenido |
|---------|-----------|
| `.claude/skills/resilience-patterns/` | Skill de patrones de resiliencia |
| `.claude/rules/console.md` | Graceful shutdown en Worker Services |
| `Documentos_Base/01_Estructura_Tecnica/ESTRUCTURA_TECNICA.md` | Infraestructura balanceada (seccion 4) |
| `Documentos_Base/06_Observabilidad/GUIA_OBSERVABILIDAD.md` | Logging y metricas de resiliencia |

### Documentacion externa

| Recurso | URL |
|---------|-----|
| Polly v8 Documentation | github.com/App-vNext/Polly |
| Microsoft Resilience Extensions | learn.microsoft.com/dotnet/core/resilience |
| Health Checks in ASP.NET Core | learn.microsoft.com/aspnet/core/host-and-deploy/health-checks |
| Cloud Design Patterns - Retry | learn.microsoft.com/azure/architecture/patterns/retry |
| Cloud Design Patterns - Circuit Breaker | learn.microsoft.com/azure/architecture/patterns/circuit-breaker |

---

*Documento generado: 2026-02-10*
*Version: 1.0.0*
*STIC - Universidad Pontificia Comillas*
