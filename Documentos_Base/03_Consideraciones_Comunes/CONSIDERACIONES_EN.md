# Common Considerations

Regulations, legal requirements, and cross-cutting warnings for OTD projects - Universidad Pontificia Comillas.

---

## 1. Data Protection (GDPR/LOPDGDD)

### 1.1 Legal Framework

| Regulation | Scope | Compliance |
|------------|-------|------------|
| **GDPR** (EU Regulation 2016/679) | Personal data of EU citizens | Mandatory |
| **LOPDGDD** (Spanish Law 3/2018) | Spanish adaptation | Mandatory |
| **Comillas Policy** | Internal regulations | Mandatory |

### 1.2 Compliance Checklist

#### Before Starting the Project

- [ ] Identify what personal data will be processed
- [ ] Determine the legal basis for processing (consent, contract, legitimate interest...)
- [ ] Verify if Impact Assessment (DPIA) is needed
- [ ] Consult with Comillas DPO if there are doubts

#### During Development

- [ ] Implement explicit consent where necessary
- [ ] Design forms with acceptance checkboxes (not pre-checked)
- [ ] Include links to privacy policy
- [ ] Implement right of access, rectification, and erasure
- [ ] Encrypt sensitive data in database
- [ ] Logs of personal data access

#### Sensitive Data (Special Categories)

**Require additional protection:**
- Health data
- Ethnic origin
- Political opinions
- Religious beliefs
- Biometric data
- Sexual orientation

**Mandatory measures:**
- AES-256 encryption at rest
- Role-based access restriction
- Complete audit logs
- Documented explicit consent

### 1.3 Data Retention

| Data type | Maximum period | Action upon expiry |
|-----------|----------------|-------------------|
| Session data | Session duration | Automatically delete |
| Access logs | 2 years | Anonymize or delete |
| Academic data | According to regulations | Archive or delete |
| Contact data | While relationship lasts | Request renewal or delete |

### 1.4 International Transfers

- **Within EU/EEA:** Permitted without restrictions
- **Outside EU:** Requires additional guarantees (standard clauses, adequacy decision)
- **Azure servers:** Verify datacenter location (prefer Europe)

---

## 2. Accessibility (WCAG 2.1)

### 2.1 Mandatory Compliance

| Project type | Required level | Regulation |
|--------------|----------------|-----------|
| Public Comillas websites | AA | RD 1112/2018 |
| Internal applications | AA (recommended) | Best practices |
| Mobile apps | AA | EU Directive 2016/2102 |

### 2.2 Checklist by WCAG Principle

#### Perceivable
- [ ] Alternative texts on images (`alt`)
- [ ] Subtitles on videos
- [ ] Minimum contrast 4.5:1 (normal text)
- [ ] Content adaptable to different sizes
- [ ] Don't rely on color alone to convey information

#### Operable
- [ ] Full keyboard navigation
- [ ] Sufficient time to read/interact
- [ ] No content that causes seizures (flashing)
- [ ] Navigation aids (breadcrumbs, skip links)
- [ ] Visible focus on interactive elements

#### Understandable
- [ ] Page language declared (`lang="en"`)
- [ ] Consistent navigation
- [ ] Form labels
- [ ] Clear error messages and suggestions
- [ ] Contextual help available

#### Robust
- [ ] Valid and semantic HTML
- [ ] ARIA used correctly
- [ ] Compatible with assistive technologies
- [ ] Works in different browsers

### 2.3 Validation Tools

| Tool | Use | URL |
|------|-----|-----|
| WAVE | Automatic analysis | webaim.org/wave |
| axe DevTools | Browser extension | deque.com/axe |
| Lighthouse | Chrome audit | Built into DevTools |
| NVDA | Screen reader (testing) | nvaccess.org |

### 2.4 Accessibility Declaration

**Mandatory on public websites:** Include "Accessibility" page with:
- Conformance status
- Non-accessible content (if any)
- Contact mechanism for issues
- Last review date

---

## 3. Comillas Internal Regulations

### 3.1 Corporate Identity

- [ ] Use official logos (request from Communications)
- [ ] Respect corporate color palette
- [ ] Authorized fonts
- [ ] Footer with required legal information

### 3.2 Domains and URLs

| Type | Format | Example |
|------|--------|---------|
| Production | *.comillas.edu | app.comillas.edu |
| Development | *.dev.comillas.edu | app.dev.comillas.edu |
| APIs | api.*.comillas.edu | api.app.comillas.edu |

**Process for new domain:**
1. Request from IT
2. Approve with Communications
3. Configure SSL certificate
4. Add to corporate DNS

### 3.3 Corporate Authentication

**Mandatory method:** Comillas Azure AD

```csharp
// Integration with corporate Azure AD
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));
```

**Required configuration:**
- Comillas TenantId
- Application ClientId (request from IT)
- Approved Redirect URIs

### 3.4 Email

**For sending from applications:**
- Use corporate SMTP server (request credentials)
- Sender domain: @comillas.edu
- Include corporate signature in formal emails
- Don't send more than X emails/hour (check limits)

---

## 4. Integrations with Existing Systems

### 4.1 Comillas Core Systems

| System | Type | Contact |
|--------|------|---------|
| **Oracle/PeopleSoft** | Academic ERP | IT - Systems |
| **Moodle** | LMS | IT - Education |
| **SharePoint** | Documents | IT - Collaboration |
| **Power BI** | Reporting | IT - BI |

### 4.2 Integration Process

```
1. Identify integration need
       ↓
2. Contact system owner
       ↓
3. Request API/interface documentation
       ↓
4. Define scope and data to exchange
       ↓
5. Develop in test environment
       ↓
6. Joint integration testing
       ↓
7. Approval and production deployment
```

### 4.3 Technical Considerations

#### Oracle/Legacy databases

- May require ADO.NET instead of Dapper
- Verify Oracle Client version
- Specific connection strings (TNS)
- Possible existing stored procedures

#### Existing REST APIs

- Request Swagger/OpenAPI documentation
- Verify required authentication
- Rate limits and quotas
- Availability SLAs

### 4.4 Master Data

**Source of truth for:**

| Data | Origin system | How to obtain |
|------|---------------|---------------|
| Users/employees | Azure AD | Microsoft Graph API |
| Students | Oracle/PeopleSoft | Specific API |
| Subjects | Oracle/PeopleSoft | Specific API |
| Organizational structure | HR | Consult with HR |

**Rule:** Don't duplicate master data. Always consume from source system.

---

## 5. Auditing and Traceability

### 5.1 Logging Requirements

#### Mandatory to Log

| Event | Data to save | Retention |
|-------|--------------|-----------|
| Login/Logout | User, IP, timestamp, result | 2 years |
| Sensitive data access | User, accessed data, timestamp | 2 years |
| Modifications | User, before/after, timestamp | 2 years |
| Deletions | User, deleted data, timestamp | 5 years |
| Security errors | Complete detail | 2 years |

#### Prohibited to Log

- Passwords (not even encrypted)
- Complete session tokens
- Credit card data
- Medical data in plain text

### 5.2 Implementation

```csharp
// Audit service
public class AuditService : IAuditService
{
    public async Task LogAccessAsync(string userId, string resource, string action)
    {
        var audit = new AuditLog
        {
            UserId = userId,
            Resource = resource,
            Action = action,
            Timestamp = DateTime.UtcNow,
            IpAddress = GetClientIp(),
            UserAgent = GetUserAgent()
        };

        await _auditRepository.SaveAsync(audit);
    }
}

// Usage with attribute
[AuditAccess("Academic record")]
public async Task<ExpedienteDto> GetExpediente(string estudianteId)
{
    // ...
}
```

### 5.3 Audit Query

**Who can query:**
- Application administrators
- DPO (for investigations)
- Internal audit (with authorization)

**Required interface:**
- Search by user
- Search by date
- Search by resource/action
- Export to Excel/PDF

---

## 6. Certifications and Special Requirements

### 6.1 User Location

**When applicable:** Applications that require verifying user's physical location (e.g., online exams, time tracking).

**Considerations:**
- Request geolocation permission
- Inform user of purpose
- Store with limited precision (not exact)
- Alternatives if user refuses

### 6.2 Electronic Signature

**When applicable:** Documents requiring signature with legal validity.

**Options:**
- Simple signature (email + checkbox) - limited validity
- Advanced signature (digital certificate) - legal validity
- Qualified signature (qualified provider) - maximum validity

**Recommended provider:** Consult with Secretary General

### 6.3 Electronic Invoicing

**When applicable:** Projects that generate or receive invoices.

**Requirements:**
- Facturae 3.2.x format
- Electronic signature of invoice
- Preservation 4 years minimum
- Integration with FACe if public sector

---

## 7. Environments and Deployments

### 7.1 Mandatory Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| **Development** | Active development | Fictitious data |
| **Staging/Pre** | Acceptance testing | Anonymized data |
| **Production** | Real users | Real data |

### 7.2 Promotion Between Environments

```
Development → Staging → Production
    ↓           ↓           ↓
  Tests      UAT/QA     Continuous
 automated   manual    monitoring
```

**Required approvals:**
- Dev → Staging: Technical Lead
- Staging → Production: PM + Technical Lead

### 7.3 Deployment Windows

| Type | Permitted schedule | Approval |
|------|-------------------|----------|
| Minor (bugfix) | Business hours | Technical Lead |
| Major (features) | Friday afternoon or weekend | PM |
| Critical (security) | Immediate | PM + IT |

---

## 8. Support and Maintenance

### 8.1 Support Levels

| Level | Responsible | Response time |
|-------|-------------|---------------|
| **L1** | IT help desk | 4h business hours |
| **L2** | Development team | 8h business hours |
| **L3** | Technical Lead/Vendor | Per SLA |

### 8.2 Incident Classification

| Severity | Description | Resolution time |
|----------|-------------|-----------------|
| **Critical** | System down, data loss | 4h |
| **High** | Main functionality affected | 8h |
| **Medium** | Secondary functionality affected | 24h |
| **Low** | Improvements, cosmetics | Next sprint |

### 8.3 Support Documentation

**Mandatory to deliver:**
- User manual
- Administration manual
- Operations runbook
- Backup/restore procedure
- Escalation contacts

---

## 9. Final Project Checklist

### 9.1 Before Going to Production

#### Legal and Compliance
- [ ] GDPR: Consents implemented
- [ ] GDPR: Privacy policy published
- [ ] Accessibility: Level AA verified
- [ ] Corporate identity: Logos and colors correct

#### Technical
- [ ] Azure Key Vault configured
- [ ] Blob Storage for files
- [ ] Redis for cache
- [ ] Application Insights active
- [ ] Audit logs working
- [ ] HTTPS with valid certificate
- [ ] Security headers configured

#### Integrations
- [ ] Corporate Azure AD working
- [ ] System APIs connected
- [ ] Integration tests passed

#### Operations
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Runbook documented
- [ ] Support team informed

### 9.2 Periodic Reviews

| Review | Frequency | Responsible |
|--------|-----------|-------------|
| Security (dependencies) | Monthly | Technical Lead |
| Accessibility | Quarterly | QA |
| GDPR compliance | Semi-annual | DPO |
| Log audit | Annual | Internal audit |

---

## 10. Reference Contacts

### 10.1 Comillas Internal

| Area | Contact | For what |
|------|---------|----------|
| **IT - Systems** | [email] | Infrastructure, servers |
| **IT - Development** | [email] | APIs, integrations |
| **DPO** | [email] | Data protection |
| **Communications** | [email] | Corporate identity |
| **Secretary General** | [email] | Regulations, legal |

### 10.2 External

| Service | Provider | Contact |
|---------|----------|---------|
| Azure | Microsoft | Azure Portal |
| SSL Certificates | [Provider] | [Contact] |
| Electronic signature | [Provider] | [Contact] |

---

**Version:** 1.0
**Date:** December 2025
**Owner:** OTD Technical Committee
**Last review:** [Date]
**Next review:** [Date + 6 months]

---

## Change History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 2025 | Initial version | Technical Committee |
