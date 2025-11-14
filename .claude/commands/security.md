---
description: Security audit and vulnerability analysis
argument-hint: <target-path>
---

# Security Audit

Perform security analysis on: **$ARGUMENTS**

## Security Checks

1. **OWASP Top 10 Vulnerabilities**
   - SQL Injection risks
   - XSS vulnerabilities
   - CSRF protection
   - Authentication/authorization issues
   - Sensitive data exposure
   - Security misconfiguration
   - Insecure dependencies

2. **Code Security**
   - Input validation
   - Output encoding
   - Error handling (info leakage)
   - Cryptography usage
   - Secrets in code

3. **Dependency Security**
   - Outdated packages
   - Known vulnerabilities (CVEs)
   - License compliance

4. **API Security**
   - Authentication mechanisms
   - Rate limiting
   - CORS configuration
   - API key exposure

## Output

Provide:
- **Severity ratings** (Critical, High, Medium, Low)
- **Vulnerability descriptions**
- **Exploit scenarios**
- **Remediation steps** with code examples
- **Compliance notes** (GDPR, HIPAA, etc.)

⚠️ Use `ultrathink` for comprehensive security analysis
