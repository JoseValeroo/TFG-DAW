# Guía de Acceso a Datos: Dapper vs ADO.NET

Esta guía te ayudará a elegir la mejor opción de acceso a datos para tu proyecto.

---

## Comparativa Rápida

| Característica | Dapper (Recomendado) | ADO.NET |
|----------------|----------------------|---------|
| **Rendimiento** | Muy alto (casi nativo) | Máximo (nativo) |
| **Productividad** | Alta | Baja |
| **Curva de aprendizaje** | Fácil | Media |
| **Código boilerplate** | Mínimo | Mucho |
| **Mapeo automático** | Sí | Manual |
| **Mantenibilidad** | Excelente | Media |
| **Comunidad** | Muy activa | Estable |
| **NuGet Package** | Dapper | Microsoft.Data.SqlClient |

---

## Cuándo Usar Qué

### Usa Dapper (Recomendado en 90% de casos)

**Ideal para:**
- Proyectos nuevos
- APIs RESTful
- Necesitas rendimiento y productividad
- Equipos que quieren escribir menos código
- Proyectos con queries complejos pero quieres simplicidad
- Escalabilidad con mantenibilidad

**Ventajas:**
```csharp
// Código simple y limpio
var users = await connection.QueryAsync<User>(
    "SELECT * FROM Users WHERE IsActive = @IsActive",
    new { IsActive = true }
);

// Mapeo automático a objetos
// Sin configuración adicional
// Fácil de leer y mantener
```

---

### Usa ADO.NET (Solo casos específicos)

**Ideal para:**
- Control absoluto del rendimiento (diferencia < 5% vs Dapper)
- Streaming de grandes volúmenes de datos
- Proyectos legacy que ya usan ADO.NET
- Restricciones de dependencias externas
- Equipos con expertise profundo en ADO.NET

**Desventajas:**
```csharp
// Mucho código boilerplate
using (var connection = new SqlConnection(connectionString))
using (var command = new SqlCommand("SELECT * FROM Users WHERE IsActive = @IsActive", connection))
{
    command.Parameters.AddWithValue("@IsActive", true);
    await connection.OpenAsync();

    using (var reader = await command.ExecuteReaderAsync())
    {
        var users = new List<User>();
        while (await reader.ReadAsync())
        {
            users.Add(new User
            {
                Id = reader.GetInt32(0),
                Name = reader.GetString(1),
                Email = reader.GetString(2),
                // ... más campos manualmente
            });
        }
        return users;
    }
}
```

---

## Decisión Recomendada por Tipo de Proyecto

### Proyecto Nuevo - Dapper

**Razón:**
- Productividad 5x mayor
- Código más limpio y mantenible
- Rendimiento prácticamente idéntico a ADO.NET
- Comunidad activa y documentación excelente

---

### API RESTful - Dapper

**Razón:**
- Ideal para operaciones CRUD
- Mapeo automático a DTOs
- Queries simples y complejos sin esfuerzo
- Integración perfecta con async/await

---

### Migración de Sistema Legacy - Evaluar

**Si ya usa ADO.NET:**
- Mantener ADO.NET si funciona bien
- O migrar gradualmente a Dapper (módulo por módulo)

**Si usa Entity Framework:**
- Migrar a Dapper para mejorar rendimiento
- Mantener arquitectura de repositorios

---

### Microservicios - Dapper

**Razón:**
- Lightweight
- Sin dependencias pesadas
- Rápido y eficiente
- Fácil de dockerizar

---

## Ejemplos de Código

### Operación CRUD con Dapper

```csharp
// 1. Interface del Repositorio
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<int> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
}

// 2. Implementación con Dapper
public class UserRepository : IUserRepository
{
    private readonly IDbConnection _connection;

    public UserRepository(IDbConnection connection)
    {
        _connection = connection;
    }

    public async Task<User> GetByIdAsync(int id)
    {
        var sql = "SELECT * FROM Users WHERE Id = @Id";
        return await _connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        var sql = "SELECT * FROM Users WHERE IsActive = 1";
        return await _connection.QueryAsync<User>(sql);
    }

    public async Task<int> CreateAsync(User user)
    {
        var sql = @"INSERT INTO Users (Name, Email, IsActive)
                    VALUES (@Name, @Email, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int)";
        return await _connection.ExecuteScalarAsync<int>(sql, user);
    }

    public async Task<bool> UpdateAsync(User user)
    {
        var sql = @"UPDATE Users
                    SET Name = @Name, Email = @Email, IsActive = @IsActive
                    WHERE Id = @Id";
        var affectedRows = await _connection.ExecuteAsync(sql, user);
        return affectedRows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var sql = "DELETE FROM Users WHERE Id = @Id";
        var affectedRows = await _connection.ExecuteAsync(sql, new { Id = id });
        return affectedRows > 0;
    }
}
```

---

## Configuración en Proyecto .NET

### Setup con Dapper

**1. Instalar NuGet:**
```bash
dotnet add package Dapper
dotnet add package Microsoft.Data.SqlClient
```

**2. Configurar en Program.cs:**
```csharp
// Registrar IDbConnection en DI
builder.Services.AddScoped<IDbConnection>(sp =>
    new SqlConnection(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Registrar repositorios
builder.Services.AddScoped<IUserRepository, UserRepository>();
```

**3. appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MiDB;User Id=sa;Password=***;TrustServerCertificate=true"
  }
}
```

**Nota:** En producción, usar Azure Key Vault para el connection string.

---

## Mejores Prácticas con Dapper

### DO - Hacer

```csharp
// Usar parámetros siempre (previene SQL Injection)
var users = await connection.QueryAsync<User>(
    "SELECT * FROM Users WHERE Email = @Email",
    new { Email = email }
);

// Usar async/await
public async Task<User> GetUserAsync(int id) { ... }

// Usar stored procedures cuando sea apropiado
var result = await connection.QueryAsync<User>(
    "sp_GetUsersByRole",
    new { Role = "Admin" },
    commandType: CommandType.StoredProcedure
);

// Mapear múltiples resultados
var sql = @"
    SELECT * FROM Users WHERE Id = @Id;
    SELECT * FROM Orders WHERE UserId = @Id;
";
using (var multi = await connection.QueryMultipleAsync(sql, new { Id = id }))
{
    var user = await multi.ReadFirstOrDefaultAsync<User>();
    var orders = await multi.ReadAsync<Order>();
    user.Orders = orders.ToList();
}

// Usar transacciones cuando sea necesario
using (var transaction = connection.BeginTransaction())
{
    try
    {
        await connection.ExecuteAsync(sql1, param1, transaction);
        await connection.ExecuteAsync(sql2, param2, transaction);
        transaction.Commit();
    }
    catch
    {
        transaction.Rollback();
        throw;
    }
}
```

### DON'T - No hacer

```csharp
// NO concatenar strings SQL (SQL Injection vulnerability!)
var sql = $"SELECT * FROM Users WHERE Email = '{email}'"; // NUNCA!

// NO abrir conexión manualmente innecesariamente
connection.Open(); // Dapper lo hace automáticamente

// NO usar síncrono cuando corresponde async
var users = connection.Query<User>(sql); // Usar QueryAsync

// NO olvidar disponer de conexiones
// Siempre usar using o inyección de dependencias con scope
```

---

## Benchmarks de Rendimiento

### Operación: SELECT simple (1000 registros)

| Método | Tiempo | Memoria | Código |
|--------|--------|---------|--------|
| **Dapper** | 12 ms | 1.2 MB | 3 líneas |
| **ADO.NET** | 11 ms | 1.1 MB | 25 líneas |
| **Entity Framework** | 45 ms | 3.5 MB | 5 líneas |

**Conclusión:**
- Dapper: 99% del rendimiento de ADO.NET con 88% menos código
- EF Core: Más lento pero más features (change tracking, migrations, etc.)

---

## Recursos de Aprendizaje

### Dapper
- [Documentación Oficial](https://github.com/DapperLib/Dapper)
- [Dapper Tutorial](https://www.learndapper.com/)
- [Dapper Plus Extensions](https://dapper-plus.net/)

### ADO.NET
- [Documentación Microsoft](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/)
- [Best Practices](https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/ado-net-code-examples)

---

## Recomendación Final

### Para el 90% de proyectos: Usa Dapper

**Razones:**
1. Productividad significativamente mayor
2. Código limpio y mantenible
3. Rendimiento casi idéntico a ADO.NET (diferencia < 10%)
4. Comunidad activa y soporte excelente
5. Curva de aprendizaje suave
6. Perfecto balance entre control y simplicidad

### Solo usa ADO.NET si:
- Proyecto legacy existente con ADO.NET
- Restricciones específicas de no usar librerías externas
- Necesitas optimizaciones muy específicas (casos raros)

---

**Versión:** 1.0
**Última actualización:** 2025-10-27
**Recomendación:** Dapper en 90% de casos
