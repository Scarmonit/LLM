---
description: Dependency analysis and management
argument-hint: <package-file>
---

# Dependency Analysis

Analyze dependencies for: **$ARGUMENTS** (default: package.json, requirements.txt, Cargo.toml)

## Analysis Tasks

1. **Dependency Tree**
   - Direct dependencies
   - Transitive dependencies
   - Dependency depth visualization
   - Circular dependency detection

2. **Version Analysis**
   - Outdated packages
   - Breaking changes in updates
   - Semantic versioning compliance
   - Version conflicts

3. **Security & Licensing**
   - Known vulnerabilities (CVEs)
   - License compatibility
   - Supply chain risks
   - Unmaintained packages

4. **Bundle Size Impact**
   - Package sizes
   - Tree-shaking opportunities
   - Alternative lighter packages
   - Unused dependencies

5. **Optimization Recommendations**
   - Dependency consolidation
   - Lighter alternatives
   - Removal of unused deps
   - Update strategy

## Output

Provide:
- Dependency tree diagram
- Security vulnerability report
- Update recommendations with migration notes
- Bundle size analysis
- Action items prioritized by impact

Use automated tools when available:
- `npm audit` / `npm outdated`
- `pip-audit` / `safety`
- `cargo audit`
