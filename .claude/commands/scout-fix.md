# Scout Fix Command

Get actionable remediation advice for Docker Scout findings.

## Task

1. Analyze the specified Docker image for vulnerabilities
2. For each critical/high vulnerability:
   - Identify the vulnerable package
   - Find the fix version (if available)
   - Provide upgrade command or remediation steps
3. Check for base image updates
4. Recommend Dockerfile improvements:
   - Use non-root user
   - Update base image
   - Pin package versions
5. Generate a fix implementation plan

Provide specific, actionable steps to resolve each issue.
