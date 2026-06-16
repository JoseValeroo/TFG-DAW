# Guia de Observabilidad - Comillas STIC

> **Version**: 1.0.0
> **Fecha**: 2026-02-10
> **Autor**: STIC - Universidad Pontificia Comillas
> **Proposito**: Guia completa de observabilidad para proyectos .NET 10

---

## Indice

1. [Introduccion](#1-introduccion)
2. [OpenTelemetry (.NET 10)](#2-opentelemetry-net-10)
3. [Serilog](#3-serilog)
4. [Application Insights](#4-application-insights)
5. [Metricas de Negocio](#5-metricas-de-negocio)
6. [RGPD y Datos Sensibles](#6-rgpd-y-datos-sensibles)
7. [Checklist de Observabilidad](#7-checklist-de-observabilidad)
8. [Paquetes NuGet](#8-paquetes-nuget)
9. [Referencias](#9-referencias)

---

## 1. Introduccion

### 1.1 Los tres pilares de la observabilidad

La observabilidad permite entender el estado interno de un sistema a partir de sus salidas externas. Se sustenta en tres pilares complementarios:

| Pilar | Descripcion | Herramientas Comillas | Pregunta que responde |
|-------|-------------|----------------------|----------------------|
| **Logs** | Registros textuales de eventos discretos con contexto estructurado | Serilog + Application Insights | "Que ha pasado?" |
| **Metricas** | Valores numericos agregables que representan el estado del sistema en el tiempo | OpenTelemetry Metrics + App Insights | "Cuanto esta pasando?" |
| **Trazas** | Seguimiento de una peticion a traves de multiples servicios y componentes | OpenTelemetry Traces + App Insights | "Donde esta pasando?" |

### 1.2 Por que importa la observabilidad

- **Detectar problemas antes que los usuarios** - Las metricas y alertas permiten identificar degradaciones antes de que se conviertan en incidencias.
- **Entender el comportamiento del sistema** - Las trazas distribuidas muestran el flujo real de las peticiones, incluyendo tiempos y dependencias.
- **Reducir tiempo de resolucion (MTTR)** - Los logs estructurados y correlacionados permiten diagnosticar problemas en minutos en lugar de horas.
- **Tomar decisiones basadas en datos** - Las metricas de negocio proporcionan visibilidad sobre el impacto real de los cambios.

---

## 2. OpenTelemetry (.NET 10)

### 2.1 Que es OpenTelemetry

OpenTelemetry (OTel) es un estandar abierto y vendor-neutral para la generacion, recopilacion y exportacion de datos de telemetria. En .NET 10, la integracion es nativa y recomendada por Microsoft como la forma estandar de instrumentar aplicaciones.

**Ventajas sobre soluciones propietarias:**
- Sin vendor lock-in: mismo codigo, diferentes backends
- Soporte nativo en .NET 10 (System.Diagnostics)
- Comunidad activa y estandar CNCF
- Auto-instrumentacion para librerias comunes

### 2.2 Configuracion en Program.cs

```csharp
// Program.cs - Configuracion completa de OpenTelemetry en .NET 10
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// =============================================
// Recurso compartido (identifica el servicio)
// =============================================
var resourceBuilder = ResourceBuilder.CreateDefault()
    .AddService(
        serviceName: "Comillas.MiApp.Api",
        serviceVersion: "1.0.0",
        serviceInstanceId: Environment.MachineName);

// =============================================
// TRAZAS (Traces)
// =============================================
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing
            .SetResourceBuilder(resourceBuilder)
            // Auto-instrumentacion
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
            // Fuentes personalizadas
            .AddSource("Comillas.MiApp.*")
            // Exporters
            .AddConsoleExporter()                      // Desarrollo
            .AddAzureMonitorTraceExporter(options =>    // Produccion
            {
                options.ConnectionString = builder.Configuration
                    .GetConnectionString("ApplicationInsights");
            });
    })
    // =============================================
    // METRICAS (Metrics)
    // =============================================
    .WithMetrics(metrics =>
    {
        metrics
            .SetResourceBuilder(resourceBuilder)
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            // Metricas personalizadas
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

### 2.3 Trazas personalizadas con ActivitySource

```csharp
using System.Diagnostics;

public class BecaService : IBecaService
{
    // Definir una fuente de actividades por servicio
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
        // Crear una traza personalizada
        using var activity = ActivitySource.StartActivity(
            "BecaService.Create",
            ActivityKind.Internal);

        // Enriquecer con atributos
        activity?.SetTag("beca.nombre", request.Nombre);
        activity?.SetTag("beca.importe", request.Importe);

        try
        {
            var beca = Beca.Crear(request.Nombre, request.Importe);

            // Sub-actividad para persistencia
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

### 2.4 Metricas personalizadas con Meter

```csharp
using System.Diagnostics.Metrics;

public class BecaMetrics
{
    // Un Meter por modulo de negocio
    private static readonly Meter Meter = new("Comillas.MiApp.Business", "1.0.0");

    // Contadores
    private static readonly Counter<long> BecasCreadas =
        Meter.CreateCounter<long>(
            "comillas.becas.creadas",
            unit: "{beca}",
            description: "Numero total de becas creadas");

    private static readonly Counter<long> SolicitudesRecibidas =
        Meter.CreateCounter<long>(
            "comillas.solicitudes.recibidas",
            unit: "{solicitud}",
            description: "Solicitudes de beca recibidas");

    // Histogramas
    private static readonly Histogram<double> TiempoProcesamiento =
        Meter.CreateHistogram<double>(
            "comillas.becas.procesamiento.duracion",
            unit: "ms",
            description: "Duracion del procesamiento de becas");

    // Gauge (valor puntual)
    private static readonly ObservableGauge<int> BecasActivas =
        Meter.CreateObservableGauge(
            "comillas.becas.activas",
            () => ObtenerBecasActivas(),
            unit: "{beca}",
            description: "Numero de becas activas actualmente");

    // Metodos publicos para registrar metricas
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

    private static int ObtenerBecasActivas() => /* consulta a BD o cache */ 0;
}
```

### 2.5 Exporters

| Exporter | Entorno | Uso |
|----------|---------|-----|
| **Console** | Desarrollo | Visualizacion rapida en terminal |
| **Application Insights** | Produccion | Plataforma principal de Comillas (Azure Monitor) |
| **OTLP** | Ambos | Protocolo estandar, compatible con Jaeger, Grafana, etc. |

---

## 3. Serilog

### 3.1 Por que Serilog

Serilog es el estandar de logging estructurado en .NET. A diferencia de `ILogger` basico, Serilog captura propiedades como datos estructurados en lugar de texto plano, lo que permite busquedas y filtrados avanzados.

| Caracteristica | Serilog | ILogger basico |
|----------------|---------|----------------|
| Logging estructurado | Nativo | Limitado |
| Sinks (destinos) | 100+ | Basicos |
| Enrichers (contexto) | Rico | Manual |
| Filtrado avanzado | Si | Limitado |
| Request logging | Middleware propio | Manual |

### 3.2 Bootstrap Logger pattern

```csharp
// Program.cs - Patron recomendado con bootstrap logger
using Serilog;

// Bootstrap logger: captura errores ANTES de que la app este configurada
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Iniciando aplicacion {ApplicationName}", "Comillas.MiApp");

    var builder = WebApplication.CreateBuilder(args);

    // Configuracion completa desde appsettings.json
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services));

    // ... configurar servicios ...

    var app = builder.Build();

    // Middleware de request logging
    app.UseSerilogRequestLogging(options =>
    {
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
            diagnosticContext.Set("UserId", httpContext.User?.Identity?.Name ?? "anonymous");
        };
        // No loguear health checks
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
    Log.Fatal(ex, "La aplicacion termino inesperadamente");
    throw;
}
finally
{
    await Log.CloseAndFlushAsync();
}
```

### 3.3 Configuracion en appsettings.json

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
          "connectionString": "[Desde Key Vault en produccion]",
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

### 3.4 Logging estructurado: buenas practicas

```csharp
// =============================================
// CORRECTO - Logging estructurado
// =============================================

// Usar placeholders con nombres descriptivos (NO interpolacion)
_logger.LogInformation("Beca {BecaId} creada por {Usuario} con importe {Importe}",
    beca.Id, usuario, beca.Importe);

// Contexto con PushProperty para multiples logs
using (LogContext.PushProperty("BecaId", becaId))
using (LogContext.PushProperty("OperacionId", operacionId))
{
    _logger.LogInformation("Iniciando procesamiento de beca");
    // ... operacion ...
    _logger.LogInformation("Procesamiento completado en {ElapsedMs}ms", elapsed);
}

// =============================================
// INCORRECTO - Evitar
// =============================================

// Interpolacion de strings (pierde estructura)
_logger.LogInformation($"Beca {beca.Id} creada");  // NO

// Concatenacion
_logger.LogInformation("Beca " + beca.Id + " creada");  // NO

// Sin contexto
_logger.LogError("Error al procesar");  // NO - falta contexto
```

---

## 4. Application Insights

### 4.1 Connection string (desde Key Vault)

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    // La connection string viene de Key Vault en produccion
    options.ConnectionString = builder.Configuration
        .GetConnectionString("ApplicationInsights");
});

// appsettings.json (desarrollo)
{
  "ConnectionStrings": {
    "ApplicationInsights": "InstrumentationKey=xxx;IngestionEndpoint=https://..."
  }
}
```

### 4.2 TelemetryClient para eventos personalizados

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

        // Evento personalizado
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
        // Metrica personalizada
        _telemetry.TrackMetric("BecasProcesadasPorLote", becaIds.Count());

        // Operacion con dependencia
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

### 4.3 Distributed tracing y correlacion

Application Insights correlaciona automaticamente todas las operaciones usando `TraceId` y `SpanId` cuando se usa OpenTelemetry. Esto permite:

- **End-to-end transaction search**: Seguir una peticion HTTP desde el navegador hasta la base de datos
- **Application Map**: Visualizar dependencias entre servicios
- **Live Metrics Stream**: Metricas en tiempo real (requests/s, CPU, excepciones)
- **Failure analysis**: Agrupar errores por causa raiz

---

## 5. Metricas de Negocio

### 5.1 Ejemplos de metricas por dominio

| Metrica | Tipo | Ejemplo de valor | Alerta sugerida |
|---------|------|-----------------|-----------------|
| Peticiones por segundo | Counter | 150 req/s | > 500 req/s (capacidad) |
| Solicitudes de beca por hora | Counter | 25/hora | < 1/hora en periodo abierto |
| Tasa de errores (5xx) | Ratio | 0.1% | > 1% |
| Tiempo de respuesta P95 | Histogram | 250ms | > 1000ms |
| Becas activas | Gauge | 45 | < 1 (anomalia) |
| Tasa de aprobacion | Ratio | 72% | < 50% (revisar criterios) |

### 5.2 Dashboards recomendados

Se recomienda configurar dashboards en Azure Monitor / Application Insights con las siguientes secciones:

1. **Overview** - Requests/s, errores, latencia P50/P95/P99
2. **Dependencias** - SQL, HTTP externo, Redis (latencia y errores)
3. **Negocio** - Metricas de dominio (solicitudes, aprobaciones, importes)
4. **Infraestructura** - CPU, memoria, GC, hilos activos

---

## 6. RGPD y Datos Sensibles

### 6.1 Datos que NUNCA se deben loguear

| Dato | Motivo | Alternativa |
|------|--------|-------------|
| **Contrasenas** | Credenciales | No loguear bajo ningun concepto |
| **Tokens JWT / API Keys** | Credenciales de sesion | Loguear solo los ultimos 4 caracteres |
| **DNI / NIE** | Dato personal identificativo | Enmascarar: `***4567X` |
| **Email completo** | Dato personal | Enmascarar: `j***@comillas.edu` |
| **Numeros de tarjeta** | Dato financiero (PCI-DSS) | No loguear bajo ningun concepto |
| **Datos medicos** | Categoria especial RGPD | No loguear bajo ningun concepto |
| **Direcciones IP** | Dato personal (anonimizar) | Truncar ultimo octeto: `192.168.1.xxx` |
| **Numeros de cuenta bancaria** | Dato financiero | Enmascarar: `ES** **** **** **** **89` |

### 6.2 Filtrado de datos sensibles en Serilog

```csharp
// Destructuring policy para enmascarar datos
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
                // Excluir campos sensibles
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

// Registrar en Serilog
Log.Logger = new LoggerConfiguration()
    .Destructure.With<SensitiveDataDestructuringPolicy>()
    // ...
    .CreateLogger();
```

### 6.3 Politicas de retencion de logs

| Tipo de log | Retencion | Almacenamiento |
|-------------|-----------|----------------|
| Logs de aplicacion (info/debug) | 30 dias | Application Insights |
| Logs de errores | 90 dias | Application Insights |
| Logs de auditoria (acceso datos) | 2 anos | SQL Server / Blob Storage |
| Logs de seguridad (auth) | 2 anos | SQL Server / Blob Storage |
| Metricas | 90 dias | Application Insights |

---

## 7. Checklist de Observabilidad

### Antes de ir a produccion

- [ ] OpenTelemetry configurado con traces, metrics y logs
- [ ] Serilog configurado con Console + File (desarrollo) y Application Insights (produccion)
- [ ] Logging estructurado en todo el codigo (sin string interpolation en logs)
- [ ] Datos sensibles excluidos de los logs (RGPD)
- [ ] Application Insights conectado con connection string desde Key Vault
- [ ] Metricas de negocio definidas e instrumentadas
- [ ] TraceId/SpanId correlacionados entre servicios
- [ ] Log levels configurados por namespace (Microsoft=Warning, App=Information)
- [ ] Health checks con metricas (`/health`, `/health/ready`, `/health/live`)
- [ ] Request logging middleware de Serilog habilitado
- [ ] Alertas configuradas para errores criticos y degradacion de rendimiento
- [ ] Dashboards creados con metricas clave de negocio e infraestructura
- [ ] Retencion de logs configurada segun politica RGPD

---

## 8. Paquetes NuGet

| Paquete | Version | Proposito |
|---------|---------|-----------|
| `OpenTelemetry` | 1.* | Core de OpenTelemetry |
| `OpenTelemetry.Extensions.Hosting` | 1.* | Integracion con Host de .NET |
| `OpenTelemetry.Instrumentation.AspNetCore` | 1.* | Auto-instrumentacion ASP.NET Core |
| `OpenTelemetry.Instrumentation.Http` | 1.* | Auto-instrumentacion HttpClient |
| `OpenTelemetry.Instrumentation.SqlClient` | 1.* | Auto-instrumentacion SQL Client |
| `OpenTelemetry.Instrumentation.EntityFrameworkCore` | 1.* | Auto-instrumentacion EF Core |
| `OpenTelemetry.Instrumentation.Runtime` | 1.* | Metricas de runtime (.NET GC, threads) |
| `OpenTelemetry.Exporter.Console` | 1.* | Exporter para desarrollo |
| `Azure.Monitor.OpenTelemetry.Exporter` | 1.* | Exporter para Application Insights |
| `Serilog.AspNetCore` | 9.* | Integracion Serilog con ASP.NET Core |
| `Serilog.Sinks.Console` | 6.* | Sink de consola |
| `Serilog.Sinks.File` | 6.* | Sink de archivos |
| `Serilog.Sinks.ApplicationInsights` | 4.* | Sink de Application Insights |
| `Serilog.Enrichers.Environment` | 3.* | Enricher de entorno y maquina |
| `Serilog.Enrichers.Thread` | 4.* | Enricher de thread |
| `Serilog.Enrichers.CorrelationId` | 3.* | Enricher de correlacion |
| `Microsoft.ApplicationInsights.AspNetCore` | 2.* | Application Insights SDK |

---

## 9. Referencias

### Archivos relacionados en la plantilla

| Archivo | Contenido |
|---------|-----------|
| `.claude/skills/observability-patterns/` | Skill de patrones de observabilidad |
| `Documentos_Base/01_Estructura_Tecnica/ESTRUCTURA_TECNICA.md` | Seccion 10 - Application Insights |
| `Documentos_Base/03_Consideraciones_Comunes/CONSIDERACIONES.md` | RGPD y datos sensibles |

### Documentacion externa

| Recurso | URL |
|---------|-----|
| OpenTelemetry .NET | opentelemetry.io/docs/languages/dotnet |
| Serilog Wiki | github.com/serilog/serilog/wiki |
| Application Insights | learn.microsoft.com/azure/azure-monitor/app/app-insights-overview |
| OpenTelemetry + Azure Monitor | learn.microsoft.com/azure/azure-monitor/app/opentelemetry-enable |

---

*Documento generado: 2026-02-10*
*Version: 1.0.0*
*STIC - Universidad Pontificia Comillas*
