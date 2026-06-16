# Guia de Arquitectura y Patrones - STIC Comillas

> **Version**: 1.0.0
> **Fecha**: 2026-02-02
> **Autor**: STIC - Universidad Pontificia Comillas
> **Proposito**: Guia completa para seleccion de arquitectura en proyectos .NET

---

## Indice

1. [Introduccion](#1-introduccion)
2. [Perfiles de Arquitectura](#2-perfiles-de-arquitectura)
3. [Perfil BASICO - Services + Repository](#3-perfil-basico)
4. [Perfil ESTANDAR - Clean Architecture + Mediator](#4-perfil-estandar)
5. [Perfil AVANZADO - CQRS + Mediator](#5-perfil-avanzado)
6. [Comparativa de Patrones](#6-comparativa-de-patrones)
7. [Mediator vs MediatR - Decision Tecnica](#7-mediator-vs-mediatr)
8. [Guia de Seleccion](#8-guia-de-seleccion)
9. [Implementacion por Perfil](#9-implementacion-por-perfil)
10. [Migracion entre Perfiles](#10-migracion-entre-perfiles)
11. [Referencias](#11-referencias)

---

## 1. Introduccion

### 1.1 Proposito de este documento

Este documento proporciona una guia completa para seleccionar la arquitectura adecuada en proyectos .NET de Comillas. Define tres perfiles de arquitectura predefinidos que cubren el 95% de los casos de uso.

### 1.2 Principios de diseno STIC

| Principio | Descripcion |
|-----------|-------------|
| **Simplicidad** | No sobredisenar. Elegir la complejidad minima necesaria |
| **Mantenibilidad** | Codigo que otros puedan entender y modificar |
| **Testabilidad** | Facilitar pruebas unitarias e integracion |
| **Escalabilidad** | Permitir crecimiento sin reescribir |

### 1.3 Realidad de proyectos Comillas

```
Distribucion tipica de proyectos:

70% ─────────────────────────────── CRUD + logica basica
     Gestores, portales internos, ABMs

20% ───────── Logica moderada
     Integraciones, workflows, validaciones complejas

10% ── Dominios complejos
     Sistemas criticos, alta escala, event sourcing
```

---

## 2. Perfiles de Arquitectura

### 2.1 Resumen de perfiles

| Perfil | Patron | Complejidad | Archivos/Entidad | Ideal para |
|--------|--------|-------------|------------------|------------|
| **BASICO** | Services + Repository | ⭐ | 4-6 | CRUD, MVPs, prototipos |
| **ESTANDAR** | Clean + Mediator | ⭐⭐ | 8-12 | APIs REST, apps negocio |
| **AVANZADO** | CQRS + Mediator | ⭐⭐⭐ | 15-20 | Dominios complejos |

### 2.2 Diagrama de decision

```
                    ¿Que tipo de proyecto es?
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         CRUD >80%       CRUD 50-80%      CRUD <50%
         Logica simple   Logica moderada  Logica compleja
              │               │               │
              ▼               ▼               ▼
         ┌────────┐     ┌──────────┐    ┌──────────┐
         │ BASICO │     │ ESTANDAR │    │ AVANZADO │
         └────────┘     └──────────┘    └──────────┘
```

---

## 3. Perfil BASICO

### 3.1 Descripcion

El perfil BASICO implementa una arquitectura de 2-3 capas con inyeccion directa de servicios. No utiliza el patron Mediator.

### 3.2 Diagrama de arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                      PERFIL BASICO                           │
│                  Services + Repository                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │ Controller  │                                           │
│   │             │                                           │
│   └──────┬──────┘                                           │
│          │ Inyeccion directa                                │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │   Service   │  ◄── Logica de negocio                   │
│   │             │      Validaciones                         │
│   └──────┬──────┘      Mapeo DTO                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │ Repository  │  ◄── Acceso a datos                      │
│   │             │      EF Core DbContext                    │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │  Database   │                                           │
│   └─────────────┘                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Estructura de proyectos

```
Comillas.MiApp/
├── Comillas.MiApp.sln
│
├── src/
│   ├── Comillas.MiApp.Api/           # Controllers + Startup
│   │   ├── Controllers/
│   │   │   └── BecasController.cs
│   │   ├── appsettings.json
│   │   └── Program.cs
│   │
│   └── Comillas.MiApp.Core/          # Todo lo demas
│       ├── Entities/
│       │   └── Beca.cs
│       ├── DTOs/
│       │   ├── BecaDto.cs
│       │   └── CreateBecaRequest.cs
│       ├── Services/
│       │   ├── IBecaService.cs
│       │   └── BecaService.cs
│       ├── Repositories/
│       │   ├── IBecaRepository.cs
│       │   └── BecaRepository.cs
│       ├── Data/
│       │   └── ApplicationDbContext.cs
│       └── DependencyInjection.cs
│
└── tests/
    └── Comillas.MiApp.Tests/
        └── Services/
            └── BecaServiceTests.cs
```

### 3.4 Codigo ejemplo

```csharp
// ═══════════════════════════════════════════════════════════════
// CONTROLLER - Inyeccion directa del servicio
// ═══════════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
public class BecasController : ControllerBase
{
    private readonly IBecaService _becaService;

    public BecasController(IBecaService becaService)
    {
        _becaService = becaService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BecaDto>> Get(int id, CancellationToken ct)
    {
        var beca = await _becaService.GetByIdAsync(id, ct);
        if (beca is null) return NotFound();
        return Ok(beca);
    }

    [HttpPost]
    public async Task<ActionResult<BecaDto>> Create(
        CreateBecaRequest request, CancellationToken ct)
    {
        var beca = await _becaService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = beca.Id }, beca);
    }
}

// ═══════════════════════════════════════════════════════════════
// SERVICE - Contiene logica de negocio
// ═══════════════════════════════════════════════════════════════

public interface IBecaService
{
    Task<BecaDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<BecaDto>> GetAllAsync(CancellationToken ct = default);
    Task<BecaDto> CreateAsync(CreateBecaRequest request, CancellationToken ct = default);
    Task UpdateAsync(int id, UpdateBecaRequest request, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public class BecaService : IBecaService
{
    private readonly IBecaRepository _repository;
    private readonly ILogger<BecaService> _logger;

    public BecaService(IBecaRepository repository, ILogger<BecaService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<BecaDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var beca = await _repository.GetByIdAsync(id, ct);
        return beca?.ToDto();
    }

    public async Task<BecaDto> CreateAsync(
        CreateBecaRequest request, CancellationToken ct = default)
    {
        // Validacion de negocio
        if (request.Importe <= 0)
            throw new ValidationException("El importe debe ser positivo");

        var beca = new Beca
        {
            Nombre = request.Nombre,
            Importe = request.Importe,
            FechaCreacion = DateTime.UtcNow
        };

        await _repository.AddAsync(beca, ct);

        _logger.LogInformation("Beca {BecaId} creada", beca.Id);

        return beca.ToDto();
    }
}

// ═══════════════════════════════════════════════════════════════
// REPOSITORY - Acceso a datos
// ═══════════════════════════════════════════════════════════════

public interface IBecaRepository
{
    Task<Beca?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<Beca>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Beca beca, CancellationToken ct = default);
    Task UpdateAsync(Beca beca, CancellationToken ct = default);
    Task DeleteAsync(Beca beca, CancellationToken ct = default);
}

public class BecaRepository : IBecaRepository
{
    private readonly ApplicationDbContext _context;

    public BecaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Beca?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _context.Becas.FindAsync(new object[] { id }, ct);
    }

    public async Task AddAsync(Beca beca, CancellationToken ct = default)
    {
        await _context.Becas.AddAsync(beca, ct);
        await _context.SaveChangesAsync(ct);
    }
}
```

### 3.5 Cuando usar BASICO

**Usar cuando:**
- Operaciones CRUD representan >80% del sistema
- Proyecto de duracion corta (<6 meses)
- Equipo pequeno (1-2 personas) o junior
- Prototipo o MVP que puede evolucionar
- No hay requisitos de alta escalabilidad

**NO usar cuando:**
- Logica de negocio compleja con muchas reglas
- Necesitas cross-cutting concerns (logging, validacion, caching) centralizados
- El proyecto crecera significativamente
- Testing extensivo es requerido

### 3.6 Ventajas y desventajas

| Ventajas | Desventajas |
|----------|-------------|
| Simplicidad maxima | Controllers acoplados a servicios |
| Curva de aprendizaje minima | Sin pipeline behaviors |
| F12 funciona directamente | Cross-cutting concerns manuales |
| Menos archivos que mantener | Dificil evolucionar a CQRS |
| Ideal para equipos junior | Testing mas acoplado |

---

## 4. Perfil ESTANDAR

### 4.1 Descripcion

El perfil ESTANDAR implementa Clean Architecture con el patron Mediator para desacoplar controladores de handlers. Incluye pipeline behaviors para logging, validacion y otras preocupaciones transversales.

### 4.2 Diagrama de arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                     PERFIL ESTANDAR                          │
│              Clean Architecture + Mediator                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │ Controller  │                                           │
│   └──────┬──────┘                                           │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐     ┌─────────────────────────────────┐  │
│   │  Mediator   │────►│         APPLICATION             │  │
│   └─────────────┘     │                                 │  │
│                       │  ┌──────────┐   ┌───────────┐   │  │
│                       │  │ Request  │──►│  Handler  │   │  │
│                       │  └──────────┘   └─────┬─────┘   │  │
│                       │                       │         │  │
│                       │  Pipeline Behaviors:  │         │  │
│                       │  ├─ Validation        │         │  │
│                       │  ├─ Logging           │         │  │
│                       │  └─ Performance       │         │  │
│                       └───────────────────────┼─────────┘  │
│                                               │             │
│                                      ┌────────▼────────┐   │
│                                      │     DOMAIN      │   │
│                                      │   (Entities)    │   │
│                                      └────────┬────────┘   │
│                                               │             │
│                                      ┌────────▼────────┐   │
│                                      │ INFRASTRUCTURE  │   │
│                                      │  (Repository)   │   │
│                                      └─────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Estructura de proyectos

```
Comillas.MiApp/
├── Comillas.MiApp.sln
│
├── src/
│   ├── Comillas.MiApp.Api/
│   │   ├── Controllers/
│   │   │   └── BecasController.cs
│   │   └── Program.cs
│   │
│   ├── Comillas.MiApp.Application/
│   │   ├── Common/
│   │   │   ├── Behaviours/
│   │   │   │   ├── ValidationBehaviour.cs
│   │   │   │   └── LoggingBehaviour.cs
│   │   │   └── Interfaces/
│   │   │       └── IUnitOfWork.cs
│   │   ├── Becas/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateBeca/
│   │   │   │   │   ├── CreateBecaCommand.cs
│   │   │   │   │   ├── CreateBecaCommandHandler.cs
│   │   │   │   │   └── CreateBecaCommandValidator.cs
│   │   │   │   └── UpdateBeca/
│   │   │   │       └── ...
│   │   │   ├── Queries/
│   │   │   │   ├── GetBecaById/
│   │   │   │   │   ├── GetBecaByIdQuery.cs
│   │   │   │   │   ├── GetBecaByIdQueryHandler.cs
│   │   │   │   │   └── BecaDto.cs
│   │   │   │   └── GetAllBecas/
│   │   │   │       └── ...
│   │   │   └── EventHandlers/
│   │   │       └── BecaCreadaEventHandler.cs
│   │   └── DependencyInjection.cs
│   │
│   ├── Comillas.MiApp.Domain/
│   │   ├── Entities/
│   │   │   └── Beca.cs
│   │   ├── Events/
│   │   │   └── BecaCreadaEvent.cs
│   │   └── Interfaces/
│   │       └── IBecaRepository.cs
│   │
│   └── Comillas.MiApp.Infrastructure/
│       ├── Data/
│       │   └── ApplicationDbContext.cs
│       ├── Repositories/
│       │   └── BecaRepository.cs
│       └── DependencyInjection.cs
│
└── tests/
    ├── Comillas.MiApp.Application.Tests/
    └── Comillas.MiApp.Integration.Tests/
```

### 4.4 Codigo ejemplo

```csharp
// ═══════════════════════════════════════════════════════════════
// CONTROLLER - Usa Mediator
// ═══════════════════════════════════════════════════════════════

[ApiController]
[Route("api/[controller]")]
public class BecasController : ControllerBase
{
    private readonly IMediator _mediator;

    public BecasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BecaDto>> Get(int id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetBecaByIdQuery(id), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(
        CreateBecaCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }
}

// ═══════════════════════════════════════════════════════════════
// QUERY - Lectura
// ═══════════════════════════════════════════════════════════════

// Request
public record GetBecaByIdQuery(int Id) : IRequest<BecaDto?>;

// Handler
public class GetBecaByIdQueryHandler : IRequestHandler<GetBecaByIdQuery, BecaDto?>
{
    private readonly IBecaRepository _repository;

    public GetBecaByIdQueryHandler(IBecaRepository repository)
    {
        _repository = repository;
    }

    public async ValueTask<BecaDto?> Handle(
        GetBecaByIdQuery request, CancellationToken ct)
    {
        var beca = await _repository.GetByIdAsync(request.Id, ct);
        return beca?.ToDto();
    }
}

// DTO
public record BecaDto
{
    public int Id { get; init; }
    public string Nombre { get; init; } = string.Empty;
    public decimal Importe { get; init; }
    public DateTime FechaCreacion { get; init; }
}

// ═══════════════════════════════════════════════════════════════
// COMMAND - Escritura
// ═══════════════════════════════════════════════════════════════

// Command
public record CreateBecaCommand : IRequest<int>
{
    public required string Nombre { get; init; }
    public decimal Importe { get; init; }
}

// Handler
public class CreateBecaCommandHandler : IRequestHandler<CreateBecaCommand, int>
{
    private readonly IBecaRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateBecaCommandHandler(
        IBecaRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async ValueTask<int> Handle(
        CreateBecaCommand request, CancellationToken ct)
    {
        var beca = new Beca
        {
            Nombre = request.Nombre,
            Importe = request.Importe,
            FechaCreacion = DateTime.UtcNow
        };

        await _repository.AddAsync(beca, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return beca.Id;
    }
}

// Validator (FluentValidation)
public class CreateBecaCommandValidator : AbstractValidator<CreateBecaCommand>
{
    public CreateBecaCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es obligatorio")
            .MaximumLength(200).WithMessage("Maximo 200 caracteres");

        RuleFor(x => x.Importe)
            .GreaterThan(0).WithMessage("El importe debe ser positivo");
    }
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE BEHAVIOR - Validacion automatica
// ═══════════════════════════════════════════════════════════════

public class ValidationBehaviour<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehaviour(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async ValueTask<TResponse> Handle(
        TRequest request,
        CancellationToken ct,
        MessageHandlerDelegate<TRequest, TResponse> next)
    {
        if (!_validators.Any())
            return await next(request, ct);

        var context = new ValidationContext<TRequest>(request);
        var failures = _validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next(request, ct);
    }
}
```

### 4.5 Configuracion de Mediator (martinothamar/Mediator)

```csharp
// Program.cs
builder.Services.AddMediator(options =>
{
    options.ServiceLifetime = ServiceLifetime.Scoped;
});

// Con behaviors
builder.Services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
builder.Services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateBecaCommandValidator>();
```

### 4.6 Cuando usar ESTANDAR

**Usar cuando:**
- Proyecto de tamano medio (6-18 meses)
- Lógica de negocio moderada
- Necesitas cross-cutting concerns centralizados
- Testing es importante
- Equipo mixto (junior + senior)
- API REST tipica con validaciones

**NO usar cuando:**
- CRUD muy simple (>80%)
- Dominio muy complejo que requiere CQRS real
- Time-to-market critico sin margen

### 4.7 Ventajas y desventajas

| Ventajas | Desventajas |
|----------|-------------|
| Desacoplamiento limpio | Mas archivos que BASICO |
| Pipeline behaviors | F12 no llega directo al handler |
| Testing facilitado | Curva de aprendizaje media |
| Facilmente testeable | Puede parecer overengineering |
| Escalable a CQRS | para CRUD simple |

---

## 5. Perfil AVANZADO

### 5.1 Descripcion

El perfil AVANZADO implementa CQRS (Command Query Responsibility Segregation) completo, separando los modelos de lectura y escritura. Permite optimizar cada lado independientemente.

### 5.2 Diagrama de arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                      PERFIL AVANZADO                         │
│                 CQRS + Mediator + Events                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Controller                                                 │
│       │                                                      │
│       ▼                                                      │
│   ┌─────────┐                                               │
│   │ Mediator │                                               │
│   └────┬────┘                                               │
│        │                                                     │
│   ┌────┴────────────────────────────────────┐               │
│   │                                          │               │
│   ▼                                          ▼               │
│ ┌──────────────┐                    ┌──────────────┐        │
│ │   COMMANDS   │                    │   QUERIES    │        │
│ │   (Write)    │                    │   (Read)     │        │
│ │              │                    │              │        │
│ │ - Create     │                    │ - GetById    │        │
│ │ - Update     │                    │ - GetAll     │        │
│ │ - Delete     │                    │ - Search     │        │
│ └──────┬───────┘                    └──────┬───────┘        │
│        │                                   │                 │
│        ▼                                   ▼                 │
│ ┌──────────────┐                    ┌──────────────┐        │
│ │   Command    │                    │    Query     │        │
│ │   Handler    │                    │   Handler    │        │
│ └──────┬───────┘                    └──────┬───────┘        │
│        │                                   │                 │
│        ▼                                   ▼                 │
│ ┌──────────────┐                    ┌──────────────┐        │
│ │    DOMAIN    │                    │  READ MODEL  │        │
│ │ (Aggregates) │                    │   (DTOs)     │        │
│ │              │                    │              │        │
│ │ - Entities   │                    │ - Optimized  │        │
│ │ - ValueObj   │                    │ - Denormal.  │        │
│ │ - Rules      │                    │              │        │
│ └──────┬───────┘                    └──────┬───────┘        │
│        │                                   │                 │
│        │     Domain Events                 │                 │
│        │         │                         │                 │
│        ▼         ▼                         ▼                 │
│ ┌──────────────────────────────────────────────────┐        │
│ │              INFRASTRUCTURE                       │        │
│ │                                                   │        │
│ │  Write Repository    │    Read Repository         │        │
│ │  (EF Core)           │    (Dapper/EF)             │        │
│ └──────────────────────┴────────────────────────────┘        │
│        │                         │                           │
│        ▼                         ▼                           │
│   Write Store              Read Store                       │
│  (Normalizado)           (Denormalizado)                    │
│                                                              │
│        └──────── Sync/Events ────────┘                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Niveles de implementacion CQRS

| Nivel | Descripcion | Complejidad | Cuando usar |
|-------|-------------|-------------|-------------|
| **1** | Misma BD, diferentes modelos | Baja | Empezar aqui |
| **2** | Misma BD, vistas materializadas | Media | Optimizar lecturas |
| **3** | BDs separadas (sync eventual) | Alta | Alta escala |
| **4** | Event Sourcing | Muy alta | Auditoria completa |

### 5.4 Estructura de proyectos

```
Comillas.MiApp/
├── Comillas.MiApp.sln
│
├── src/
│   ├── Comillas.MiApp.Api/
│   │   └── Controllers/
│   │
│   ├── Comillas.MiApp.Application/
│   │   ├── Commands/
│   │   │   └── Becas/
│   │   │       ├── CreateBeca/
│   │   │       │   ├── CreateBecaCommand.cs
│   │   │       │   ├── CreateBecaCommandHandler.cs
│   │   │       │   └── CreateBecaCommandValidator.cs
│   │   │       ├── UpdateBeca/
│   │   │       └── DeleteBeca/
│   │   │
│   │   ├── Queries/
│   │   │   └── Becas/
│   │   │       ├── GetBecaById/
│   │   │       │   ├── GetBecaByIdQuery.cs
│   │   │       │   ├── GetBecaByIdQueryHandler.cs
│   │   │       │   └── BecaReadModel.cs     ← Modelo optimizado
│   │   │       └── SearchBecas/
│   │   │           └── ...
│   │   │
│   │   └── Events/
│   │       └── Handlers/
│   │           └── BecaCreadaEventHandler.cs
│   │
│   ├── Comillas.MiApp.Domain/
│   │   ├── Aggregates/
│   │   │   └── Beca/
│   │   │       ├── Beca.cs              ← Aggregate Root
│   │   │       └── Solicitud.cs         ← Entity
│   │   ├── ValueObjects/
│   │   │   └── Periodo.cs
│   │   ├── Events/
│   │   │   └── BecaCreadaEvent.cs
│   │   └── Interfaces/
│   │       ├── IBecaWriteRepository.cs
│   │       └── IBecaReadRepository.cs
│   │
│   └── Comillas.MiApp.Infrastructure/
│       ├── Persistence/
│       │   ├── Write/
│       │   │   └── BecaWriteRepository.cs
│       │   └── Read/
│       │       └── BecaReadRepository.cs  ← Puede usar Dapper
│       └── EventHandlers/
│           └── UpdateReadModelHandler.cs
│
└── tests/
```

### 5.5 Codigo ejemplo

```csharp
// ═══════════════════════════════════════════════════════════════
// COMMAND - Escritura con Dominio Rico
// ═══════════════════════════════════════════════════════════════

public record CreateBecaCommand : IRequest<Guid>
{
    public required string Nombre { get; init; }
    public decimal Importe { get; init; }
    public DateTime FechaInicio { get; init; }
    public DateTime FechaFin { get; init; }
}

public class CreateBecaCommandHandler : IRequestHandler<CreateBecaCommand, Guid>
{
    private readonly IBecaWriteRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;

    public async ValueTask<Guid> Handle(
        CreateBecaCommand request, CancellationToken ct)
    {
        // Crear con logica de dominio
        var periodo = new Periodo(request.FechaInicio, request.FechaFin);
        var beca = Beca.Crear(request.Nombre, request.Importe, periodo);

        await _repository.AddAsync(beca, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        // Publicar eventos de dominio
        foreach (var domainEvent in beca.DomainEvents)
        {
            await _mediator.Publish(domainEvent, ct);
        }
        beca.ClearDomainEvents();

        return beca.Id;
    }
}

// ═══════════════════════════════════════════════════════════════
// QUERY - Lectura con modelo optimizado
// ═══════════════════════════════════════════════════════════════

public record GetBecaByIdQuery(Guid Id) : IRequest<BecaReadModel?>;

// Modelo de lectura optimizado (puede ser denormalizado)
public record BecaReadModel
{
    public Guid Id { get; init; }
    public string Nombre { get; init; } = string.Empty;
    public decimal Importe { get; init; }
    public string Estado { get; init; } = string.Empty;
    public int TotalSolicitudes { get; init; }  // Denormalizado
    public DateTime FechaCreacion { get; init; }
}

public class GetBecaByIdQueryHandler : IRequestHandler<GetBecaByIdQuery, BecaReadModel?>
{
    private readonly IBecaReadRepository _readRepository;

    public async ValueTask<BecaReadModel?> Handle(
        GetBecaByIdQuery request, CancellationToken ct)
    {
        // Lectura optimizada (puede usar Dapper, vistas, etc.)
        return await _readRepository.GetByIdAsync(request.Id, ct);
    }
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN - Aggregate con logica de negocio
// ═══════════════════════════════════════════════════════════════

public class Beca : AggregateRoot
{
    public string Nombre { get; private set; } = null!;
    public decimal Importe { get; private set; }
    public Periodo Periodo { get; private set; } = null!;
    public EstadoBeca Estado { get; private set; }

    private readonly List<Solicitud> _solicitudes = [];
    public IReadOnlyCollection<Solicitud> Solicitudes => _solicitudes.AsReadOnly();

    private Beca() { }

    public static Beca Crear(string nombre, decimal importe, Periodo periodo)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new DomainException("El nombre es obligatorio");

        if (importe <= 0)
            throw new DomainException("El importe debe ser positivo");

        var beca = new Beca
        {
            Id = Guid.NewGuid(),
            Nombre = nombre,
            Importe = importe,
            Periodo = periodo,
            Estado = EstadoBeca.Borrador
        };

        beca.AddDomainEvent(new BecaCreadaEvent(beca.Id, nombre));

        return beca;
    }

    public void Publicar()
    {
        if (Estado != EstadoBeca.Borrador)
            throw new DomainException("Solo se pueden publicar becas en borrador");

        Estado = EstadoBeca.Publicada;
        AddDomainEvent(new BecaPublicadaEvent(Id));
    }
}

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLER - Sincronizar modelo de lectura
// ═══════════════════════════════════════════════════════════════

public class BecaCreadaEventHandler : INotificationHandler<BecaCreadaEvent>
{
    private readonly IBecaReadRepository _readRepository;

    public async ValueTask Handle(BecaCreadaEvent notification, CancellationToken ct)
    {
        // Actualizar modelo de lectura denormalizado
        await _readRepository.UpsertReadModelAsync(notification.BecaId, ct);
    }
}
```

### 5.6 Cuando usar AVANZADO

**Usar cuando:**
- Dominio muy complejo con muchas reglas de negocio
- Alta disparidad lectura/escritura (>10:1)
- Necesitas escalar lecturas independientemente
- Event Sourcing es requerido
- Auditoria completa de cambios
- Equipo senior con experiencia en DDD/CQRS

**NO usar cuando:**
- CRUD simple o moderado
- Equipo sin experiencia en CQRS
- Time-to-market critico
- Proyecto pequeno o mediano

### 5.7 Ventajas y desventajas

| Ventajas | Desventajas |
|----------|-------------|
| Optimizacion independiente R/W | Complejidad significativa |
| Escalabilidad superior | Consistencia eventual |
| Auditoria natural | Muchos mas archivos |
| Modelos especializados | Curva aprendizaje alta |
| Domain-Driven Design | Debugging mas dificil |

---

## 6. Comparativa de Patrones

### 6.1 Services vs Mediator

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES (Inyeccion directa)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Controller ──────────────► Service ──────────────► Repository │
│                                                                 │
│   Pros:                        Contras:                         │
│   ✅ Simple                    ❌ Controllers acoplados         │
│   ✅ F12 funciona              ❌ Sin pipeline behaviors        │
│   ✅ Menos archivos            ❌ Cross-cutting manual          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MEDIATOR (Handlers)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Controller ──► Mediator ──► Handler ──► Repository            │
│                      │                                          │
│                      └──► Pipeline Behaviors                    │
│                           ├── Validation                        │
│                           ├── Logging                           │
│                           └── Caching                           │
│                                                                 │
│   Pros:                        Contras:                         │
│   ✅ Desacoplado               ❌ Mas archivos                  │
│   ✅ Pipeline behaviors        ❌ F12 indirecto                 │
│   ✅ Testable                  ❌ Curva aprendizaje             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Sin CQRS vs Con CQRS

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIN CQRS (Mismo modelo)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Read ──────┐                                                  │
│              ├──► Same Model ──► Same Repository ──► Same DB    │
│   Write ─────┘                                                  │
│                                                                 │
│   Pros:                        Contras:                         │
│   ✅ Simple                    ❌ No optimizable por separado   │
│   ✅ Consistencia fuerte       ❌ Modelo compromiso             │
│   ✅ Un modelo                 ❌ Escala limitada               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CON CQRS (Modelos separados)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Read ──► Query ──► Read Model ──► Read Repo ──► Read Store    │
│                                                                 │
│   Write ──► Command ──► Domain ──► Write Repo ──► Write Store   │
│                                         │                       │
│                                    Events/Sync                  │
│                                         │                       │
│                                         ▼                       │
│                                   Update Read Store             │
│                                                                 │
│   Pros:                        Contras:                         │
│   ✅ Optimizable por separado  ❌ Consistencia eventual         │
│   ✅ Escala independiente      ❌ Complejidad                   │
│   ✅ Modelos especializados    ❌ Sincronizacion                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Cantidad de codigo por perfil

Para una entidad "Beca" con CRUD completo:

| Perfil | Archivos | Lineas aprox. | Clases |
|--------|----------|---------------|--------|
| BASICO | 6-8 | 200-300 | 4-5 |
| ESTANDAR | 12-15 | 400-600 | 10-12 |
| AVANZADO | 20-25 | 700-1000 | 18-22 |

---

## 7. Mediator vs MediatR

### 7.1 El problema con MediatR

A partir de la version 12, **MediatR cambio a licencia comercial**:

| Version | Licencia | Coste |
|---------|----------|-------|
| v11 y anteriores | Apache 2.0 | Gratuito |
| v12+ | Comercial | ~$500-2000/ano para empresas >$1M revenue |

### 7.2 Alternativas recomendadas

| Alternativa | Licencia | API compatible | Rendimiento |
|-------------|----------|----------------|-------------|
| **Mediator (Othamar)** | MIT | 95% | Mejor (source gen) |
| MediatR v11 | Apache 2.0 | 100% | Bueno |
| Wolverine | MIT | 60% | Similar |
| Implementacion propia | - | Variable | Variable |

### 7.3 Recomendacion STIC

```
RECOMENDACION OFICIAL:

Para nuevos proyectos → martinothamar/Mediator (MIT, gratuito)
Para proyectos existentes → Evaluar migracion o quedarse en v11

NuGet: Mediator.Abstractions + Mediator.SourceGenerator
GitHub: github.com/martinothamar/Mediator
```

### 7.4 Migracion MediatR a Mediator

```csharp
// ═══════════════════════════════════════════════════════════════
// ANTES (MediatR)
// ═══════════════════════════════════════════════════════════════

using MediatR;

public record GetBecaQuery(int Id) : IRequest<BecaDto?>;

public class GetBecaHandler : IRequestHandler<GetBecaQuery, BecaDto?>
{
    public async Task<BecaDto?> Handle(
        GetBecaQuery request, CancellationToken ct)
    {
        // ...
    }
}

// ═══════════════════════════════════════════════════════════════
// DESPUES (Mediator)
// ═══════════════════════════════════════════════════════════════

using Mediator;  // ← Cambio de namespace

public record GetBecaQuery(int Id) : IRequest<BecaDto?>;

public class GetBecaHandler : IRequestHandler<GetBecaQuery, BecaDto?>
{
    public async ValueTask<BecaDto?> Handle(  // ← Task → ValueTask
        GetBecaQuery request, CancellationToken ct)
    {
        // ... (logica igual)
    }
}
```

**Cambios necesarios:**
1. Cambiar namespace `MediatR` → `Mediator`
2. Cambiar `Task<T>` → `ValueTask<T>` en handlers
3. Actualizar registro en DI

---

## 8. Guia de Seleccion

### 8.1 Matriz de decision

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GUIA DE SELECCION DE PERFIL                      │
├─────────────────────┬───────────┬───────────┬───────────────────────┤
│     Criterio        │  BASICO   │ ESTANDAR  │      AVANZADO         │
├─────────────────────┼───────────┼───────────┼───────────────────────┤
│ Operaciones CRUD    │   >80%    │  50-80%   │       <50%            │
│ Logica de negocio   │   Poca    │  Moderada │      Compleja         │
│ Tamano equipo       │   1-2     │    2-5    │        5+             │
│ Duracion proyecto   │  <6 meses │ 6-18 meses│     >18 meses         │
│ Integraciones       │   0-2     │    2-5    │        5+             │
│ Escala esperada     │   Baja    │   Media   │       Alta            │
│ Testing requerido   │  Basico   │   Medio   │     Exhaustivo        │
│ Experiencia equipo  │  Junior   │   Mixto   │      Senior           │
├─────────────────────┼───────────┼───────────┼───────────────────────┤
│ Archivos/entidad    │    4-6    │   8-12    │       15-20           │
│ Setup inicial       │  1 hora   │  2-3 horas│     4-8 horas         │
│ Curva aprendizaje   │  1 dia    │  3-5 dias │    1-2 semanas        │
└─────────────────────┴───────────┴───────────┴───────────────────────┘
```

### 8.2 Arbol de decision

```
                        ¿Es principalmente CRUD?
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                   Sí          Parcial         No
                  (>80%)       (50-80%)       (<50%)
                    │             │             │
                    │             │             │
              ¿Equipo pequeño    │      ¿Dominio muy complejo?
              o junior?          │             │
                    │             │       ┌─────┴─────┐
              ┌─────┴─────┐       │       │           │
              │           │       │      Sí          No
             Sí          No       │       │           │
              │           │       │       │           │
              ▼           │       │       ▼           │
         ┌────────┐       │       │  ┌──────────┐    │
         │ BASICO │       │       │  │ AVANZADO │    │
         └────────┘       │       │  └──────────┘    │
                         │       │                   │
                         └───────┴───────────────────┘
                                       │
                                       ▼
                               ┌──────────┐
                               │ ESTANDAR │
                               └──────────┘
```

### 8.3 Ejemplos de proyectos por perfil

| Proyecto | Perfil | Justificacion |
|----------|--------|---------------|
| Gestor de documentos | BASICO | CRUD puro, sin logica |
| Portal interno empleados | BASICO | CRUD + consultas simples |
| API de gestion de becas | ESTANDAR | Validaciones, workflows |
| Sistema de matriculacion | ESTANDAR | Integraciones, reglas moderadas |
| ERP academico completo | AVANZADO | Dominio complejo, escala |
| Sistema de pagos | AVANZADO | Auditoria, alta disponibilidad |

---

## 9. Implementacion por Perfil

### 9.1 NuGets por perfil

**BASICO:**
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.*" />
  <PackageReference Include="FluentValidation" Version="11.*" />
  <PackageReference Include="Serilog.AspNetCore" Version="9.*" />
</ItemGroup>
```

**ESTANDAR:**
```xml
<ItemGroup>
  <!-- Mediator (alternativa gratuita a MediatR) -->
  <PackageReference Include="Mediator.Abstractions" Version="2.*" />
  <PackageReference Include="Mediator.SourceGenerator" Version="2.*" />

  <!-- Validacion -->
  <PackageReference Include="FluentValidation" Version="11.*" />
  <PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.*" />

  <!-- Mapping -->
  <PackageReference Include="Mapster" Version="7.*" />

  <!-- EF Core -->
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.*" />

  <!-- Logging -->
  <PackageReference Include="Serilog.AspNetCore" Version="9.*" />
</ItemGroup>
```

**AVANZADO:**
```xml
<ItemGroup>
  <!-- Todo de ESTANDAR + -->

  <!-- Domain Events -->
  <PackageReference Include="MassTransit" Version="8.*" />

  <!-- Outbox Pattern (opcional) -->
  <PackageReference Include="MassTransit.EntityFrameworkCore" Version="8.*" />

  <!-- Read optimizado (opcional) -->
  <PackageReference Include="Dapper" Version="2.*" />
</ItemGroup>
```

### 9.2 Registro en DI

**BASICO:**
```csharp
// Program.cs
builder.Services.AddScoped<IBecaService, BecaService>();
builder.Services.AddScoped<IBecaRepository, BecaRepository>();
builder.Services.AddDbContext<ApplicationDbContext>(...);
```

**ESTANDAR:**
```csharp
// Program.cs
builder.Services.AddMediator(options =>
{
    options.ServiceLifetime = ServiceLifetime.Scoped;
});

builder.Services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
builder.Services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddScoped<IBecaRepository, BecaRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
```

**AVANZADO:**
```csharp
// Todo de ESTANDAR +
builder.Services.AddScoped<IBecaWriteRepository, BecaWriteRepository>();
builder.Services.AddScoped<IBecaReadRepository, BecaReadRepository>();

// MassTransit para eventos
builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<BecaCreadaEventHandler>();
    x.UsingInMemory((context, cfg) =>
    {
        cfg.ConfigureEndpoints(context);
    });
});
```

---

## 10. Migracion entre Perfiles

### 10.1 BASICO → ESTANDAR

1. Crear capas Application, Domain, Infrastructure
2. Mover entidades a Domain
3. Crear Requests/Handlers para cada operacion
4. Reemplazar llamadas directas por `_mediator.Send()`
5. Añadir pipeline behaviors
6. Actualizar tests

### 10.2 ESTANDAR → AVANZADO

1. Separar Commands y Queries en carpetas
2. Crear modelos de lectura optimizados
3. Crear repositorios separados Read/Write
4. Implementar Domain Events
5. (Opcional) Separar bases de datos
6. Implementar sincronizacion

### 10.3 Consejo

> **Empezar simple, evolucionar cuando sea necesario.**
> Es mas facil anadir complejidad que eliminarla.

---

## 11. Referencias

### 11.1 Documentacion oficial

| Recurso | URL |
|---------|-----|
| Mediator (Othamar) | github.com/martinothamar/Mediator |
| Clean Architecture | blog.cleancoder.com/uncle-bob |
| CQRS - Martin Fowler | martinfowler.com/bliki/CQRS.html |
| DDD Reference | domainlanguage.com/ddd/reference |

### 11.2 Libros recomendados

- "Clean Architecture" - Robert C. Martin
- "Implementing Domain-Driven Design" - Vaughn Vernon
- "Patterns of Enterprise Application Architecture" - Martin Fowler

### 11.3 Archivos relacionados en la plantilla

| Archivo | Contenido |
|---------|-----------|
| `.claude/rules/application.md` | Reglas capa Application |
| `.claude/rules/domain.md` | Reglas capa Domain |
| `.claude/rules/infrastructure.md` | Reglas capa Infrastructure |
| `.claude/CLAUDE_BASE_COMILLAS.md` | Estandares generales |

---

*Documento generado: 2026-02-02*
*Version: 1.0.0*
*STIC - Universidad Pontificia Comillas*
