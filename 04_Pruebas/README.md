# Fase 4: Pruebas

## Objetivo

Asegurar calidad y confiabilidad del código.

## Herramientas
- **Claude Code**: Generación de suites de pruebas
- **GitHub Copilot**: Autocompletado de tests

---

## Estructura

```
04_Pruebas/
├── Unitarias/        # Tests unitarios
├── Integracion/      # Tests de integración
└── Cobertura/        # Reportes de cobertura
```

---

## Checklist

- [ ] Crear proyecto de pruebas xUnit
- [ ] Generar pruebas unitarias por servicio
- [ ] Crear pruebas de integración
- [ ] Configurar mocks (Moq)
- [ ] Analizar cobertura de código (mínimo 70%)
- [ ] Documentar casos de prueba

---

## Cobertura Mínima

| Tipo | Cobertura | Obligatorio |
|------|-----------|-------------|
| Unitarios | 70% lógica de negocio | Sí |
| Integración | Endpoints críticos | Sí |
| E2E | Flujos principales | Recomendado |

---

## Ejemplo de Test

```csharp
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

## Enlaces

- [README principal](../README.md)
- [Anterior: Desarrollo](../03_Desarrollo/)
- [Siguiente: CI/CD](../05_CICD/)
