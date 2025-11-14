# Scout Scan Command

Analyze Docker images for vulnerabilities using Docker Scout.

## Task

1. List all available Docker images
2. For each image (excluding `<none>`):
   - Run `docker scout cves <image> --only-severity critical,high`
   - Display vulnerability count
   - Show summary of critical and high severity issues
3. Provide remediation recommendations
4. Generate a summary report

Focus on actionable findings and prioritize critical/high severity vulnerabilities.
