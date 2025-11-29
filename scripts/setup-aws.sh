#!/bin/bash
#
# One-time AWS setup script for Daybreak Health Frontend
# Creates S3 buckets and CloudFront distributions for staging and production
#
# Prerequisites:
#   - AWS CLI installed and configured
#   - Appropriate IAM permissions
#
# Usage: ./scripts/setup-aws.sh
#

set -e

echo "🏗️  Setting up AWS infrastructure for Daybreak Health Frontend"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI not found. Install with: brew install awscli"
  exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
  echo "❌ AWS credentials not configured. Run: aws configure"
  exit 1
fi

AWS_REGION=${AWS_REGION:-us-east-1}
echo "📍 Using region: $AWS_REGION"
echo ""

# ========================================
# STAGING ENVIRONMENT
# ========================================
echo "=== STAGING ENVIRONMENT ==="

STAGING_BUCKET="daybreak-frontend-staging"

# Create staging S3 bucket
echo "📦 Creating staging S3 bucket: $STAGING_BUCKET..."
if aws s3api head-bucket --bucket "$STAGING_BUCKET" 2>/dev/null; then
  echo "   Bucket already exists, skipping..."
else
  aws s3 mb "s3://$STAGING_BUCKET" --region "$AWS_REGION"

  # Configure for static website hosting
  aws s3 website "s3://$STAGING_BUCKET" \
    --index-document index.html \
    --error-document 404.html

  # Set bucket policy for public read
  aws s3api put-bucket-policy --bucket "$STAGING_BUCKET" --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::$STAGING_BUCKET/*\"
    }]
  }"
  echo "   ✅ Staging bucket created"
fi

# ========================================
# PRODUCTION ENVIRONMENT
# ========================================
echo ""
echo "=== PRODUCTION ENVIRONMENT ==="

PROD_BUCKET="daybreak-frontend-prod"

# Create production S3 bucket
echo "📦 Creating production S3 bucket: $PROD_BUCKET..."
if aws s3api head-bucket --bucket "$PROD_BUCKET" 2>/dev/null; then
  echo "   Bucket already exists, skipping..."
else
  aws s3 mb "s3://$PROD_BUCKET" --region "$AWS_REGION"

  # Configure for static website hosting
  aws s3 website "s3://$PROD_BUCKET" \
    --index-document index.html \
    --error-document 404.html

  # Set bucket policy for public read
  aws s3api put-bucket-policy --bucket "$PROD_BUCKET" --policy "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [{
      \"Sid\": \"PublicReadGetObject\",
      \"Effect\": \"Allow\",
      \"Principal\": \"*\",
      \"Action\": \"s3:GetObject\",
      \"Resource\": \"arn:aws:s3:::$PROD_BUCKET/*\"
    }]
  }"
  echo "   ✅ Production bucket created"
fi

echo ""
echo "=========================================="
echo "✅ AWS S3 setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Create CloudFront distributions (recommended via AWS Console for SSL setup):"
echo "   - Go to CloudFront > Create Distribution"
echo "   - Origin: $STAGING_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo "   - Enable HTTPS redirect"
echo "   - Add custom domain if needed"
echo ""
echo "2. Set environment variables for deployment:"
echo "   export CLOUDFRONT_STAGING_DISTRIBUTION_ID=<staging-dist-id>"
echo "   export CLOUDFRONT_PROD_DISTRIBUTION_ID=<prod-dist-id>"
echo ""
echo "3. Deploy:"
echo "   npm run deploy:staging"
echo "   npm run deploy:prod"
echo ""
echo "S3 Website URLs (for testing without CloudFront):"
echo "   Staging: http://$STAGING_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo "   Prod:    http://$PROD_BUCKET.s3-website-$AWS_REGION.amazonaws.com"
echo ""
