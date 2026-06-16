# Architecture and Patterns Guide - STIC Comillas

> **Version**: 1.0.0
> **Date**: 2026-02-02
> **Author**: STIC - Universidad Pontificia Comillas
> **Purpose**: Comprehensive guide for architecture selection in .NET projects

---

## Index

1. [Introduction](#1-introduction)
2. [Architecture Profiles](#2-architecture-profiles)
3. [BASIC Profile - Services + Repository](#3-basic-profile)
4. [STANDARD Profile - Clean Architecture + Mediator](#4-standard-profile)
5. [ADVANCED Profile - CQRS + Mediator](#5-advanced-profile)
6. [Pattern Comparison](#6-pattern-comparison)
7. [Mediator vs MediatR - Technical Decision](#7-mediator-vs-mediatr)
8. [Selection Guide](#8-selection-guide)
9. [Implementation by Profile](#9-implementation-by-profile)
10. [Migration Between Profiles](#10-migration-between-profiles)
11. [References](#11-references)

---

## 1. Introduction

### 1.1 Purpose of this document

This document provides a comprehensive guide for selecting the appropriate architecture in Comillas .NET projects. It defines three predefined architecture profiles that cover 95% of use cases.

### 1.2 STIC design principles

| Principle | Description |
|-----------|-------------|
| **Simplicity** | Don't overdesign. Choose minimum necessary complexity |
| **Maintainability** | Code that others can understand and modify |
| **Testability** | Facilitate unit and integration testing |
| **Scalability** | Allow growth without rewriting |

### 1.3 Comillas project reality

```
Typical project distribution:

70% ─────────────────────────────── CRUD + basic logic
     Managers, internal portals, ABMs

20% ───────── Moderate logic
     Integrations, workflows, complex validations

10% ── Complex domains
     Critical systems, high scale, event sourcing
```

---

## 2. Architecture Profiles

### 2.1 Profile summary

| Profile | Pattern | Complexity | Files/Entity | Ideal for |
|---------|---------|------------|--------------|-----------|
| **BASIC** | Services + Repository | ⭐ | 4-6 | CRUD, MVPs, prototypes |
| **STANDARD** | Clean + Mediator | ⭐⭐ | 8-12 | REST APIs, business apps |
| **ADVANCED** | CQRS + Mediator | ⭐⭐⭐ | 15-20 | Complex domains |

### 2.2 Decision diagram

```
                    What type of project is it?
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
         CRUD >80%       CRUD 50-80%      CRUD <50%
         Simple logic   Moderate logic  Complex logic
              │               │               │
              ▼               ▼               ▼
         ┌────────┐     ┌──────────┐    ┌──────────┐
         │ BASIC  │     │ STANDARD │    │ ADVANCED │
         └────────┘     └──────────┘    └──────────┘
```

---

## 3. BASIC Profile

### 3.1 Description

The BASIC profile implements a 2-3 layer architecture with direct service injection. It does not use the Mediator pattern.

### 3.2 Architecture diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      BASIC PROFILE                           │
│                  Services + Repository                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐                                           │
│   │ Controller  │                                           │
│   │             │                                           │
│   └──────┬──────┘                                           │
│          │ Direct injection                                 │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │   Service   │  ◄── Business logic                      │
│   │             │      Validations                         │
│   └──────┬──────┘      DTO mapping                         │
│          │                                                  │
│          ▼                                                  │
│   ┌─────────────┐                                           │
│   │ Repository  │  ◄── Data access                         │
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

### 3.3 Project structure

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
│   └── Comillas.MiApp.Core/          # Everything else
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

### 3.4 Code example

```csharp
// ═══════════════════════════════════════════════════════════════
// CONTROLLER - Direct service injection
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
// SERVICE - Contains business logic
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
        // Business validation
        if (request.Importe <= 0)
            throw new ValidationException("Amount must be positive");

        var beca = new Beca
        {
            Nombre = request.Nombre,
            Importe = request.Importe,
            FechaCreacion = DateTime.UtcNow
        };

        await _repository.AddAsync(beca, ct);

        _logger.LogInformation("Beca {BecaId} created", beca.Id);

        return beca.ToDto();
    }
}

// ═══════════════════════════════════════════════════════════════
// REPOSITORY - Data access
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

### 3.5 When to use BASIC

**Use when:**
- CRUD operations represent >80% of the system
- Short duration project (<6 months)
- Small team (1-2 people) or junior
- Prototype or MVP that may evolve
- No high scalability requirements

**DO NOT use when:**
- Complex business logic with many rules
- You need centralized cross-cutting concerns (logging, validation, caching)
- The project will grow significantly
- Extensive testing is required

### 3.6 Advantages and disadvantages

| Advantages | Disadvantages |
|------------|---------------|
| Maximum simplicity | Controllers coupled to services |
| Minimal learning curve | No pipeline behaviors |
| F12 works directly | Manual cross-cutting concerns |
| Fewer files to maintain | Difficult to evolve to CQRS |
| Ideal for junior teams | More coupled testing |

---

## 4. STANDARD Profile

### 4.1 Description

The STANDARD profile implements Clean Architecture with the Mediator pattern to decouple controllers from handlers. Includes pipeline behaviors for logging, validation and other cross-cutting concerns.

### 4.2 Architecture diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     STANDARD PROFILE                         │
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

### 4.3 Project structure

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

### 4.4 Code example

```csharp
// ═══════════════════════════════════════════════════════════════
// CONTROLLER - Uses Mediator
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
// QUERY - Read
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
// COMMAND - Write
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
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Maximum 200 characters");

        RuleFor(x => x.Importe)
            .GreaterThan(0).WithMessage("Amount must be positive");
    }
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE BEHAVIOR - Automatic validation
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

### 4.5 Mediator configuration (martinothamar/Mediator)

```csharp
// Program.cs
builder.Services.AddMediator(options =>
{
    options.ServiceLifetime = ServiceLifetime.Scoped;
});

// With behaviors
builder.Services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
builder.Services.AddSingleton(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateBecaCommandValidator>();
```

### 4.6 When to use STANDARD

**Use when:**
- Medium-sized project (6-18 months)
- Moderate business logic
- You need centralized cross-cutting concerns
- Testing is important
- Mixed team (junior + senior)
- Typical REST API with validations

**DO NOT use when:**
- Very simple CRUD (>80%)
- Very complex domain requiring real CQRS
- Critical time-to-market with no margin

### 4.7 Advantages and disadvantages

| Advantages | Disadvantages |
|------------|---------------|
| Clean decoupling | More files than BASIC |
| Pipeline behaviors | F12 doesn't reach handler directly |
| Facilitated testing | Medium learning curve |
| Easily testable | May seem overengineering |
| Scalable to CQRS | for simple CRUD |

---

## 5. ADVANCED Profile

### 5.1 Description

The ADVANCED profile implements full CQRS (Command Query Responsibility Segregation), separating read and write models. Allows optimizing each side independently.

### 5.2 Architecture diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      ADVANCED PROFILE                        │
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
│  (Normalized)           (Denormalized)                      │
│                                                              │
│        └──────── Sync/Events ────────┘                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 CQRS implementation levels

| Level | Description | Complexity | When to use |
|-------|-------------|------------|-------------|
| **1** | Same DB, different models | Low | Start here |
| **2** | Same DB, materialized views | Medium | Optimize reads |
| **3** | Separate DBs (eventual sync) | High | High scale |
| **4** | Event Sourcing | Very high | Complete audit |

### 5.4 Project structure

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
│   │   │       │   └── BecaReadModel.cs     ← Optimized model
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
│       │       └── BecaReadRepository.cs  ← Can use Dapper
│       └── EventHandlers/
│           └── UpdateReadModelHandler.cs
│
└── tests/
```

### 5.5 Code example

```csharp
// ═══════════════════════════════════════════════════════════════
// COMMAND - Write with Rich Domain
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
        // Create with domain logic
        var periodo = new Periodo(request.FechaInicio, request.FechaFin);
        var beca = Beca.Crear(request.Nombre, request.Importe, periodo);

        await _repository.AddAsync(beca, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        // Publish domain events
        foreach (var domainEvent in beca.DomainEvents)
        {
            await _mediator.Publish(domainEvent, ct);
        }
        beca.ClearDomainEvents();

        return beca.Id;
    }
}

// ═══════════════════════════════════════════════════════════════
// QUERY - Read with optimized model
// ═══════════════════════════════════════════════════════════════

public record GetBecaByIdQuery(Guid Id) : IRequest<BecaReadModel?>;

// Optimized read model (can be denormalized)
public record BecaReadModel
{
    public Guid Id { get; init; }
    public string Nombre { get; init; } = string.Empty;
    public decimal Importe { get; init; }
    public string Estado { get; init; } = string.Empty;
    public int TotalSolicitudes { get; init; }  // Denormalized
    public DateTime FechaCreacion { get; init; }
}

public class GetBecaByIdQueryHandler : IRequestHandler<GetBecaByIdQuery, BecaReadModel?>
{
    private readonly IBecaReadRepository _readRepository;

    public async ValueTask<BecaReadModel?> Handle(
        GetBecaByIdQuery request, CancellationToken ct)
    {
        // Optimized read (can use Dapper, views, etc.)
        return await _readRepository.GetByIdAsync(request.Id, ct);
    }
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN - Aggregate with business logic
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

    private Beca(string nombre, decimal importe, Periodo periodo)
    {
        Nombre = nombre;
        Importe = importe;
        Periodo = periodo;
        Estado = EstadoBeca.Borrador;
    }

    public static Beca Crear(string nombre, decimal importe, Periodo periodo)
    {
        if (string.IsNullOrWhiteSpace(nombre))
            throw new DomainException("Name is required");

        if (importe <= 0)
            throw new DomainException("Amount must be positive");

        var beca = new Beca(nombre.Trim(), importe, periodo);
        beca.AddDomainEvent(new BecaCreadaEvent(beca.Id, nombre));

        return beca;
    }

    public void Publicar()
    {
        if (Estado != EstadoBeca.Borrador)
            throw new DomainException("Only draft grants can be published");

        if (!Periodo.EsFuturo())
            throw new DomainException("Cannot publish a grant with past period");

        Estado = EstadoBeca.Publicada;
        AddDomainEvent(new BecaPublicadaEvent(Id));
    }
}

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLER - Synchronize read model
// ═══════════════════════════════════════════════════════════════

public class BecaCreadaEventHandler : INotificationHandler<BecaCreadaEvent>
{
    private readonly IBecaReadRepository _readRepository;

    public async ValueTask Handle(BecaCreadaEvent notification, CancellationToken ct)
    {
        // Update denormalized read model
        await _readRepository.UpsertReadModelAsync(notification.BecaId, ct);
    }
}
```

### 5.6 When to use ADVANCED

**Use when:**
- Very complex domain with many business rules
- High read/write disparity (>10:1)
- Need to scale reads independently
- Event Sourcing is required
- Complete change audit
- Senior team with DDD/CQRS experience

**DO NOT use when:**
- Simple or moderate CRUD
- Team without CQRS experience
- Critical time-to-market
- Small or medium project

### 5.7 Advantages and disadvantages

| Advantages | Disadvantages |
|------------|---------------|
| Independent R/W optimization | Significant complexity |
| Superior scalability | Eventual consistency |
| Natural auditing | Many more files |
| Specialized models | High learning curve |
| Domain-Driven Design | More difficult debugging |

---

## 6. Pattern Comparison

### 6.1 Services vs Mediator

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES (Direct injection)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Controller ──────────────► Service ──────────────► Repository │
│                                                                 │
│   Pros:                        Cons:                            │
│   ✅ Simple                    ❌ Controllers coupled           │
│   ✅ F12 works                 ❌ No pipeline behaviors         │
│   ✅ Fewer files               ❌ Manual cross-cutting          │
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
│   Pros:                        Cons:                            │
│   ✅ Decoupled                 ❌ More files                    │
│   ✅ Pipeline behaviors        ❌ Indirect F12                  │
│   ✅ Testable                  ❌ Learning curve                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Without CQRS vs With CQRS

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITHOUT CQRS (Same model)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Read ──────┐                                                  │
│              ├──► Same Model ──► Same Repository ──► Same DB    │
│   Write ─────┘                                                  │
│                                                                 │
│   Pros:                        Cons:                            │
│   ✅ Simple                    ❌ Not optimizable separately    │
│   ✅ Strong consistency        ❌ Compromise model              │
│   ✅ One model                 ❌ Limited scale                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    WITH CQRS (Separate models)                  │
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
│   Pros:                        Cons:                            │
│   ✅ Optimizable separately    ❌ Eventual consistency          │
│   ✅ Independent scale         ❌ Complexity                    │
│   ✅ Specialized models        ❌ Synchronization               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Code quantity by profile

For a "Beca" entity with complete CRUD:

| Profile | Files | Approx. lines | Classes |
|---------|-------|---------------|---------|
| BASIC | 6-8 | 200-300 | 4-5 |
| STANDARD | 12-15 | 400-600 | 10-12 |
| ADVANCED | 20-25 | 700-1000 | 18-22 |

---

## 7. Mediator vs MediatR

### 7.1 The problem with MediatR

As of version 12, **MediatR changed to commercial license**:

| Version | License | Cost |
|---------|---------|------|
| v11 and earlier | Apache 2.0 | Free |
| v12+ | Commercial | ~$500-2000/year for companies >$1M revenue |

### 7.2 Recommended alternatives

| Alternative | License | API compatible | Performance |
|-------------|---------|----------------|-------------|
| **Mediator (Othamar)** | MIT | 95% | Better (source gen) |
| MediatR v11 | Apache 2.0 | 100% | Good |
| Wolverine | MIT | 60% | Similar |
| Own implementation | - | Variable | Variable |

### 7.3 STIC recommendation

```
OFFICIAL RECOMMENDATION:

For new projects → martinothamar/Mediator (MIT, free)
For existing projects → Evaluate migration or stay on v11

NuGet: Mediator.Abstractions + Mediator.SourceGenerator
GitHub: github.com/martinothamar/Mediator
```

### 7.4 MediatR to Mediator migration

```csharp
// ═══════════════════════════════════════════════════════════════
// BEFORE (MediatR)
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
// AFTER (Mediator)
// ═══════════════════════════════════════════════════════════════

using Mediator;  // ← Namespace change

public record GetBecaQuery(int Id) : IRequest<BecaDto?>;

public class GetBecaHandler : IRequestHandler<GetBecaQuery, BecaDto?>
{
    public async ValueTask<BecaDto?> Handle(  // ← Task → ValueTask
        GetBecaQuery request, CancellationToken ct)
    {
        // ... (same logic)
    }
}
```

**Required changes:**
1. Change namespace `MediatR` → `Mediator`
2. Change `Task<T>` → `ValueTask<T>` in handlers
3. Update DI registration

---

## 8. Selection Guide

### 8.1 Decision matrix

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROFILE SELECTION GUIDE                          │
├─────────────────────┬───────────┬───────────┬───────────────────────┤
│     Criteria        │  BASIC    │ STANDARD  │      ADVANCED         │
├─────────────────────┼───────────┼───────────┼───────────────────────┤
│ CRUD operations     │   >80%    │  50-80%   │       <50%            │
│ Business logic      │   Little  │  Moderate │      Complex          │
│ Team size           │   1-2     │    2-5    │        5+             │
│ Project duration    │  <6 months│ 6-18 months│     >18 months       │
│ Integrations        │   0-2     │    2-5    │        5+             │
│ Expected scale      │   Low     │   Medium  │       High            │
│ Testing required    │  Basic    │   Medium  │     Exhaustive        │
│ Team experience     │  Junior   │   Mixed   │      Senior           │
├─────────────────────┼───────────┼───────────┼───────────────────────┤
│ Files/entity        │    4-6    │   8-12    │       15-20           │
│ Initial setup       │  1 hour   │  2-3 hours│     4-8 hours         │
│ Learning curve      │  1 day    │  3-5 days │    1-2 weeks          │
└─────────────────────┴───────────┴───────────┴───────────────────────┘
```

### 8.2 Decision tree

```
                        Is it mainly CRUD?
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                   Yes         Partial         No
                  (>80%)       (50-80%)       (<50%)
                    │             │             │
                    │             │             │
              Is team small       │      Is domain very complex?
              or junior?          │             │
                    │             │       ┌─────┴─────┐
              ┌─────┴─────┐       │       │           │
              │           │       │      Yes          No
             Yes          No      │       │           │
              │           │       │       │           │
              ▼           │       │       ▼           │
         ┌────────┐       │       │  ┌──────────┐    │
         │ BASIC  │       │       │  │ ADVANCED │    │
         └────────┘       │       │  └──────────┘    │
                         │       │                   │
                         └───────┴───────────────────┘
                                       │
                                       ▼
                               ┌──────────┐
                               │ STANDARD │
                               └──────────┘
```

### 8.3 Project examples by profile

| Project | Profile | Justification |
|---------|---------|---------------|
| Document manager | BASIC | Pure CRUD, no logic |
| Employee internal portal | BASIC | CRUD + simple queries |
| Grant management API | STANDARD | Validations, workflows |
| Enrollment system | STANDARD | Integrations, moderate rules |
| Complete academic ERP | ADVANCED | Complex domain, scale |
| Payment system | ADVANCED | Audit, high availability |

---

## 9. Implementation by Profile

### 9.1 NuGets by profile

**BASIC:**
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="10.*" />
  <PackageReference Include="FluentValidation" Version="11.*" />
  <PackageReference Include="Serilog.AspNetCore" Version="9.*" />
</ItemGroup>
```

**STANDARD:**
```xml
<ItemGroup>
  <!-- Mediator (free alternative to MediatR) -->
  <PackageReference Include="Mediator.Abstractions" Version="2.*" />
  <PackageReference Include="Mediator.SourceGenerator" Version="2.*" />

  <!-- Validation -->
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

**ADVANCED:**
```xml
<ItemGroup>
  <!-- Everything from STANDARD + -->

  <!-- Domain Events -->
  <PackageReference Include="MassTransit" Version="8.*" />

  <!-- Outbox Pattern (optional) -->
  <PackageReference Include="MassTransit.EntityFrameworkCore" Version="8.*" />

  <!-- Optimized read (optional) -->
  <PackageReference Include="Dapper" Version="2.*" />
</ItemGroup>
```

### 9.2 DI registration

**BASIC:**
```csharp
// Program.cs
builder.Services.AddScoped<IBecaService, BecaService>();
builder.Services.AddScoped<IBecaRepository, BecaRepository>();
builder.Services.AddDbContext<ApplicationDbContext>(...);
```

**STANDARD:**
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

**ADVANCED:**
```csharp
// Everything from STANDARD +
builder.Services.AddScoped<IBecaWriteRepository, BecaWriteRepository>();
builder.Services.AddScoped<IBecaReadRepository, BecaReadRepository>();

// MassTransit for events
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

## 10. Migration Between Profiles

### 10.1 BASIC → STANDARD

1. Create Application, Domain, Infrastructure layers
2. Move entities to Domain
3. Create Requests/Handlers for each operation
4. Replace direct calls with `_mediator.Send()`
5. Add pipeline behaviors
6. Update tests

### 10.2 STANDARD → ADVANCED

1. Separate Commands and Queries into folders
2. Create optimized read models
3. Create separate Read/Write repositories
4. Implement Domain Events
5. (Optional) Separate databases
6. Implement synchronization

### 10.3 Advice

> **Start simple, evolve when necessary.**
> It's easier to add complexity than to remove it.

---

## 11. References

### 11.1 Official documentation

| Resource | URL |
|---------|-----|
| Mediator (Othamar) | github.com/martinothamar/Mediator |
| Clean Architecture | blog.cleancoder.com/uncle-bob |
| CQRS - Martin Fowler | martinfowler.com/bliki/CQRS.html |
| DDD Reference | domainlanguage.com/ddd/reference |

### 11.2 Recommended books

- "Clean Architecture" - Robert C. Martin
- "Implementing Domain-Driven Design" - Vaughn Vernon
- "Patterns of Enterprise Application Architecture" - Martin Fowler

### 11.3 Related files in template

| File | Content |
|------|---------|
| `.claude/rules/application.md` | Application layer rules |
| `.claude/rules/domain.md` | Domain layer rules |
| `.claude/rules/infrastructure.md` | Infrastructure layer rules |
| `.claude/CLAUDE_BASE_COMILLAS.md` | General standards |

---

*Document generated: 2026-02-02*
*Version: 1.0.0*
*STIC - Universidad Pontificia Comillas*
