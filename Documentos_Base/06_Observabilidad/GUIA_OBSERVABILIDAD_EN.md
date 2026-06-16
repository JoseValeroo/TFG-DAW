# Observability Guide - Comillas STIC

> **Version**: 1.0.0
> **Date**: 2026-02-10
> **Author**: STIC - Universidad Pontificia Comillas
> **Purpose**: Complete observability guide for .NET 10 projects

---

## Index

1. [Introduction](#1-introduction)
2. [OpenTelemetry (.NET 10)](#2-opentelemetry-net-10)
3. [Serilog](#3-serilog)
4. [Application Insights](#4-application-insights)
5. [Business Metrics](#5-business-metrics)
6. [GDPR and Sensitive Data](#6-gdpr-and-sensitive-data)
7. [Observability Checklist](#7-observability-checklist)
8. [NuGet Packages](#8-nuget-packages)
9. [References](#9-references)

---

## 1. Introduction

### 1.1 The three pillars of observability

Observability allows understanding the internal state of a system from its external outputs. It rests on three complementary pillars:

| Pillar | Description | Comillas Tools | Question it answers |
|--------|-------------|----------------|---------------------|
| **Logs** | Textual records of discrete events with structured context | Serilog + Application Insights | "What happened?" |
| **Metrics** | Aggregatable numeric values representing system state over time | OpenTelemetry Metrics + App Insights | "How much is happening?" |
| **Traces** | Tracking of a request across multiple services and components | OpenTelemetry Traces + App Insights | "Where is it happening?" |

### 1.2 Why observability matters

- **Detect problems before users do** - Metrics and alerts allow identifying degradations before they become incidents.
- **Understand system behavior** - Distributed traces show the real flow of requests, including times and dependencies.
- **Reduce time to resolution (MTTR)** - Structured and correlated logs enable diagnosing problems in minutes instead of hours.
- **Make data-driven decisions** - Business metrics provide visibility on the real impact of changes.

---

## 2. OpenTelemetry (.NET 10)

### 2.1 What is OpenTelemetry

OpenTelemetry (OTel) is an open, vendor-neutral standard for generating, collecting, and exporting telemetry data. In .NET 10, the integration is native and recommended by Microsoft as the standard way to instrument applications.

**Advantages over proprietary solutions:**
- No vendor lock-in: same code, different backends
- Native support in .NET 10 (System.Diagnostics)
- Active community and CNCF standard
- Auto-instrumentation for common libraries

### 2.2 Configuration in Program.cs

```csharp
// Program.cs - Complete OpenTelemetry configuration in .NET 10
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// =============================================
// Shared resource (identifies the service)
// =============================================
var resourceBuilder = ResourceBuilder.CreateDefault()
    .AddService(
        serviceName: "Comillas.MiApp.Api",
        serviceVersion: "1.0.0",
        serviceInstanceId: Environment.MachineName);

// =============================================
// TRACES
// =============================================
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing
            .SetResourceBuilder(resourceBuilder)
            // Auto-instrumentation
            .AddAspNetCoreInstrumentation(options =>
            {
                options.RecordException = true;
                options.Filter = httpContext =>
                    !httpContext.Request.Path.StartsWithSegments("/health");
            })
            .AddHttpClientInstrumentation(options =>
            {
                options.RecordException = true;
            })
            .AddSqlClientInstrumentation(options =>
            {
                options.SetDbStatementForText = true;
                options.RecordException = true;
            })
            .AddEntityFrameworkCoreInstrumentation(options =>
            {
                options.SetDbStatementForText = true;
            })
            // Custom sources
            .AddSource("Comillas.MiApp.*")
            // Exporters
            .AddConsoleExporter()                      // Development
            .AddAzureMonitorTraceExporter(options =>    // Production
            {
                options.ConnectionString = builder.Configuration
                    .GetConnectionString("ApplicationInsights");
            });
    })
    // =============================================
    // METRICS
    // =============================================
    .WithMetrics(metrics =>
    {
        metrics
            .SetResourceBuilder(resourceBuilder)
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            // Custom metrics
            .AddMeter("Comillas.MiApp.Business")
            // Exporters
            .AddConsoleExporter()
            .AddAzureMonitorMetricExporter(options =>
            {
                options.ConnectionString = builder.Configuration
                    .GetConnectionString("ApplicationInsights");
            });
    });
```

### 2.3 Custom traces with ActivitySource

```csharp
using System.Diagnostics;

public class BecaService : IBecaService
{
    // Define an activity source per service
    private static readonly ActivitySource ActivitySource =
        new("Comillas.MiApp.BecaService", "1.0.0");

    private readonly IBecaRepository _repository;
    private readonly ILogger<BecaService> _logger;

    public BecaService(IBecaRepository repository, ILogger<BecaService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<BecaDto> CreateAsync(CreateBecaRequest request, CancellationToken ct)
    {
        // Create a custom trace
        using var activity = ActivitySource.StartActivity(
            "BecaService.Create",
            ActivityKind.Internal);

        // Enrich with attributes
        activity?.SetTag("beca.nombre", request.Nombre);
        activity?.SetTag("beca.importe", request.Importe);

        try
        {
            var beca = Beca.Crear(request.Nombre, request.Importe);

            // Sub-activity for persistence
            using var dbActivity = ActivitySource.StartActivity("BecaService.Create.Persist");
            await _repository.AddAsync(beca, ct);

            activity?.SetTag("beca.id", beca.Id);
            activity?.SetStatus(ActivityStatusCode.Ok);

            return beca.ToDto();
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}
```

### 2.4 Custom metrics with Meter

```csharp
using System.Diagnostics.Metrics;

public class BecaMetrics
{
    // One Meter per business module
    private static readonly Meter Meter = new("Comillas.MiApp.Business", "1.0.0");

    // Counters
    private static readonly Counter<long> BecasCreadas =
        Meter.CreateCounter<long>(
            "comillas.becas.creadas",
            unit: "{beca}",
            description: "Total number of grants created");

    private static readonly Counter<long> SolicitudesRecibidas =
        Meter.CreateCounter<long>(
            "comillas.solicitudes.recibidas",
            unit: "{solicitud}",
            description: "Grant applications received");

    // Histograms
    private static readonly Histogram<double> TiempoProcesamiento =
        Meter.CreateHistogram<double>(
            "comillas.becas.procesamiento.duracion",
            unit: "ms",
            description: "Grant processing duration");

    // Gauge (point-in-time value)
    private static readonly ObservableGauge<int> BecasActivas =
        Meter.CreateObservableGauge(
            "comillas.becas.activas",
            () => ObtenerBecasActivas(),
            unit: "{beca}",
            description: "Number of currently active grants");

    // Public methods to record metrics
    public static void RegistrarBecaCreada(string tipo)
    {
        BecasCreadas.Add(1, new KeyValuePair<string, object?>("tipo", tipo));
    }

    public static void RegistrarSolicitud(string estado)
    {
        SolicitudesRecibidas.Add(1, new KeyValuePair<string, object?>("estado", estado));
    }

    public static void RegistrarTiempoProcesamiento(double milliseconds)
    {
        TiempoProcesamiento.Record(milliseconds);
    }

    private static int ObtenerBecasActivas() => /* query to DB or cache */ 0;
}
```

### 2.5 Exporters

| Exporter | Environment | Usage |
|----------|-------------|-------|
| **Console** | Development | Quick visualization in terminal |
| **Application Insights** | Production | Comillas main platform (Azure Monitor) |
| **OTLP** | Both | Standard protocol, compatible with Jaeger, Grafana, etc. |

---

## 3. Serilog

### 3.1 Why Serilog

Serilog is the standard for structured logging in .NET. Unlike basic `ILogger`, Serilog captures properties as structured data instead of plain text, enabling advanced searches and filtering.

| Feature | Serilog | Basic ILogger |
|---------|---------|---------------|
| Structured logging | Native | Limited |
| Sinks (destinations) | 100+ | Basic |
| Enrichers (context) | Rich | Manual |
| Advanced filtering | Yes | Limited |
| Request logging | Own middleware | Manual |

### 3.2 Bootstrap Logger pattern

```csharp
// Program.cs - Recommended pattern with bootstrap logger
using Serilog;

// Bootstrap logger: captures errors BEFORE the app is configured
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting application {ApplicationName}", "Comillas.MiApp");

    var builder = WebApplication.CreateBuilder(args);

    // Full configuration from appsettings.json
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services));

    // ... configure services ...

    var app = builder.Build();

    // Request logging middleware
    app.UseSerilogRequestLogging(options =>
    {
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
            diagnosticContext.Set("UserId", httpContext.User?.Identity?.Name ?? "anonymous");
        };
        // Don't log health checks
        options.GetLevel = (httpContext, elapsed, ex) =>
            httpContext.Request.Path.StartsWithSegments("/health")
                ? Serilog.Events.LogEventLevel.Verbose
                : Serilog.Events.LogEventLevel.Information;
    });

    // ... pipeline ...

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
    throw;
}
finally
{
    await Log.CloseAndFlushAsync();
}
```

### 3.3 Configuration in appsettings.json

```json
{
  "Serilog": {
    "Using": [
      "Serilog.Sinks.Console",
      "Serilog.Sinks.File",
      "Serilog.Sinks.ApplicationInsights"
    ],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft.AspNetCore": "Warning",
        "Microsoft.EntityFrameworkCore": "Warning",
        "Microsoft.EntityFrameworkCore.Database.Command": "Warning",
        "System.Net.Http.HttpClient": "Warning",
        "Microsoft.Hosting.Lifetime": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext}{NewLine}  {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/app-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "fileSizeLimitBytes": 52428800,
          "outputTemplate": "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] ({SourceContext}) {Message:lj}{NewLine}{Exception}"
        }
      },
      {
        "Name": "ApplicationInsights",
        "Args": {
          "connectionString": "[From Key Vault in production]",
          "telemetryConverter": "Serilog.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights"
        }
      }
    ],
    "Enrich": [
      "FromLogContext",
      "WithMachineName",
      "WithEnvironmentName",
      "WithThreadId",
      "WithCorrelationId"
    ],
    "Properties": {
      "Application": "Comillas.MiApp",
      "Environment": "Development"
    }
  }
}
```

### 3.4 Structured logging: best practices

```csharp
// =============================================
// CORRECT - Structured logging
// =============================================

// Use placeholders with descriptive names (NO interpolation)
_logger.LogInformation("Grant {BecaId} created by {Usuario} with amount {Importe}",
    beca.Id, usuario, beca.Importe);

// Context with PushProperty for multiple logs
using (LogContext.PushProperty("BecaId", becaId))
using (LogContext.PushProperty("OperacionId", operacionId))
{
    _logger.LogInformation("Starting grant processing");
    // ... operation ...
    _logger.LogInformation("Processing completed in {ElapsedMs}ms", elapsed);
}

// =============================================
// INCORRECT - Avoid
// =============================================

// String interpolation (loses structure)
_logger.LogInformation($"Grant {beca.Id} created");  // NO

// Concatenation
_logger.LogInformation("Grant " + beca.Id + " created");  // NO

// Without context
_logger.LogError("Error processing");  // NO - lacks context
```

---

## 4. Application Insights

### 4.1 Connection string (from Key Vault)

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    // Connection string comes from Key Vault in production
    options.ConnectionString = builder.Configuration
        .GetConnectionString("ApplicationInsights");
});

// appsettings.json (development)
{
  "ConnectionStrings": {
    "ApplicationInsights": "InstrumentationKey=xxx;IngestionEndpoint=https://..."
  }
}
```

### 4.2 TelemetryClient for custom events

```csharp
public class BecaService : IBecaService
{
    private readonly TelemetryClient _telemetry;

    public BecaService(TelemetryClient telemetry)
    {
        _telemetry = telemetry;
    }

    public async Task<BecaDto> CreateAsync(CreateBecaRequest request, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var beca = Beca.Crear(request.Nombre, request.Importe);
        await _repository.AddAsync(beca, ct);

        sw.Stop();

        // Custom event
        _telemetry.TrackEvent("BecaCreada", new Dictionary<string, string>
        {
            ["BecaId"] = beca.Id.ToString(),
            ["Tipo"] = request.Tipo ?? "general",
            ["CreadoPor"] = _currentUser.UserId ?? "system"
        }, new Dictionary<string, double>
        {
            ["Importe"] = (double)beca.Importe,
            ["DuracionMs"] = sw.ElapsedMilliseconds
        });

        return beca.ToDto();
    }

    public async Task ProcesarLoteAsync(IEnumerable<int> becaIds, CancellationToken ct)
    {
        // Custom metric
        _telemetry.TrackMetric("BecasProcesadasPorLote", becaIds.Count());

        // Operation with dependency
        using var operation = _telemetry.StartOperation<DependencyTelemetry>("ProcesarLoteBecas");
        operation.Telemetry.Type = "InternalBatch";

        try
        {
            foreach (var id in becaIds)
            {
                await ProcesarBecaAsync(id, ct);
            }

            operation.Telemetry.Success = true;
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

### 4.3 Distributed tracing and correlation

Application Insights automatically correlates all operations using `TraceId` and `SpanId` when using OpenTelemetry. This enables:

- **End-to-end transaction search**: Follow an HTTP request from browser to database
- **Application Map**: Visualize dependencies between services
- **Live Metrics Stream**: Real-time metrics (requests/s, CPU, exceptions)
- **Failure analysis**: Group errors by root cause

---

## 5. Business Metrics

### 5.1 Example metrics by domain

| Metric | Type | Example value | Suggested alert |
|--------|------|--------------|-----------------|
| Requests per second | Counter | 150 req/s | > 500 req/s (capacity) |
| Grant applications per hour | Counter | 25/hour | < 1/hour during open period |
| Error rate (5xx) | Ratio | 0.1% | > 1% |
| Response time P95 | Histogram | 250ms | > 1000ms |
| Active grants | Gauge | 45 | < 1 (anomaly) |
| Approval rate | Ratio | 72% | < 50% (review criteria) |

### 5.2 Recommended dashboards

Configuring dashboards in Azure Monitor / Application Insights with the following sections is recommended:

1. **Overview** - Requests/s, errors, P50/P95/P99 latency
2. **Dependencies** - SQL, external HTTP, Redis (latency and errors)
3. **Business** - Domain metrics (applications, approvals, amounts)
4. **Infrastructure** - CPU, memory, GC, active threads

---

## 6. GDPR and Sensitive Data

### 6.1 Data that should NEVER be logged

| Data | Reason | Alternative |
|------|--------|-------------|
| **Passwords** | Credentials | Never log under any circumstances |
| **JWT Tokens / API Keys** | Session credentials | Log only last 4 characters |
| **DNI / NIE** | Personal identifying data | Mask: `***4567X` |
| **Full email** | Personal data | Mask: `j***@comillas.edu` |
| **Card numbers** | Financial data (PCI-DSS) | Never log under any circumstances |
| **Medical data** | GDPR special category | Never log under any circumstances |
| **IP addresses** | Personal data (anonymize) | Truncate last octet: `192.168.1.xxx` |
| **Bank account numbers** | Financial data | Mask: `ES** **** **** **** **89` |

### 6.2 Filtering sensitive data in Serilog

```csharp
// Destructuring policy to mask data
public class SensitiveDataDestructuringPolicy : IDestructuringPolicy
{
    public bool TryDestructure(
        object value, ILogEventPropertyValueFactory factory,
        out LogEventPropertyValue? result)
    {
        if (value is CreateBecaRequest request)
        {
            result = factory.CreatePropertyValue(new
            {
                request.Nombre,
                request.Importe,
                Email = MaskEmail(request.Email),
                // Exclude sensitive fields
            }, destructureObjects: true);
            return true;
        }

        result = null;
        return false;
    }

    private static string MaskEmail(string? email)
    {
        if (string.IsNullOrEmpty(email)) return "***";
        var parts = email.Split('@');
        if (parts.Length != 2) return "***";
        return $"{parts[0][0]}***@{parts[1]}";
    }
}

// Register in Serilog
Log.Logger = new LoggerConfiguration()
    .Destructure.With<SensitiveDataDestructuringPolicy>()
    // ...
    .CreateLogger();
```

### 6.3 Log retention policies

| Log type | Retention | Storage |
|----------|-----------|---------|
| Application logs (info/debug) | 30 days | Application Insights |
| Error logs | 90 days | Application Insights |
| Audit logs (data access) | 2 years | SQL Server / Blob Storage |
| Security logs (auth) | 2 years | SQL Server / Blob Storage |
| Metrics | 90 days | Application Insights |

---

## 7. Observability Checklist

### Before going to production

- [ ] OpenTelemetry configured with traces, metrics and logs
- [ ] Serilog configured with Console + File (development) and Application Insights (production)
- [ ] Structured logging throughout the code (no string interpolation in logs)
- [ ] Sensitive data excluded from logs (GDPR)
- [ ] Application Insights connected with connection string from Key Vault
- [ ] Business metrics defined and instrumented
- [ ] TraceId/SpanId correlated between services
- [ ] Log levels configured by namespace (Microsoft=Warning, App=Information)
- [ ] Health checks with metrics (`/health`, `/health/ready`, `/health/live`)
- [ ] Serilog request logging middleware enabled
- [ ] Alerts configured for critical errors and performance degradation
- [ ] Dashboards created with key business and infrastructure metrics
- [ ] Log retention configured according to GDPR policy

---

## 8. NuGet Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `OpenTelemetry` | 1.* | OpenTelemetry core |
| `OpenTelemetry.Extensions.Hosting` | 1.* | .NET Host integration |
| `OpenTelemetry.Instrumentation.AspNetCore` | 1.* | ASP.NET Core auto-instrumentation |
| `OpenTelemetry.Instrumentation.Http` | 1.* | HttpClient auto-instrumentation |
| `OpenTelemetry.Instrumentation.SqlClient` | 1.* | SQL Client auto-instrumentation |
| `OpenTelemetry.Instrumentation.EntityFrameworkCore` | 1.* | EF Core auto-instrumentation |
| `OpenTelemetry.Instrumentation.Runtime` | 1.* | Runtime metrics (.NET GC, threads) |
| `OpenTelemetry.Exporter.Console` | 1.* | Development exporter |
| `Azure.Monitor.OpenTelemetry.Exporter` | 1.* | Application Insights exporter |
| `Serilog.AspNetCore` | 9.* | Serilog integration with ASP.NET Core |
| `Serilog.Sinks.Console` | 6.* | Console sink |
| `Serilog.Sinks.File` | 6.* | File sink |
| `Serilog.Sinks.ApplicationInsights` | 4.* | Application Insights sink |
| `Serilog.Enrichers.Environment` | 3.* | Environment and machine enricher |
| `Serilog.Enrichers.Thread` | 4.* | Thread enricher |
| `Serilog.Enrichers.CorrelationId` | 3.* | Correlation enricher |
| `Microsoft.ApplicationInsights.AspNetCore` | 2.* | Application Insights SDK |

---

## 9. References

### Related files in template

| File | Content |
|------|---------|
| `.claude/skills/observability-patterns/` | Observability patterns skill |
| `Documentos_Base/01_Estructura_Tecnica/ESTRUCTURA_TECNICA.md` | Section 10 - Application Insights |
| `Documentos_Base/03_Consideraciones_Comunes/CONSIDERACIONES.md` | GDPR and sensitive data |

### External documentation

| Resource | URL |
|---------|-----|
| OpenTelemetry .NET | opentelemetry.io/docs/languages/dotnet |
| Serilog Wiki | github.com/serilog/serilog/wiki |
| Application Insights | learn.microsoft.com/azure/azure-monitor/app/app-insights-overview |
| OpenTelemetry + Azure Monitor | learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable |

---

*Document generated: 2026-02-10*
*Version: 1.0.0*
*STIC - Universidad Pontificia Comillas*
