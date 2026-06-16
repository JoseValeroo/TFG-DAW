# Registro de Decisiones Arquitectonicas (ADRs)

> **INSTRUCCIONES PARA CLAUDE**: Este archivo documenta las decisiones tecnicas importantes.
> SIEMPRE respeta las decisiones ya tomadas a menos que el desarrollador indique lo contrario.
> Antes de proponer una solucion, verifica que no contradiga decisiones existentes.

---

## Preguntas para Contextualizar (usar en /onboarding)

### Sobre Decisiones Pasadas
- [ ] ¿Por que se eligio [tecnologia/framework] en lugar de alternativas?
- [ ] ¿Hay decisiones que ahora se consideran erroneas pero no se pueden cambiar?
- [ ] ¿Hay restricciones impuestas por cliente/universidad que limiten opciones?
- [ ] ¿Hay deuda tecnica conocida y aceptada?

### Sobre Patrones y Practicas
- [ ] ¿Que patrones de diseno se usan consistentemente?
- [ ] ¿Hay anti-patrones que se deben evitar especificamente?
- [ ] ¿Hay convenios no escritos que el equipo sigue?

### Sobre Evoluccion
- [ ] ¿Hay planes de migracion tecnologica pendientes?
- [ ] ¿Que se haria diferente si se empezara de cero?

---

## Indice de Decisiones

| ID | Titulo | Fecha | Estado | Categoria |
|----|--------|-------|--------|-----------|
| ADR-001 | [Titulo] | [YYYY-MM-DD] | [Aceptada/Deprecada/Reemplazada] | [Arquitectura/Seguridad/BD/...] |

---

## Decisiones Vigentes

### ADR-001: [Titulo de la Decision]

**Estado**: Aceptada
**Fecha**: [YYYY-MM-DD]
**Autor**: [Nombre]
**Categoria**: [Arquitectura/Seguridad/BD/Infraestructura/Frontend/Testing]

#### Contexto
[Cual era el problema o necesidad que habia que resolver]

#### Decision
[Que se decidio hacer]

#### Alternativas Consideradas

| Opcion | Pros | Contras | Por que no |
|--------|------|---------|------------|
| [Opcion A] | [Pros] | [Contras] | [Motivo de descarte] |
| [Opcion B] | [Pros] | [Contras] | [Motivo de descarte] |

#### Consecuencias

**Positivas:**
- [Consecuencia positiva 1]
- [Consecuencia positiva 2]

**Negativas:**
- [Consecuencia negativa/trade-off 1]
- [Consecuencia negativa/trade-off 2]

#### Implicaciones para el Desarrollo
> Claude: Tener en cuenta estas implicaciones al desarrollar

- [Implicacion 1]
- [Implicacion 2]

#### Preguntas que Claude debe hacer relacionadas
- "Veo que se decidio [X]. ¿Sigue siendo valida esta decision para [contexto actual]?"
- "Esta solucion que propongo sigue el patron establecido en ADR-001. ¿Es correcto?"

---

## Decisiones por Categoria

### Arquitectura

| ID | Decision | Resumen |
|----|----------|---------|
| ADR-XXX | [Titulo] | [Resumen de una linea] |

### Seguridad

| ID | Decision | Resumen |
|----|----------|---------|
| ADR-XXX | [Titulo] | [Resumen de una linea] |

### Base de Datos

| ID | Decision | Resumen |
|----|----------|---------|
| ADR-XXX | [Titulo] | [Resumen de una linea] |

### Infraestructura

| ID | Decision | Resumen |
|----|----------|---------|
| ADR-XXX | [Titulo] | [Resumen de una linea] |

---

## Decisiones Deprecadas

> Decisiones que ya no aplican pero se mantienen para contexto historico

### ADR-XXX: [Titulo] (DEPRECADA)

**Estado**: Deprecada
**Fecha deprecacion**: [YYYY-MM-DD]
**Reemplazada por**: [ADR-YYY / Ninguna]
**Motivo de deprecacion**: [Por que ya no aplica]

---

## Deuda Tecnica Aceptada

> Decisiones suboptimas tomadas conscientemente por restricciones de tiempo/recursos

| ID | Descripcion | Impacto | Plan de resolucion |
|----|-------------|---------|-------------------|
| DT-001 | [Descripcion] | [Alto/Medio/Bajo] | [Cuando/como se resolvera] |

---

## Restricciones Externas

> Decisiones impuestas por factores externos que no podemos cambiar

| Restriccion | Origen | Impacto | Fecha limite |
|-------------|--------|---------|--------------|
| SQL Server 2017 | Infraestructura Universidad | Limita features BD | Indefinido |
| Azure AD | Politica seguridad | Autenticacion obligatoria | Indefinido |
| [Otras] | [Origen] | [Impacto] | [Fecha] |

---

## Plantilla para Nueva Decision

```markdown
### ADR-XXX: [Titulo]

**Estado**: Propuesta / Aceptada / Deprecada / Reemplazada
**Fecha**: [YYYY-MM-DD]
**Autor**: [Nombre]
**Categoria**: [Arquitectura/Seguridad/BD/Infraestructura/Frontend/Testing]

#### Contexto
[Descripcion del problema]

#### Decision
[Que se ha decidido]

#### Alternativas Consideradas
[Otras opciones evaluadas]

#### Consecuencias
[Impacto positivo y negativo]

#### Implicaciones para el Desarrollo
[Que debe tener en cuenta Claude/desarrolladores]
```

---

## Preguntas que Claude debe hacer sobre decisiones

### Antes de Proponer Soluciones
1. "¿Hay alguna decision tecnica previa que deba respetar para [este problema]?"
2. "¿La solucion que propongo es consistente con las decisiones de arquitectura existentes?"
3. "¿Hay restricciones externas que limiten las opciones para [esta funcionalidad]?"

### Cuando Detecta Conflictos
4. "Mi propuesta contradice ADR-XXX. ¿Quieres que busque alternativa o actualizamos la decision?"
5. "Esto requiere una decision arquitectonica. ¿Quien debe aprobarla?"

### Cuando Propone Nuevas Decisiones
6. "Recomiendo documentar esta decision como ADR. ¿Quieres que prepare el borrador?"
7. "¿Hay alternativas que debamos considerar antes de decidir?"

---

**Ultima actualizacion**: [YYYY-MM-DD]
**Actualizado por**: [Nombre]
