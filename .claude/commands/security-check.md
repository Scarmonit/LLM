# Security Check

Systematic security vulnerability assessment using OWASP + 2025 threat intelligence.

**Usage:** `/security-check <file or feature description>`

**What it does:**
1. Analyzes code for common vulnerabilities
2. Searches OWASP Top 10 + 2025 threat landscape
3. Uses sequential thinking for threat modeling
4. Provides prioritized remediation plan
5. Stores findings in knowledge graph

**Example:**
```bash
/security-check src/auth/login-handler.js
```

---

Security assessment for: {{arg:target}}

Process:
1. If code provided, analyze for:
   - OWASP Top 10 (2025): Injection, Auth failures, XSS, CSRF, etc.
   - Input validation gaps
   - Sensitive data exposure
   - Insecure dependencies
   - Missing security headers

2. Use WebSearch for:
   - Latest OWASP Top 10 (2025 update)
   - Recent CVEs for detected libraries
   - Emerging threat patterns
   - Security best practices for detected frameworks

3. Use mcp__sequential-thinking to:
   - Rank vulnerabilities by severity (CVSS)
   - Identify exploitability
   - Prioritize fixes by risk × effort

4. Output:
   - Critical vulnerabilities (fix immediately)
   - High/medium/low priority issues
   - Specific remediation code examples
   - Prevention strategies
   - Security testing recommendations

5. Store assessment in mcp__memory for compliance tracking
