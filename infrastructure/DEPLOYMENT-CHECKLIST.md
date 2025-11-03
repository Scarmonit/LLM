# Infrastructure Deployment Checklist

## Prerequisites

### 1. AWS Credentials

**Option A: AWS CLI Configuration**
```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (us-east-1)
# - Default output format (json)
```

**Option B: AWS SSO**
```bash
aws configure sso
# Follow prompts to set up SSO
aws sso login --profile your-profile
```

**Verify credentials:**
```bash
aws sts get-caller-identity
# Should return your account ID and user ARN
```

### 2. GitHub Token (for CodePipeline)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (all)
   - `admin:repo_hook` (read:repo_hook, write:repo_hook)
4. Copy token
5. Store in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name github-token \
  --description "GitHub personal access token for CodePipeline" \
  --secret-string '{"token":"YOUR_GITHUB_TOKEN_HERE"}'
```

### 3. Cloudflare Credentials (Optional)

1. Log in to Cloudflare dashboard
2. Go to "My Profile" → "API Tokens"
3. Click "Create Token"
4. Use "Edit Zone DNS" template
5. Select your zone
6. Copy token

Get Zone ID:
- Go to your domain in Cloudflare
- Zone ID is on the right sidebar under "API" section

**Set environment variables:**
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id_here"
```

Add to `~/.bashrc` or `~/.bash_profile` for persistence:
```bash
echo 'export CLOUDFLARE_API_TOKEN="your_token"' >> ~/.bashrc
echo 'export CLOUDFLARE_ZONE_ID="your_zone_id"' >> ~/.bashrc
source ~/.bashrc
```

### 4. Node.js Dependencies

```bash
cd infrastructure
npm install
```

## Deployment Steps

### Quick Deployment (All Components)

```bash
cd infrastructure
chmod +x deploy-all.sh
./deploy-all.sh
```

This deploys:
- ✅ S3 backup Lambda + EventBridge schedule
- ✅ CodePipeline CI/CD
- ✅ Cloudflare CDN (if credentials set)
- ✅ SNS notifications
- ✅ CloudWatch alarms

### Step-by-Step Deployment

#### Step 1: S3 Backup Infrastructure

```bash
# Deploy CloudFormation stack
npm run deploy:backup

# Update Lambda code
npm run update:lambda

# Test backup
npm run test:backup
```

**Expected output:**
```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "message": "Backup completed: X/X objects backed up successfully",
    "timestamp": "2025-11-03T...",
    "backupLocation": "s3://scarmonit-docs-backup/backups/2025-11-03T.../",
    "stats": {
      "total": X,
      "successful": X,
      "failed": 0
    }
  }
}
```

**Verify:**
- Check email for SNS subscription confirmation
- Confirm subscription
- Check backup bucket: `aws s3 ls s3://scarmonit-docs-backup/backups/`

#### Step 2: CodePipeline Infrastructure

```bash
# Ensure GitHub token is set (see Prerequisites)
# Deploy pipeline
npm run deploy:pipeline

# Verify
npm run status:pipeline
```

**Expected output:**
```json
{
  "pipelineName": "automated-deployment-pipeline",
  "stageStates": [
    {
      "stageName": "Source",
      "latestExecution": {
        "status": "Succeeded"
      }
    },
    // ...
  ]
}
```

**Verify:**
- Push a commit to your GitHub repo
- Watch pipeline execute automatically
- Check S3 bucket for deployed files

#### Step 3: Cloudflare CDN (Optional)

```bash
# Ensure credentials are set (see Prerequisites)
npm run deploy:cloudflare
```

**Expected output:**
```
============================================================================
🌐 Cloudflare CDN Integration Setup
============================================================================

[Cloudflare] Creating DNS record for docs.scarmonit.com -> scarmonit-docs.s3...
[Cloudflare] ✅ DNS record created: abc123...
[Cloudflare] Creating page rules for optimization
[Cloudflare] ✅ Page rule created: def456...
[Cloudflare] Configuring cache settings
[Cloudflare] ✅ Updated browser_cache_ttl = 14400
[Cloudflare] ✅ Updated cache_level = aggressive
...

✅ Cloudflare CDN Integration Complete!

📊 Your S3 content is now available at:
   https://docs.scarmonit.com
```

**Verify:**
- Wait 5 minutes for DNS propagation
- Test: `curl -I https://docs.scarmonit.com`
- Should see Cloudflare headers (cf-ray, cf-cache-status)

## Post-Deployment Verification

### 1. S3 Backups

**Check Lambda logs:**
```bash
npm run logs:backup
```

**Verify backup schedule:**
```bash
aws events describe-rule --name s3-backup-daily-schedule
```

**List backups:**
```bash
aws s3 ls s3://scarmonit-docs-backup/backups/ --recursive
```

### 2. CodePipeline

**Check pipeline status:**
```bash
npm run status:pipeline
```

**View build logs:**
```bash
npm run logs:build
```

**Test pipeline:**
```bash
# Make a change and push to GitHub
git commit --allow-empty -m "Test pipeline"
git push

# Watch pipeline execute
aws codepipeline get-pipeline-state --name automated-deployment-pipeline
```

### 3. Cloudflare CDN

**Test DNS:**
```bash
dig docs.scarmonit.com +short
# Should return Cloudflare IP
```

**Test CDN:**
```bash
curl -I https://docs.scarmonit.com
# Look for: cf-ray, cf-cache-status headers
```

**Check cache:**
```bash
# First request (cache MISS)
curl -s -o /dev/null -w "%{http_code} - %{header_json}\n" https://docs.scarmonit.com

# Second request (should be cache HIT)
curl -s -o /dev/null -w "%{http_code} - %{header_json}\n" https://docs.scarmonit.com
```

## Monitoring

### CloudWatch Dashboards

Create custom dashboard:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name InfrastructureMonitoring \
  --dashboard-body file://monitoring-dashboard.json
```

### Set up Alarms

Alarms are automatically created by CloudFormation:
- Lambda errors
- Pipeline failures
- CodeBuild failures

**View alarms:**
```bash
aws cloudwatch describe-alarms
```

### SNS Notifications

**Subscribe additional emails:**
```bash
aws sns subscribe \
  --topic-arn $(aws cloudformation describe-stacks \
      --stack-name s3-backup-infrastructure \
      --query 'Stacks[0].Outputs[?OutputKey==`SNSTopicArn`].OutputValue' \
      --output text) \
  --protocol email \
  --notification-endpoint additional-email@example.com
```

## Troubleshooting

### Lambda Backup Fails

**Symptoms:** No backups in S3, error emails

**Debug:**
```bash
# Check logs
npm run logs:backup

# Check IAM permissions
aws iam get-role-policy \
  --role-name s3-backup-lambda-role \
  --policy-name S3BackupPolicy

# Test manually
npm run test:backup
```

**Common fixes:**
- Increase Lambda timeout (default: 900s)
- Increase memory (default: 512MB)
- Check S3 bucket permissions
- Verify source bucket exists

### Pipeline Fails

**Symptoms:** Pipeline shows failed status

**Debug:**
```bash
# Check pipeline state
npm run status:pipeline

# Check build logs
npm run logs:build

# Check GitHub webhook
aws codepipeline list-webhooks
```

**Common fixes:**
- Update GitHub token
- Check buildspec.yml syntax
- Verify IAM permissions
- Increase CodeBuild timeout

### Cloudflare Issues

**Symptoms:** DNS not resolving, SSL errors

**Debug:**
```bash
# Check DNS
dig docs.scarmonit.com +trace

# Check SSL
curl -vI https://docs.scarmonit.com 2>&1 | grep -i ssl

# Check Cloudflare API
curl -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json"
```

**Common fixes:**
- Wait for DNS propagation (5-30 minutes)
- Set SSL mode to "Flexible" (not "Full")
- Enable "Proxy" (orange cloud) on DNS record
- Purge cache: `npm run purge:cache`

## Maintenance

### Update Lambda Code

1. Edit `s3-backup-lambda.js`
2. Deploy: `npm run update:lambda`
3. Test: `npm run test:backup`

### Update Pipeline Configuration

1. Edit `codepipeline-config.yaml`
2. Deploy: `npm run deploy:pipeline`
3. Verify: `npm run status:pipeline`

### Rotate GitHub Token

```bash
# Create new token on GitHub
# Update secret
aws secretsmanager put-secret-value \
  --secret-id github-token \
  --secret-string '{"token":"NEW_TOKEN"}'

# Restart pipeline
npm run test:pipeline
```

### Change Backup Schedule

1. Edit `s3-backup-cloudformation.yaml`:
   ```yaml
   ScheduleExpression: cron(0 2 * * ? *)  # 2 AM UTC
   # Change to:
   ScheduleExpression: cron(0 14 * * ? *)  # 2 PM UTC
   ```
2. Deploy: `npm run deploy:backup`

## Cleanup

### Remove All Infrastructure

```bash
npm run cleanup
```

**Manual cleanup:**
```bash
# Delete CodePipeline
aws cloudformation delete-stack --stack-name codepipeline-infrastructure

# Delete S3 Backup
aws cloudformation delete-stack --stack-name s3-backup-infrastructure

# Delete backup bucket (optional)
aws s3 rm s3://scarmonit-docs-backup --recursive
aws s3 rb s3://scarmonit-docs-backup

# Delete GitHub token secret
aws secretsmanager delete-secret \
  --secret-id github-token \
  --force-delete-without-recovery

# Remove Cloudflare configuration (manual via dashboard)
```

## Cost Monitoring

### View Current Costs

```bash
# Last 7 days
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost

# By service
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

### Set Cost Alerts

```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget-config.json
```

## Support

For issues or questions:
- Email: scarmonit@gmail.com
- GitHub Issues: [Create issue](https://github.com/scarmonit/infrastructure-automation/issues)
- AWS Support: [AWS Support Center](https://console.aws.amazon.com/support/home)
- Cloudflare Support: [Cloudflare Help Center](https://support.cloudflare.com/)

---

**Last Updated:** 2025-11-03
