# Mapa de Dependencias

> **INSTRUCCIONES PARA CLAUDE**: Este archivo documenta las dependencias entre componentes.
> SIEMPRE consulta este archivo antes de modificar codigo para evitar romper funcionalidades.
> Actualiza este archivo cuando crees nuevas dependencias.

---

## Preguntas para Contextualizar (usar en /onboarding)

### Sobre Arquitectura
- [ ] ¿Cual es la arquitectura general? (Monolito, Microservicios, N-Capas)
- [ ] ¿Cuantas capas tiene la aplicacion?
- [ ] ¿Hay servicios separados que se comunican entre si?
- [ ] ¿Se usa algun patron especifico? (CQRS, Event Sourcing, etc.)

### Sobre Integraciones Externas
- [ ] ¿Con que sistemas externos se integra?
- [ ] ¿Que APIs consume?
- [ ] ¿Que APIs expone?
- [ ] ¿Hay colas de mensajes o eventos?
- [ ] ¿Hay procesos batch o ETLs?

### Sobre Base de Datos
- [ ] ¿Cuantas bases de datos hay?
- [ ] ¿Hay procedimientos almacenados criticos?
- [ ] ¿Hay triggers o constraints especiales?
- [ ] ¿Hay tablas compartidas con otras aplicaciones?

### Sobre Infraestructura
- [ ] ¿Donde esta desplegada la aplicacion?
- [ ] ¿Hay balanceador de carga?
- [ ] ¿Que servicios de Azure/Cloud se usan?
- [ ] ¿Hay cache distribuida?

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  [Navegador] ──────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API / CONTROLLERS                          │
│  [API Gateway / Load Balancer]                                  │
│  └── Controllers/                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  └── Services/                                                  │
│  └── DTOs/                                                      │
│  └── Validators/                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                               │
│  └── Entities/                                                  │
│  └── Interfaces/                                                │
│  └── Business Rules/                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                          │
│  └── Repositories/                                              │
│  └── External Services/                                         │
│  └── Data Access/                                               │
└─────────────────────────────────────────────────────────────────┘
        │               │               │               │
        ▼               ▼               ▼               ▼
   [SQL Server]    [Azure Blob]   [Key Vault]      [Redis]
```

---

## Matriz de Impacto

> **IMPORTANTE**: Antes de modificar un componente, revisa esta matriz.

| Si modificas... | Revisa impacto en... | Riesgo | Tests a ejecutar |
|-----------------|---------------------|--------|------------------|
| Domain/Entities | DTOs, Repositories, Migrations | Alto | Unit + Integration |
| Application/Services | Controllers, Tests | Medio | Unit |
| Infrastructure/Repositories | Services, Migrations | Alto | Integration |
| Controllers | Frontend, Swagger | Bajo | E2E |
| Stored Procedures | Repositories, Reports | Alto | Integration + Manual |
| Modelos de BD | Entities, Migrations, Reports | Critico | Todo |

---

## Dependencias por Modulo

### Modulo: [NOMBRE]

**Depende de:**
| Componente | Tipo | Criticidad | Notas |
|------------|------|------------|-------|
| [Componente] | [Servicio/BD/API/Libreria] | [Alta/Media/Baja] | [Notas] |

**Es dependencia de:**
| Componente | Tipo | Impacto si falla | Notas |
|------------|------|------------------|-------|
| [Componente] | [Servicio/BD/API] | [Descripcion] | [Notas] |

---

## Integraciones Externas

### [NOMBRE_SISTEMA]

**Tipo de integracion**: [API REST / SOAP / BD directa / Ficheros / Cola mensajes]

**Direccion**: [Consumimos / Exponemos / Bidireccional]

**Credenciales**:
- Ubicacion: [Key Vault / Config / Variable entorno]
- Responsable renovacion: [Nombre/Equipo]

**Endpoints/Recursos**:
| Endpoint | Metodo | Uso | Frecuencia |
|----------|--------|-----|------------|
| [URL/Recurso] | [GET/POST/...] | [Descripcion] | [Por hora/dia/...] |

**Manejo de errores**:
- Timeout: [X segundos]
- Reintentos: [N veces]
- Fallback: [Que hacer si falla]

**Contacto del sistema externo**:
- Equipo: [Nombre]
- Email: [Email]

**Preguntas que Claude debe hacer**:
- "Veo que esta funcionalidad usa [sistema externo]. ¿Hay cambios recientes en su API?"
- "¿Tienes acceso al entorno de pruebas de [sistema]?"
- "¿Conoces el SLA de [sistema]? Lo necesito para configurar timeouts"

---

## Dependencias de Paquetes Criticos

| Paquete | Version | Proposito | Riesgo actualizacion |
|---------|---------|-----------|---------------------|
| [Nombre] | [X.Y.Z] | [Para que se usa] | [Alto/Medio/Bajo] |

**Paquetes con vulnerabilidades conocidas**:
| Paquete | Vulnerabilidad | Severidad | Plan de accion |
|---------|---------------|-----------|----------------|
| [Nombre] | [CVE-XXXX] | [Critica/Alta/Media] | [Actualizar/Mitigar/Aceptar] |

---

## Flujos Criticos

### Flujo: [NOMBRE_FLUJO]

**Descripcion**: [Que hace este flujo]

**Componentes involucrados**:
```
[Componente A] → [Componente B] → [Componente C] → [Resultado]
       │               │               │
       ▼               ▼               ▼
   [Dependencia]   [Dependencia]   [Dependencia]
```

**Puntos de fallo**:
1. Si falla [X]: [Consecuencia]
2. Si falla [Y]: [Consecuencia]

**Monitoreo**:
- Metricas: [Que se mide]
- Alertas: [Cuando se dispara]

---

## Preguntas que Claude debe hacer sobre dependencias

### Antes de Cualquier Cambio
1. "He detectado las siguientes dependencias para [componente]: [lista]. ¿Son correctas?"
2. "¿Hay dependencias no documentadas que deba conocer?"
3. "¿Este cambio puede afectar a integraciones con [sistemas externos]?"

### Sobre Integraciones
4. "¿El sistema [X] esta disponible en el entorno de desarrollo?"
5. "¿Hay datos de prueba para simular respuestas de [sistema externo]?"
6. "¿Quien es el contacto si hay problemas con [integracion]?"

### Sobre Base de Datos
7. "¿Hay stored procedures que usen las tablas que voy a modificar?"
8. "¿Otras aplicaciones leen estas tablas directamente?"
9. "¿Hay jobs nocturnos que puedan verse afectados?"

### Sobre Paquetes
10. "¿Hay restricciones para actualizar [paquete]?"
11. "¿Este paquete tiene licencia compatible con uso comercial?"

---

## Alertas de Dependencias

> Claude: Mostrar estas alertas cuando se trabaje en areas relacionadas

| Area | Alerta | Accion |
|------|--------|--------|
| [Area] | [Mensaje de alerta] | [Que hacer] |

---

**Ultima actualizacion**: [YYYY-MM-DD]
**Actualizado por**: [Nombre]
