# Scout Compare Command

Compare Docker image versions to track vulnerability changes.

## Task

1. Accept two image tags as input
2. Run Docker Scout analysis on both:
   - `docker scout cves <image1>`
   - `docker scout cves <image2>`
3. Compare vulnerability counts:
   - Critical vulnerabilities delta
   - High severity delta
   - New vulnerabilities introduced
   - Fixed vulnerabilities
4. Provide upgrade/downgrade recommendation
5. Generate comparison report

Show before/after vulnerability metrics clearly.
