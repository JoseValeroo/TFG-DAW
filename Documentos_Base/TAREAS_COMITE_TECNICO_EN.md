# Pending Tasks - Technical Committee

List of items to review and complete in the project template.

---

## 1. Version Control (Git)

### 1.1 Commit Policy
- [ ] Define commit message format (Conventional Commits, etc.)
- [ ] Required prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- [ ] Maximum message line length
- [ ] Commit language (Spanish/English)
- [ ] Required ticket/issue reference
- [ ] Example: `feat(auth): add Azure AD login [#123]`

### 1.2 Branching Strategy
- [ ] Confirm model: GitFlow, GitHub Flow, Trunk-based
- [ ] Branch naming: `feature/`, `bugfix/`, `hotfix/`, `release/`
- [ ] Main branch: `main` or `master`
- [ ] Development branch: `develop` (if applicable)
- [ ] Merge policy: squash, rebase, merge commit

### 1.3 Pull Requests
- [ ] PR template (description, checklist, testing)
- [ ] Minimum number of approvals
- [ ] Required reviewers by area
- [ ] Required automated checks (CI, linting, tests)
- [ ] Conflict resolution policy

### 1.4 Branch Protection
- [ ] Protected branches (main, develop)
- [ ] Require PR for merge
- [ ] Require approved reviews
- [ ] Require passed CI checks
- [ ] Prohibit direct push

---

## 2. Command Glossary

### 2.1 Git
- [ ] Daily basic commands
- [ ] Branching commands
- [ ] Conflict resolution
- [ ] Emergency commands (reset, revert, cherry-pick)
- [ ] Recommended aliases

### 2.2 .NET CLI
- [ ] Create solution and projects
- [ ] NuGet package management
- [ ] Build and publish
- [ ] Running tests
- [ ] Database migrations

### 2.3 Docker
- [ ] Basic commands
- [ ] Docker Compose
- [ ] Resource cleanup
- [ ] Container debugging

### 2.4 Azure CLI
- [ ] Login and subscriptions
- [ ] Resource deployment
- [ ] Key Vault
- [ ] App Service
- [ ] SQL Database

---

## 3. Code Conventions

### 3.1 Naming
- [ ] Classes: PascalCase
- [ ] Methods: PascalCase
- [ ] Local variables: camelCase
- [ ] Constants: UPPER_SNAKE_CASE or PascalCase
- [ ] Interfaces: IPrefix
- [ ] Files and folders

### 3.2 Project Structure
- [ ] Namespace organization
- [ ] Location of DTOs, ViewModels, etc.
- [ ] Separation of concerns
- [ ] Resource folders

### 3.3 Formatting
- [ ] Standard EditorConfig
- [ ] IDE configuration
- [ ] Static analysis rules
- [ ] Allowed exceptions

---

## 4. Configuration Files

### 4.1 Required at Root
- [ ] `.gitignore` (.NET + IDE template)
- [ ] `.editorconfig` (code formatting)
- [ ] `README.md` (main documentation)
- [ ] `LICENSE` (if applicable)
- [ ] `.gitattributes` (line endings, LFS)

### 4.2 Optional/Recommended
- [ ] `CONTRIBUTING.md` (contribution guide)
- [ ] `SECURITY.md` (security policy)
- [ ] `CHANGELOG.md` (change history)
- [ ] `.github/` or `.azuredevops/` (templates, workflows)
- [ ] `docker-compose.yml`
- [ ] `Directory.Build.props` (centralized configuration)

### 4.3 Issue/PR Templates
- [ ] Bug report template
- [ ] Feature request template
- [ ] Pull request template
- [ ] Standard labels

---

## 5. Code Quality

### 5.1 Static Analysis
- [ ] Tool: SonarQube, Roslyn Analyzers, etc.
- [ ] Enabled/disabled rules
- [ ] Quality thresholds (quality gates)
- [ ] CI/CD integration

### 5.2 Automatic Formatting
- [ ] dotnet format
- [ ] Pre-commit hooks
- [ ] CI verification

### 5.3 Code Review
- [ ] Review checklist
- [ ] Approval criteria
- [ ] What to look for: security, performance, maintainability
- [ ] Constructive feedback

---

## 6. Testing

### 6.1 Conventions
- [ ] Test naming: `Method_Scenario_ExpectedResult`
- [ ] AAA structure: Arrange, Act, Assert
- [ ] Test location (same project or separate)
- [ ] Mocking: Moq, NSubstitute, etc.

### 6.2 Coverage
- [ ] Minimum threshold: 70%
- [ ] Coverage tool
- [ ] Reports and visualization
- [ ] Allowed exclusions

### 6.3 Test Types
- [ ] Unit: mandatory
- [ ] Integration: mandatory for critical endpoints
- [ ] E2E: recommended for main flows
- [ ] Performance: as needed

---

## 7. Documentation

### 7.1 Code
- [ ] XML comments on public APIs
- [ ] README per project/module
- [ ] Architecture documentation (ADRs)
- [ ] Diagrams: C4, sequence, etc.

### 7.2 API
- [ ] Swagger/OpenAPI
- [ ] Usage examples
- [ ] Error codes
- [ ] Authentication

### 7.3 Operations
- [ ] Runbooks
- [ ] Troubleshooting guides
- [ ] Backup/restore procedures
- [ ] Escalation contacts

---

## 8. Security

### 8.1 Secrets
- [ ] Never in source code
- [ ] Azure Key Vault mandatory
- [ ] Secret rotation
- [ ] Environment-based access

### 8.2 Dependencies
- [ ] Automatic scanning (Dependabot, Snyk)
- [ ] Update policy
- [ ] Critical vulnerabilities: resolution SLA

### 8.3 OWASP
- [ ] Top 10 checklist included
- [ ] Input validation
- [ ] Output sanitization
- [ ] Security headers

---

## 9. CI/CD

### 9.1 CI Pipeline
- [ ] Trigger: PR, push to develop/main
- [ ] Steps: restore, build, test, analyze
- [ ] Generated artifacts
- [ ] Failure notifications

### 9.2 CD Pipeline
- [ ] Environments: dev, staging, prod
- [ ] Manual approvals
- [ ] Automatic rollback
- [ ] Post-deploy smoke tests

### 9.3 Infrastructure as Code
- [ ] ARM, Bicep, or Terraform
- [ ] Versioned alongside code
- [ ] Infrastructure change review

---

## 10. AI Tools

### 10.1 Claude Code
- [ ] Project context (Documentos_Base)
- [ ] Recommended prompts by phase
- [ ] Limitations and warnings
- [ ] Mandatory human review

### 10.2 GitHub Copilot
- [ ] Recommended configuration
- [ ] Usage best practices
- [ ] What not to do with Copilot
- [ ] Suggestion review

### 10.3 AI Policies
- [ ] All AI code requires code review
- [ ] No sensitive data in prompts
- [ ] AI usage logging (optional)
- [ ] Intellectual property

---

## 11. Development Environment

### 11.1 Requirements
- [ ] SDK/runtime versions
- [ ] Supported IDEs
- [ ] Recommended extensions
- [ ] Local Docker configuration

### 11.2 Onboarding
- [ ] Step-by-step setup guide
- [ ] Required access (repos, Azure, etc.)
- [ ] Help contacts
- [ ] Common FAQs

---

## 12. To Be Defined

### High Priority
- [ ] **Commit policy** - format and conventions
- [ ] **Command glossary** - quick reference
- [ ] **Standard .gitignore** - complete template
- [ ] **.editorconfig** - formatting rules
- [ ] **PR template** - review checklist

### Medium Priority
- [ ] Issue templates
- [ ] Standard labels for issues
- [ ] Code review guide
- [ ] ADR template (Architecture Decision Records)

### Low Priority
- [ ] CONTRIBUTING.md
- [ ] CODE_OF_CONDUCT.md
- [ ] Recommended git aliases
- [ ] Utility scripts

---

## Task Assignment

| Area | Responsible | Deadline |
|------|-------------|----------|
| Commit policy | [To be assigned] | [To be defined] |
| Command glossary | [To be assigned] | [To be defined] |
| Code conventions | [To be assigned] | [To be defined] |
| Configuration files | [To be assigned] | [To be defined] |
| Git templates | [To be assigned] | [To be defined] |

---

## Next Steps

1. Review this list in technical committee meeting
2. Prioritize pending items
3. Assign responsible parties
4. Establish deadlines
5. Create corresponding documents/files
6. Integrate into project template
7. Validate with pilot project

---

**Version:** 1.0
**Date:** December 2025
**Responsible:** OTD Technical Committee
