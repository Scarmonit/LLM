# /deploy - Autonomous Production Deployment

**Description:** Full production deployment with health checks and rollback capability

**Usage:** `/deploy [environment] [service]`

**Environments:** `production`, `staging`, `development`

---

## EXECUTION PROTOCOL

### Phase 1: Pre-Deployment Checks

1. **Verify Environment**
   - Check deployment configs exist
   - Verify credentials/secrets available
   - Confirm target environment accessible

2. **Run Tests**
   ```bash
   npm test || pytest || go test || mvn test
   ```
   - Must pass 100% before deploying

3. **Build Application**
   - Docker: `docker build -t <image>:<tag>`
   - Node: `npm run build`
   - Go: `go build`
   - Python: Build wheel/distribution

4. **Security Scan**
   ```bash
   docker scout cves <image>
   npm audit
   ```
   - Fix critical vulnerabilities automatically

### Phase 2: Deployment

**Auto-detect deployment method:**

1. **Docker/Kubernetes**
   ```bash
   docker tag <image> <registry>/<image>:<tag>
   docker push <registry>/<image>:<tag>
   kubectl apply -f k8s/
   kubectl rollout status deployment/<name>
   ```

2. **Serverless (Vercel/Netlify)**
   ```bash
   vercel --prod
   # or
   netlify deploy --prod
   ```

3. **Docker Compose**
   ```bash
   docker-compose pull
   docker-compose up -d --remove-orphans
   ```

4. **Cloud Platforms**
   - AWS: `eb deploy` or `sam deploy`
   - GCP: `gcloud app deploy`
   - Azure: `az webapp up`

### Phase 3: Health Checks

1. **Wait for Deployment**
   - Poll deployment status
   - Max wait: 5 minutes

2. **Run Health Checks**
   ```bash
   curl -f <health-endpoint>
   # Check response codes, latency
   ```

3. **Smoke Tests**
   - Critical path testing
   - Database connectivity
   - External services reachable

### Phase 4: Post-Deployment

1. **Tag Release**
   ```bash
   git tag -a v<version> -m "Production release <version>"
   git push --tags
   ```

2. **Notifications**
   - Slack/Discord webhook (if configured)
   - GitHub deployment event
   - Log deployment

3. **Monitoring**
   - Check metrics for 2 minutes
   - Watch for error spikes
   - Monitor resource usage

## ROLLBACK CAPABILITY

**Auto-rollback if:**
- ❌ Health checks fail
- ❌ Error rate > 5%
- ❌ Response time > 2x baseline
- ❌ Critical service down

**Rollback procedure:**
```bash
kubectl rollout undo deployment/<name>
# or
docker-compose down && docker-compose up -d <previous-image>
# or
vercel rollback
```

## DEPLOYMENT STRATEGIES

**Blue-Green:**
- Deploy to new environment
- Switch traffic when ready
- Keep old version for instant rollback

**Canary:**
- Deploy to small percentage of traffic
- Monitor metrics
- Gradually increase if healthy

**Rolling:**
- Update instances one by one
- Zero downtime
- Automatic rollback on failure

## ENVIRONMENT CONFIGS

**Auto-load from:**
- `.env.production`
- `k8s/secrets.yaml`
- GitHub Secrets (for CI/CD)
- Vault/AWS Secrets Manager

## EXAMPLES

```bash
# Deploy to production (auto-detect everything)
/deploy production

# Deploy specific service to staging
/deploy staging api-server

# Deploy with specific strategy
/deploy production canary
```

## SAFETY FEATURES

**Production safeguards:**
- ✅ Require all tests passing
- ✅ Security scan clean
- ✅ Tag version automatically
- ✅ Backup before deploy (if applicable)
- ✅ Health checks mandatory
- ✅ Auto-rollback on failure

**NO MANUAL STEPS. FULLY AUTOMATED.**
