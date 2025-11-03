# Infrastructure Automation Suite

Complete infrastructure-as-code solution for automated deployments, backups, and CDN integration.

## 🎯 Overview

This infrastructure suite provides:

1. **Scheduled S3 Backups** - Automated daily backups with retention policies
2. **CI/CD Pipeline** - Automated deployments on git push
3. **Cloudflare CDN** - Global content delivery with DDoS protection
4. **Monitoring & Alerts** - SNS notifications for all events

## 📁 Directory Structure

```
infrastructure/
├── s3-backup-lambda.js                 # Lambda function for S3 backups
├── s3-backup-cloudformation.yaml       # CloudFormation template for backup infrastructure
├── codepipeline-config.yaml            # CloudFormation template for CI/CD pipeline
├── cloudflare-config.js                # Cloudflare CDN setup script
├── deploy-all.sh                       # One-command deployment script
├── package.json                        # Node.js dependencies
└── README.md                           # This file
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install AWS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure AWS credentials
aws configure
# OR for SSO:
aws sso login --profile your-profile

# Install Node.js dependencies
npm install
```

### One-Command Deployment

Deploy everything at once:

```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

This will:
- ✅ Deploy S3 backup infrastructure
- ✅ Deploy CodePipeline for CI/CD
- ✅ Configure Cloudflare CDN (if credentials provided)
- ✅ Set up monitoring and alerts

## 📦 Component Details

### 1. S3 Backup Infrastructure

**Features:**
- Daily backups at 2 AM UTC (configurable)
- 90-day retention with lifecycle policies
- Automatic transition to Glacier after 30 days
- SNS email notifications
- CloudWatch alarms for failures
- Auto-creates backup bucket if missing

**Manual Deployment:**

```bash
aws cloudformation deploy \
  --template-file s3-backup-cloudformation.yaml \
  --stack-name s3-backup-infrastructure \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides NotificationEmail=your-email@example.com
```

**Update Lambda Code:**

```bash
cd infrastructure
zip s3-backup-lambda.zip s3-backup-lambda.js
aws lambda update-function-code \
  --function-name s3-backup-automation \
  --zip-file fileb://s3-backup-lambda.zip
```

**Test Backup Manually:**

```bash
aws lambda invoke \
  --function-name s3-backup-automation \
  --payload '{}' \
  response.json

cat response.json
```

**Configuration:**

Edit `s3-backup-cloudformation.yaml`:
- `SOURCE_BUCKET`: scarmonit-docs (default)
- `BACKUP_BUCKET`: scarmonit-docs-backup (default)
- Schedule: `cron(0 2 * * ? *)` (2 AM UTC daily)
- Retention: 90 days
- Glacier transition: 30 days

### 2. CodePipeline CI/CD

**Features:**
- Automatic deployment on git push
- Build with CodeBuild (Node.js 20)
- Runs tests and linter
- Deploys to S3
- SNS notifications for pipeline events
- Artifact storage with versioning

**Manual Deployment:**

```bash
# First, create GitHub token secret
aws secretsmanager create-secret \
  --name github-token \
  --description "GitHub personal access token" \
  --secret-string '{"token":"YOUR_GITHUB_TOKEN"}'

# Deploy pipeline
aws cloudformation deploy \
  --template-file codepipeline-config.yaml \
  --stack-name codepipeline-infrastructure \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
      GitHubRepo=owner/repo \
      GitHubBranch=main \
      GitHubTokenSecretArn=arn:aws:secretsmanager:...
```

**BuildSpec Customization:**

The default buildspec:
1. Installs Node.js 20
2. Runs `npm ci --production`
3. Runs `npm test` (optional)
4. Runs `npm run lint` (optional)
5. Runs `npm run build` (optional)
6. Deploys `dist/` or `build/` to S3

Edit `codepipeline-config.yaml` to customize build steps.

**Monitoring:**

```bash
# View pipeline status
aws codepipeline get-pipeline-state --name automated-deployment-pipeline

# View execution history
aws codepipeline list-pipeline-executions --pipeline-name automated-deployment-pipeline

# View build logs
aws codebuild batch-get-builds --ids <build-id>
```

### 3. Cloudflare CDN Integration

**Features:**
- CDN caching for global performance
- DDoS protection
- SSL/TLS encryption (flexible mode)
- Firewall rules for security
- Brotli compression
- Page rules for optimization

**Setup:**

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your_api_token"
export CLOUDFLARE_ZONE_ID="your_zone_id"

# Run setup
node cloudflare-config.js
```

**Get Cloudflare Credentials:**

1. Log in to Cloudflare dashboard
2. Go to "API Tokens" → Create Token
3. Use "Edit Zone DNS" template
4. Zone ID is on the domain overview page

**Purge Cache:**

```bash
node -e "import('./cloudflare-config.js').then(m => m.purgeCache())"
```

**Configuration:**

Edit `cloudflare-config.js`:
- `DOMAIN`: Your subdomain (e.g., docs.example.com)
- `S3_BUCKET_URL`: Your S3 bucket website endpoint
- Cache TTL: 4 hours browser, 2 hours edge
- Security level: Medium

## 🔐 Security

### IAM Permissions

The deployment creates these IAM roles:
- `s3-backup-lambda-role` - Lambda execution role
- `codepipeline-service-role` - CodePipeline execution
- `codebuild-service-role` - CodeBuild execution

### Secrets Management

GitHub token stored in AWS Secrets Manager:

```bash
# Update token
aws secretsmanager put-secret-value \
  --secret-id github-token \
  --secret-string '{"token":"NEW_TOKEN"}'

# Rotate token
aws secretsmanager rotate-secret --secret-id github-token
```

### S3 Bucket Policies

Both buckets have:
- Public access blocked
- Versioning enabled
- Encryption at rest (AES-256)
- Lifecycle policies

## 📊 Monitoring & Alerts

### SNS Topics

Two SNS topics for notifications:
1. `s3-backup-notifications` - Backup success/failure
2. `codepipeline-notifications` - Pipeline events

**Subscribe to Notifications:**

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT:s3-backup-notifications \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### CloudWatch Alarms

Configured alarms:
- Lambda function errors
- Pipeline failures
- CodeBuild failures

**View Alarms:**

```bash
aws cloudwatch describe-alarms --alarm-names s3-backup-failures
```

### Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/s3-backup-automation --follow

# CodeBuild logs
aws logs tail /aws/codebuild/automated-build --follow
```

## 🧪 Testing

### Test S3 Backup

```bash
# Invoke Lambda
aws lambda invoke \
  --function-name s3-backup-automation \
  --log-type Tail \
  output.json

# Check output
cat output.json

# Verify backup bucket
aws s3 ls s3://scarmonit-docs-backup/backups/ --recursive
```

### Test CodePipeline

```bash
# Start execution manually
aws codepipeline start-pipeline-execution \
  --name automated-deployment-pipeline

# Watch progress
aws codepipeline get-pipeline-state \
  --name automated-deployment-pipeline
```

### Test Cloudflare

```bash
# Check DNS propagation
dig docs.scarmonit.com

# Test CDN caching
curl -I https://docs.scarmonit.com/test.html

# Verify response headers
curl -v https://docs.scarmonit.com 2>&1 | grep -i "cf-"
```

## 📈 Cost Estimation

**Monthly costs (approximate):**

| Service | Usage | Cost |
|---------|-------|------|
| Lambda (S3 Backup) | 1 exec/day, 1 min runtime | $0.00 |
| S3 Storage | 1 GB source + backup | $0.05 |
| S3 Glacier | 1 GB after 30 days | $0.004 |
| CodePipeline | 1 pipeline | $1.00 |
| CodeBuild | ~10 builds/month, 5 min each | $0.50 |
| SNS | Email notifications | $0.00 |
| CloudWatch Logs | 100 MB | $0.50 |
| Cloudflare | Free tier | $0.00 |
| **Total** | | **~$2.05/month** |

## 🔧 Maintenance

### Update Lambda Function

```bash
# Edit s3-backup-lambda.js
# Then deploy:
zip s3-backup-lambda.zip s3-backup-lambda.js
aws lambda update-function-code \
  --function-name s3-backup-automation \
  --zip-file fileb://s3-backup-lambda.zip
```

### Update CloudFormation Stacks

```bash
# Update backup infrastructure
aws cloudformation update-stack \
  --stack-name s3-backup-infrastructure \
  --template-body file://s3-backup-cloudformation.yaml \
  --capabilities CAPABILITY_NAMED_IAM

# Update pipeline
aws cloudformation update-stack \
  --stack-name codepipeline-infrastructure \
  --template-body file://codepipeline-config.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

### Change Backup Schedule

Edit `s3-backup-cloudformation.yaml`:

```yaml
ScheduleExpression: cron(0 2 * * ? *)  # Daily at 2 AM UTC
# OR
ScheduleExpression: rate(12 hours)     # Every 12 hours
```

Then update the stack.

## 🗑️ Cleanup

### Delete All Resources

```bash
# Delete CodePipeline stack
aws cloudformation delete-stack --stack-name codepipeline-infrastructure

# Delete S3 backup stack
aws cloudformation delete-stack --stack-name s3-backup-infrastructure

# Delete backup bucket contents (if desired)
aws s3 rm s3://scarmonit-docs-backup --recursive
aws s3 rb s3://scarmonit-docs-backup

# Delete Secrets Manager secret
aws secretsmanager delete-secret \
  --secret-id github-token \
  --force-delete-without-recovery
```

**Cloudflare cleanup:**

```bash
# Manual: Remove DNS records from Cloudflare dashboard
# OR via API:
# Get record ID
aws cloudflare api zones/ZONE_ID/dns_records

# Delete record
aws cloudflare api zones/ZONE_ID/dns_records/RECORD_ID -X DELETE
```

## 🐛 Troubleshooting

### Lambda Backup Fails

**Check logs:**
```bash
aws logs tail /aws/lambda/s3-backup-automation --since 1h
```

**Common issues:**
- IAM permissions missing
- Source bucket doesn't exist
- Out of memory (increase MemorySize)
- Timeout (increase Timeout)

### CodePipeline Fails

**Check build logs:**
```bash
# Get latest build ID
BUILD_ID=$(aws codebuild list-builds-for-project \
  --project-name automated-build-project \
  --query 'ids[0]' --output text)

# View logs
aws codebuild batch-get-builds --ids $BUILD_ID
```

**Common issues:**
- GitHub token expired
- Build timeout
- npm install failures
- Test failures (set continue-on-error)

### Cloudflare Issues

**Verify DNS:**
```bash
dig docs.scarmonit.com +short
# Should return Cloudflare IP
```

**Check SSL:**
```bash
curl -I https://docs.scarmonit.com
# Should return 200 OK
```

**Common issues:**
- DNS propagation delay (wait 5 minutes)
- SSL mode mismatch (use Flexible)
- CNAME not proxied (enable orange cloud)

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS CodePipeline Documentation](https://docs.aws.amazon.com/codepipeline/)
- [CloudFormation Reference](https://docs.aws.amazon.com/cloudformation/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [S3 Lifecycle Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)

## 🤝 Contributing

To add new features:

1. Update CloudFormation templates
2. Test changes with `aws cloudformation validate-template`
3. Deploy to test environment first
4. Update documentation
5. Commit and push

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

Parker Dunn (scarmonit@gmail.com)

---

**Last Updated:** 2025-11-03
**Version:** 1.0.0
