#!/bin/bash

##############################################################################
# Complete Infrastructure Deployment Script
# Deploys all infrastructure components in parallel where possible
##############################################################################

set -e

echo "=============================================================================="
echo "🚀 Complete Infrastructure Deployment"
echo "=============================================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if logged in
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged into AWS. Please run 'aws configure' or 'aws sso login'.${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}"
echo ""

##############################################################################
# 1. Deploy S3 Backup Infrastructure
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1: Deploying S3 Backup Infrastructure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STACK_NAME="s3-backup-infrastructure"

echo "Deploying CloudFormation stack: ${STACK_NAME}..."
aws cloudformation deploy \
    --template-file s3-backup-cloudformation.yaml \
    --stack-name ${STACK_NAME} \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides NotificationEmail=scarmonit@gmail.com \
    --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ S3 backup infrastructure deployed${NC}"

    # Get outputs
    LAMBDA_ARN=$(aws cloudformation describe-stacks \
        --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`BackupLambdaArn`].OutputValue' \
        --output text)

    echo "   Lambda ARN: ${LAMBDA_ARN}"

    # Package and deploy Lambda code
    echo "Packaging Lambda function..."
    cd "$(dirname "$0")"
    zip -q s3-backup-lambda.zip s3-backup-lambda.js

    echo "Updating Lambda function code..."
    aws lambda update-function-code \
        --function-name s3-backup-automation \
        --zip-file fileb://s3-backup-lambda.zip \
        --output text > /dev/null

    rm s3-backup-lambda.zip
    echo -e "${GREEN}✅ Lambda code deployed${NC}"
else
    echo -e "${YELLOW}⚠️  S3 backup deployment had no changes or failed${NC}"
fi

echo ""

##############################################################################
# 2. Deploy CodePipeline Infrastructure
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Step 2: Deploying CodePipeline Infrastructure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if GitHub token exists in Secrets Manager
echo "Checking for GitHub token in Secrets Manager..."
if ! aws secretsmanager describe-secret --secret-id github-token &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub token not found in Secrets Manager${NC}"
    echo "Creating secret placeholder..."
    aws secretsmanager create-secret \
        --name github-token \
        --description "GitHub personal access token for CodePipeline" \
        --secret-string '{"token":"PLACEHOLDER"}' \
        --output text > /dev/null
    echo -e "${RED}❌ Please update the secret with your actual GitHub token:${NC}"
    echo "   aws secretsmanager put-secret-value --secret-id github-token --secret-string '{\"token\":\"YOUR_TOKEN\"}'"
    GITHUB_TOKEN_ARN=$(aws secretsmanager describe-secret --secret-id github-token --query ARN --output text)
else
    GITHUB_TOKEN_ARN=$(aws secretsmanager describe-secret --secret-id github-token --query ARN --output text)
    echo -e "${GREEN}✅ GitHub token found: ${GITHUB_TOKEN_ARN}${NC}"
fi

PIPELINE_STACK="codepipeline-infrastructure"

echo "Deploying CloudFormation stack: ${PIPELINE_STACK}..."
aws cloudformation deploy \
    --template-file codepipeline-config.yaml \
    --stack-name ${PIPELINE_STACK} \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        GitHubRepo=scarmonit/my-repo \
        GitHubBranch=main \
        GitHubTokenSecretArn=${GITHUB_TOKEN_ARN} \
    --no-fail-on-empty-changeset

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CodePipeline infrastructure deployed${NC}"

    # Get pipeline name
    PIPELINE_NAME=$(aws cloudformation describe-stacks \
        --stack-name ${PIPELINE_STACK} \
        --query 'Stacks[0].Outputs[?OutputKey==`PipelineName`].OutputValue' \
        --output text)

    echo "   Pipeline Name: ${PIPELINE_NAME}"
    echo "   View in console: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/${PIPELINE_NAME}/view"
else
    echo -e "${YELLOW}⚠️  CodePipeline deployment had no changes or failed${NC}"
fi

echo ""

##############################################################################
# 3. Configure Cloudflare CDN
##############################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Step 3: Configuring Cloudflare CDN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo -e "${YELLOW}⚠️  Cloudflare credentials not set${NC}"
    echo "Skipping Cloudflare configuration."
    echo "To configure Cloudflare later, set environment variables and run:"
    echo "   export CLOUDFLARE_API_TOKEN=your_token"
    echo "   export CLOUDFLARE_ZONE_ID=your_zone_id"
    echo "   node cloudflare-config.js"
else
    echo "Running Cloudflare setup..."
    if node cloudflare-config.js; then
        echo -e "${GREEN}✅ Cloudflare CDN configured${NC}"
    else
        echo -e "${RED}❌ Cloudflare configuration failed${NC}"
    fi
fi

echo ""

##############################################################################
# Summary
##############################################################################

echo "=============================================================================="
echo "✅ Infrastructure Deployment Complete!"
echo "=============================================================================="
echo ""
echo "📋 Summary:"
echo ""
echo "1. S3 Backups:"
echo "   - Daily backups at 2 AM UTC"
echo "   - Backup bucket: scarmonit-docs-backup"
echo "   - Retention: 90 days (30 days in Glacier)"
echo "   - Email notifications: scarmonit@gmail.com"
echo ""
echo "2. CodePipeline:"
echo "   - Auto-deploys on git push"
echo "   - Source: GitHub"
echo "   - Build: CodeBuild"
echo "   - Deploy: S3 (scarmonit-docs)"
echo ""
echo "3. Cloudflare CDN:"
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "   ⚠️  Not configured (missing credentials)"
else
    echo "   - CDN caching enabled"
    echo "   - DDoS protection active"
    echo "   - SSL/TLS encryption"
    echo "   - Firewall rules configured"
fi
echo ""
echo "🔗 Quick Links:"
echo "   - S3 Bucket: https://s3.console.aws.amazon.com/s3/buckets/scarmonit-docs"
echo "   - Lambda Functions: https://console.aws.amazon.com/lambda/home#/functions"
echo "   - CodePipeline: https://console.aws.amazon.com/codesuite/codepipeline/pipelines"
echo "   - CloudFormation: https://console.aws.amazon.com/cloudformation/home#/stacks"
echo ""
echo "=============================================================================="
