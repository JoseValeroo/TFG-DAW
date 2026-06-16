# Technical Documentation - [Project Name]

> **Instructions**: This template defines the structure for technical documentation.
> Complete each section with project-specific information.
> Remove instructions (italicized text) before publishing.

---

## Document Information

| Field | Value |
|-------|-------|
| **Project** | [Name] |
| **Document version** | [X.Y] |
| **Date** | [YYYY-MM-DD] |
| **Author** | [Name] |
| **Status** | [Draft/Review/Approved] |

---

## Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [YYYY-MM-DD] | [Name] | Initial version |

---

## 1. Introduction

### 1.1 Purpose
*Describe the purpose of this document and its target audience.*

[Text]

### 1.2 Scope
*Describe what this documentation covers and what it doesn't cover.*

[Text]

### 1.3 Definitions and Acronyms

| Term | Definition |
|---------|------------|
| [Term] | [Definition] |

---

## 2. System Overview

### 2.1 Description
*General system description and its business purpose.*

[Text]

### 2.2 Context
*Where this system fits in the organization's ecosystem.*

```
[Context diagram]
```

### 2.3 Stakeholders

| Role | Responsibility | Contact |
|-----|-----------------|----------|
| [Role] | [Responsibility] | [Email] |

---

## 3. Architecture

### 3.1 Architecture Diagram

```
[C4 Diagram - Container Level]

┌─────────────────────────────────────────────────────┐
│                    [System]                         │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐                │
│  │   Web App   │───▶│    API      │                │
│  └─────────────┘    └──────┬──────┘                │
│                            │                        │
│                     ┌──────▼──────┐                │
│                     │   Database  │                │
│                     └─────────────┘                │
└─────────────────────────────────────────────────────┘
```

### 3.2 Main Components

| Component | Technology | Responsibility |
|------------|------------|-----------------|
| Frontend | [Tech] | [Description] |
| API | [Tech] | [Description] |
| Database | [Tech] | [Description] |

### 3.3 Patterns Used
*Describe architectural and design patterns used.*

- **Pattern 1**: [Description and rationale]
- **Pattern 2**: [Description and rationale]

### 3.4 Architectural Decisions
*Reference to important ADRs. See `_duran/DECISIONES.md`*

| ADR | Title | Impact |
|-----|--------|---------|
| ADR-001 | [Title] | [Impact] |

---

## 4. Technology Stack

### 4.1 Backend

| Technology | Version | Purpose |
|------------|---------|-----------|
| .NET | [8.0] | Main framework |
| ASP.NET Core | [8.0] | Web API |
| Dapper | [X.Y] | Data access |

### 4.2 Frontend

| Technology | Version | Purpose |
|------------|---------|-----------|
| [Tech] | [X.Y] | [Purpose] |

### 4.3 Database

| Technology | Version | Purpose |
|------------|---------|-----------|
| SQL Server | [2017] | Main database |

### 4.4 Infrastructure

| Service | Purpose |
|----------|-----------|
| Azure App Service | Application hosting |
| Azure SQL Database | Database |
| Azure Key Vault | Secrets management |
| Azure Blob Storage | File storage |
| Redis | Distributed cache |

---

## 5. Data Model

### 5.1 Entity-Relationship Diagram

```
[Simplified ER diagram]
```

### 5.2 Main Tables

#### Table: [Name]

| Column | Type | Description | Constraints |
|---------|------|-------------|-------------|
| Id | int | Identifier | PK, Identity |
| [Field] | [Type] | [Description] | [Constraints] |

### 5.3 Critical Stored Procedures

| Name | Purpose | Parameters |
|--------|-----------|------------|
| [sp_Name] | [Description] | [Params] |

---

## 6. API

### 6.1 Authentication
*Describe authentication mechanism.*

[Azure AD / JWT / etc.]

### 6.2 Main Endpoints

#### [Module]

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/[resource] | [Description] | [Yes/No] |
| POST | /api/[resource] | [Description] | [Yes/No] |

### 6.3 Swagger Documentation
*Reference to Swagger UI.*

URL: `[URL]/swagger`

---

## 7. Security

### 7.1 Authentication and Authorization

| Aspect | Implementation |
|---------|----------------|
| Authentication | Azure AD |
| Authorization | Roles/Claims |
| Tokens | JWT |

### 7.2 Secrets Management

| Secret | Location | Rotation |
|---------|-----------|----------|
| Connection strings | Key Vault | [Frequency] |
| API Keys | Key Vault | [Frequency] |

### 7.3 OWASP Checklist
*Reference to OWASP compliance. See `Documentos_Base/01_Estructura_Tecnica/`*

---

## 8. Integrations

### 8.1 Integrated Systems

| System | Type | Direction | Protocol |
|---------|------|-----------|-----------|
| [System] | [Internal/External] | [Consume/Expose] | [REST/SOAP/etc] |

### 8.2 Integration Detail: [System]

**Purpose**: [Description]

**Endpoints used**:
| Endpoint | Method | Purpose |
|----------|--------|-----------|
| [URL] | [GET/POST] | [Description] |

**Error handling**: [Description]

**Timeout/Retries**: [Configuration]

---

## 9. Deployment

### 9.1 Environments

| Environment | URL | Purpose |
|---------|-----|-----------|
| Development | [URL] | Development |
| Staging | [URL] | Testing |
| Production | [URL] | Production |

### 9.2 CI/CD Pipeline

```
[Pipeline diagram]

Commit → Build → Test → Deploy Dev → Deploy Staging → Approval → Deploy Prod
```

### 9.3 Deployment Requirements

| Requirement | Value |
|-----------|-------|
| Runtime | .NET 8 |
| Memory | [X] GB |
| CPU | [X] cores |

---

## 10. Operations

### 10.1 Monitoring

| Tool | Purpose | Dashboard |
|-------------|-----------|-----------|
| Application Insights | APM, Logs | [URL] |
| Azure Monitor | Infrastructure metrics | [URL] |

### 10.2 Configured Alerts

| Alert | Condition | Action |
|--------|-----------|--------|
| CPU > 80% | 5 consecutive minutes | Email to [team] |
| Errors > 10/min | Instant | [Action] |

### 10.3 Backup and Recovery

| Element | Frequency | Retention | Procedure |
|----------|------------|-----------|---------------|
| Database | [Frequency] | [Days] | [Reference] |

---

## 11. Troubleshooting

### 11.1 Known Issues

| Issue | Symptoms | Solution |
|----------|----------|----------|
| [Issue] | [Symptoms] | [Solution steps] |

### 11.2 Logs

| Log | Location | Purpose |
|-----|-----------|-----------|
| Application | Application Insights | Errors, traces |
| Audit | [Table/File] | User actions |

---

## Appendices

### A. Technical Glossary

| Term | Definition |
|---------|------------|
| [Term] | [Definition] |

### B. References

- [Document 1](URL)
- [Document 2](URL)

---

**End of document**
