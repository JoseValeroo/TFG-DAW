# Resilience Guide - Comillas STIC

> **Version**: 1.0.0
> **Date**: 2026-02-10
> **Author**: STIC - Universidad Pontificia Comillas
> **Purpose**: Complete resilience guide for .NET 10 projects

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Polly v8+](#2-polly-v8)
3. [HttpClientFactory + Resilience](#3-httpclientfactory--resilience)
4. [Health Checks](#4-health-checks)
5. [Graceful Shutdown](#5-graceful-shutdown)
6. [Retry Strategies](#6-retry-strategies)
7. [Resilience Checklist](#7-resilience-checklist)
8. [NuGet Packages](#8-nuget-packages)
9. [References](#9-references)

---

## 1. Introduction

### 1.1 What is resilience

Resilience is the ability of a system to recover from failures and continue functioning acceptably. In distributed systems (APIs, databases, external services), failures are inevitable. A resilient system assumes things will fail and is prepared to handle it.

### 1.2 Why it matters at Comillas

- Applications depend on SQL Server, Azure AD, external services (Banner, Oracle HCM, Sigma)
- Load-balanced infrastructure requires each instance to handle failures independently
- Load spikes (enrollments, start of term) can saturate services

### 1.3 Key resilience patterns

| Pattern | Description | Analogy |
|---------|-------------|----------|
| **Retry** | Retry a failed operation with wait between attempts | Calling back a busy phone number |
| **Circuit Breaker** | Stop calling a failing service to give it time to recover | Circuit breaker cutting power during electrical overload |
| **Timeout** | Limit maximum wait time for an operation | Not waiting indefinitely in a queue |
| **Bulkhead** | Isolate failures by limiting resources per service, preventing propagation | Watertight compartments in a ship |
| **Fallback** | Provide an alternative response when the primary operation fails | Prepared plan B |

---

## 2. Polly v8+

### 2.1 Resilience Pipeline API (v8+)

Polly v8 introduces a new API based on `ResiliencePipeline` that replaces the old `Policy` API. The new API is more composable, more efficient, and supports generics natively.

> **IMPORTANT**: Do not use the legacy Policy API (v7). Examples in this document use exclusively the v8+ API.

### 2.2 Retry: retries with exponential backoff and jitter

```csharp
using Polly;
using Polly.Retry;

// Configure retry with exponential backoff + jitter
var retryPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddRetry(new RetryStrategyOptions<HttpResponseMessage>
    {
        // How many times to retry
        MaxRetryAttempts = 3,

        // Exponential backoff with jitter (recommended)
        BackoffType = DelayBackoffType.Exponential,
        Delay = TimeSpan.FromSeconds(1),        // 1s, 2s, 4s + jitter
        UseJitter = true,                        // Avoid "thundering herd"

        // Which HTTP responses to retry
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(response =>
                response.StatusCode == System.Net.HttpStatusCode.RequestTimeout ||       // 408
                response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||       // 429
                response.StatusCode >= System.Net.HttpStatusCode.InternalServerError),    // 500+

        // Logging each retry
        OnRetry = args =>
        {
            Log.Warning(
                "Retry {RetryAttempt} of {MaxRetries} after {Delay}ms. Reason: {Outcome}",
                args.AttemptNumber + 1,
                3,
                args.RetryDelay.TotalMilliseconds,
                args.Outcome.Exception?.Message ?? args.Outcome.Result?.StatusCode.ToString());
            return default;
        }
    })
    .Build();
```

### 2.3 Circuit Breaker: cut calls to failing services

```csharp
using Polly.CircuitBreaker;

var circuitBreakerPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions<HttpResponseMessage>
    {
        // Open circuit if 50% of requests fail
        FailureRatio = 0.5,

        // In a 30-second sampling window
        SamplingDuration = TimeSpan.FromSeconds(30),

        // With a minimum of 10 requests to evaluate
        MinimumThroughput = 10,

        // Keep circuit open for 30 seconds
        BreakDuration = TimeSpan.FromSeconds(30),

        // What is considered a failure
        ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
            .Handle<HttpRequestException>()
            .Handle<TimeoutRejectedException>()
            .HandleResult(r => r.StatusCode >= System.Net.HttpStatusCode.InternalServerError),

        // Circuit breaker events
        OnOpened = args =>
        {
            Log.Warning("Circuit Breaker OPENED. Duration: {BreakDuration}s. Reason: {Outcome}",
                args.BreakDuration.TotalSeconds,
                args.Outcome.Exception?.Message ?? "error responses");
            return default;
        },
        OnClosed = args =>
        {
            Log.Information("Circuit Breaker CLOSED. Service recovered");
            return default;
        },
        OnHalfOpened = args =>
        {
            Log.Information("Circuit Breaker HALF-OPEN. Testing service...");
            return default;
        }
    })
    .Build();
```

### 2.4 Timeout: limit wait time

```csharp
using Polly.Timeout;

var timeoutPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddTimeout(new TimeoutStrategyOptions
    {
        // Timeout per individual request
        Timeout = TimeSpan.FromSeconds(10),

        OnTimeout = args =>
        {
            Log.Warning("Timeout reached after {Timeout}s", args.Timeout.TotalSeconds);
            return default;
        }
    })
    .Build();
```

### 2.5 Bulkhead: limit concurrent requests

```csharp
using Polly.RateLimiting;

var bulkheadPipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    .AddConcurrencyLimiter(new ConcurrencyLimiterOptions
    {
        // Maximum 25 concurrent requests to this service
        PermitLimit = 25,

        // Queue of 50 waiting requests
        QueueLimit = 50
    })
    .Build();
```

### 2.6 Combined pipeline (recommended)

Order matters. They execute from outside in: Total timeout > Retry > Circuit Breaker > Per-attempt timeout.

```csharp
// Combined pipeline with correct order
var resiliencePipeline = new ResiliencePipelineBuilder<HttpResponseMessage>()
    // 1. Total timeout (for entire operation including retries)
    .AddTimeout(new TimeoutStrategyOptions
    {
        Timeout = TimeSpan.FromSeconds(60),
        Name = "TotalTimeout"
    })
    // 2. Retry (retries the operation)
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
    // 3. Circuit Breaker (protects target service)
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
    // 4. Timeout per individual attempt
    .AddTimeout(new TimeoutStrategyOptions
    {
        Timeout = TimeSpan.FromSeconds(10),
        Name = "AttemptTimeout"
    })
    .Build();
```

### 2.7 Note about Polly v8 vs v7

| Aspect | Polly v7 (legacy) | Polly v8+ (current) |
|---------|-------------------|-------------------|
| API | `Policy.Handle<T>().WaitAndRetryAsync()` | `ResiliencePipelineBuilder.AddRetry()` |
| Composition | `Policy.WrapAsync()` | Fluent builder with `.Add*()` |
| Performance | Reflection | Optimized, fewer allocations |
| Generics | Limited | Native |
| Microsoft.Extensions | Separate | Integrated |

---

## 3. HttpClientFactory + Resilience

### 3.1 Standard Resilience Handler

.NET 10 includes `Microsoft.Extensions.Http.Resilience` which integrates Polly directly with `HttpClientFactory`.

```csharp
// Program.cs - Standard resilience (recommended for most cases)
builder.Services.AddHttpClient("BannerApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["BannerApi:BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler();
// ^ Includes: Retry (3), Circuit Breaker, Timeout (30s), Bulkhead, Total Timeout
```

### 3.2 Custom resilience per service

```csharp
// Custom configuration for a critical service
builder.Services.AddHttpClient("OracleHCM", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["OracleHCM:BaseUrl"]!);
})
.AddResilienceHandler("oracle-resilience", builder =>
{
    // Longer total timeout for Oracle
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
        FailureRatio = 0.3,           // Oracle is more sensitive
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

### 3.3 Configuration via appsettings.json

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

### 4.1 Three mandatory endpoints

| Endpoint | Purpose | What it validates | Used by |
|----------|-----------|-----------|-----------|
| `/health` | General status | Everything | Dashboards, monitoring |
| `/health/ready` | Ready to receive traffic | DB, external dependencies | Load balancer, Kubernetes readiness |
| `/health/live` | Application is alive | Basic self-check | Kubernetes liveness, supervisor |

### 4.2 Difference between liveness and readiness

- **Liveness**: "Is the process alive?". If it fails, restart the instance.
- **Readiness**: "Can it receive traffic?". If it fails, remove from load balancer (don't restart).

Example: application is alive (liveness=OK) but SQL Server is down (readiness=FAIL). Load balancer stops sending traffic but doesn't restart the instance.

### 4.3 Complete configuration

```csharp
// Program.cs

// =============================================
// Register health checks
// =============================================
builder.Services.AddHealthChecks()
    // MANDATORY: SQL Server (readiness)
    .AddSqlServer(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection")!,
        healthQuery: "SELECT 1",
        name: "sqlserver",
        failureStatus: HealthStatus.Unhealthy,
        tags: ["ready", "db"])

    // MANDATORY: Self check (liveness)
    .AddCheck("self", () => HealthCheckResult.Healthy("Application active"),
        tags: ["live"])

    // OPTIONAL: Redis (if used)
    .AddRedis(
        redisConnectionString: builder.Configuration.GetConnectionString("Redis")!,
        name: "redis",
        failureStatus: HealthStatus.Degraded,
        tags: ["ready", "cache"])

    // OPTIONAL: Azure Blob Storage (if used)
    .AddAzureBlobStorage(
        connectionString: builder.Configuration.GetConnectionString("AzureStorage")!,
        name: "azure-blob",
        failureStatus: HealthStatus.Degraded,
        tags: ["ready", "storage"])

    // OPTIONAL: External API
    .AddUrlGroup(
        new Uri(builder.Configuration["BannerApi:HealthUrl"]!),
        name: "banner-api",
        failureStatus: HealthStatus.Degraded,
        tags: ["ready", "external"]);

// =============================================
// Map endpoints
// =============================================
var app = builder.Build();

// General endpoint
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// Readiness: only checks with "ready" tag
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// Liveness: only checks with "live" tag
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
                return HealthCheckResult.Healthy("Banner API available");
            }

            return HealthCheckResult.Degraded(
                $"Banner API responds with {response.StatusCode}");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(
                "Banner API unavailable",
                exception: ex);
        }
    }
}

// Register
builder.Services.AddHealthChecks()
    .AddCheck<BannerApiHealthCheck>("banner-api", tags: ["ready", "external"]);
```

### 4.5 Health check security

Health checks should NOT expose sensitive information:

```csharp
// In production, limit information
app.MapHealthChecks("/health", new HealthCheckOptions
{
    // Don't show details in production
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";

        var result = new
        {
            status = report.Status.ToString(),
            // Only show check names, not details
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString()
                // DO NOT include: e.Value.Description, e.Value.Exception
            })
        };

        await context.Response.WriteAsJsonAsync(result);
    }
})
.RequireAuthorization(); // Protect with authentication in production
```

---

## 5. Graceful Shutdown

### 5.1 IHostApplicationLifetime

```csharp
// Program.cs - Configure graceful shutdown
var app = builder.Build();

var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();

lifetime.ApplicationStarted.Register(() =>
{
    Log.Information("Application started");
});

lifetime.ApplicationStopping.Register(() =>
{
    Log.Warning("Application stopping... Draining requests");
});

lifetime.ApplicationStopped.Register(() =>
{
    Log.Information("Application stopped correctly");
});

// Configure shutdown timeout
builder.WebHost.ConfigureKestrel(options =>
{
    // Timeout to close existing connections
    options.Limits.KeepAliveTimeout = TimeSpan.FromSeconds(30);
});

// Global shutdown timeout
builder.Host.ConfigureHostOptions(options =>
{
    options.ShutdownTimeout = TimeSpan.FromSeconds(30);
});
```

### 5.2 Drain requests in BackgroundService

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
        _logger.LogWarning("Shutdown requested. Waiting for {Count} active tasks...",
            _activeTasks.Count);

        // Wait for active tasks to complete (with timeout)
        if (_activeTasks.Any())
        {
            var pendingTasks = _activeTasks.Values.ToArray();
            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);

            await Task.WhenAny(Task.WhenAll(pendingTasks), timeoutTask);

            var remaining = _activeTasks.Count;
            if (remaining > 0)
            {
                _logger.LogError("Shutdown timeout. {Count} tasks not completed", remaining);
            }
        }

        _logger.LogInformation("Worker stopped correctly");
        await base.StopAsync(cancellationToken);
    }

    private async Task ProcessNextItemAsync(CancellationToken ct)
    {
        // Process item...
    }
}
```

### 5.3 Signal handling

.NET automatically handles system signals when using the generic host:

| Signal | Platform | .NET Action |
|-------|-----------|-------------|
| `SIGTERM` | Linux / Docker / Kubernetes | Triggers `ApplicationStopping`, starts shutdown |
| `SIGINT` (Ctrl+C) | All | Triggers `ApplicationStopping`, starts shutdown |
| Windows Service Stop | Windows | Triggers `ApplicationStopping`, starts shutdown |

### 5.4 Load balancer deregistration

Recommended shutdown process:

```
1. Load balancer sends SIGTERM
2. Application marks /health/ready as Unhealthy
3. Load balancer stops sending new requests
4. Application drains existing requests (max 30s)
5. Application closes connections and frees resources
6. Process terminates
```

```csharp
// Mark as not-ready during shutdown
public class ReadinessHealthCheck : IHealthCheck
{
    private static volatile bool _isReady = true;

    public static void SetNotReady() => _isReady = false;

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_isReady
            ? HealthCheckResult.Healthy("Ready")
            : HealthCheckResult.Unhealthy("Shutting down"));
    }
}

// In Program.cs
lifetime.ApplicationStopping.Register(() =>
{
    ReadinessHealthCheck.SetNotReady();
    // Give load balancer time to detect the change
    Thread.Sleep(5000);
});
```

---

## 6. Retry Strategies

### 6.1 Strategy comparison

| Strategy | Delay between retries | When to use | Risk |
|------------|----------------------|-------------|--------|
| **Immediate** | 0, 0, 0 | Never in production | Overloads the service |
| **Fixed interval** | 2s, 2s, 2s | Rarely | Thundering herd |
| **Exponential** | 1s, 2s, 4s | Acceptable | Synchronized retries |
| **Exponential + jitter** | 1.2s, 2.7s, 3.9s | **RECOMMENDED** | Low risk |

> **Jitter** adds random variation to delay to prevent multiple instances from retrying at the same time (thundering herd problem).

### 6.2 When to retry

**Retry (transient failures):**

| HTTP Code | Description | Retriable |
|-------------|-------------|-------------|
| 408 | Request Timeout | Yes |
| 429 | Too Many Requests | Yes (respect Retry-After header) |
| 500 | Internal Server Error | Yes |
| 502 | Bad Gateway | Yes |
| 503 | Service Unavailable | Yes |
| 504 | Gateway Timeout | Yes |

**DO NOT retry (permanent failures):**

| HTTP Code | Description | Why not retry |
|-------------|-------------|----------------------|
| 400 | Bad Request | Sent data is incorrect |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | No permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | State conflict |
| 422 | Unprocessable Entity | Validation failed |

### 6.3 Idempotency

Before retrying a write operation, ensure it's **idempotent** (executing it multiple times produces the same result):

```csharp
// IDEMPOTENT: Use a unique IdempotencyKey per operation
public class CreateBecaCommand
{
    // If retry resends the same command, server detects duplicate
    public Guid IdempotencyKey { get; init; } = Guid.NewGuid();
    public string Nombre { get; init; } = string.Empty;
    public decimal Importe { get; init; }
}

// In handler
public async Task<BecaDto> Handle(CreateBecaCommand request, CancellationToken ct)
{
    // Check if this operation was already processed
    var existing = await _repository.GetByIdempotencyKeyAsync(request.IdempotencyKey, ct);
    if (existing is not null)
    {
        return existing.ToDto(); // Return previous result without duplicating
    }

    // Process normally...
}
```

---

## 7. Resilience Checklist

### Before going to production

- [ ] Health checks configured: `/health`, `/health/ready`, `/health/live`
- [ ] SQL Server health check registered as mandatory
- [ ] Polly resilience pipelines for all `HttpClient` calling external services
- [ ] Circuit breaker configured for each external service (Banner, Oracle HCM, Sigma)
- [ ] Timeout configured in all HTTP calls (30s default, adjust per service)
- [ ] Retry with exponential backoff + jitter (3 attempts maximum)
- [ ] Graceful shutdown implemented with 30-second timeout
- [ ] Resilience logs: each retry, each circuit breaker open/close
- [ ] Write operations with retry are idempotent
- [ ] Health check UI enabled only in development (don't expose in production)
- [ ] Production health checks protected with authentication or IP whitelist
- [ ] `AddStandardResilienceHandler()` as minimum for HttpClients without specific configuration
- [ ] Alerts configured for prolonged open circuit breakers

---

## 8. NuGet Packages

| Package | Version | Purpose |
|---------|---------|-----------|
| `Microsoft.Extensions.Http.Resilience` | 10.* | Polly + HttpClientFactory integration (.NET 10) |
| `Polly.Core` | 8.* | Polly v8 core (ResiliencePipeline) |
| `Polly.Extensions` | 8.* | Extensions for DI and telemetry |
| `Microsoft.Extensions.Http.Polly` | 8.* | Polly + HttpClientFactory (legacy alternative) |
| `AspNetCore.HealthChecks.SqlServer` | 8.* | Health check for SQL Server |
| `AspNetCore.HealthChecks.Redis` | 8.* | Health check for Redis |
| `AspNetCore.HealthChecks.AzureBlobStorage` | 8.* | Health check for Azure Blob Storage |
| `AspNetCore.HealthChecks.Uris` | 8.* | Health check for external URLs |
| `AspNetCore.HealthChecks.UI` | 8.* | UI to visualize health checks (dev only) |
| `AspNetCore.HealthChecks.UI.Client` | 8.* | Serializer for detailed responses |

---

## 9. References

### Related files in template

| File | Content |
|---------|-----------|
| `.claude/skills/resilience-patterns/` | Resilience patterns skill |
| `.claude/rules/console.md` | Graceful shutdown in Worker Services |
| `Documentos_Base/01_Estructura_Tecnica/ESTRUCTURA_TECNICA.md` | Load-balanced infrastructure (section 4) |
| `Documentos_Base/06_Observabilidad/GUIA_OBSERVABILIDAD.md` | Resilience logging and metrics |

### External documentation

| Resource | URL |
|---------|-----|
| Polly v8 Documentation | github.com/App-vNext/Polly |
| Microsoft Resilience Extensions | learn.microsoft.com/dotnet/core/resilience |
| Health Checks in ASP.NET Core | learn.microsoft.com/aspnet/core/host-and-deploy/health-checks |
| Cloud Design Patterns - Retry | learn.microsoft.com/azure/architecture/patterns/retry |
| Cloud Design Patterns - Circuit Breaker | learn.microsoft.com/azure/architecture/patterns/circuit-breaker |

---

*Document generated: 2026-02-10*
*Version: 1.0.0*
*STIC - Universidad Pontificia Comillas*
