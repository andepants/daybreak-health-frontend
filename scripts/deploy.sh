#!/bin/bash
#
# Deploy script for Daybreak Health Frontend
# Deploys static Next.js export to AWS S3/CloudFront
#
# Usage: npm run deploy
#

set -e

S3_BUCKET="daybreak-frontend-prod"

echo "🚀 Deploying Daybreak Frontend to production..."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo "❌ AWS CLI not found. Install with: brew install awscli"
  exit 1
fi

# Check if build output exists
if [ ! -d "out" ]; then
  echo "❌ Build output not found. Run 'npm run build' first."
  exit 1
fi

# Deploy to S3
echo "📦 Syncing to S3 bucket: $S3_BUCKET..."
aws s3 sync out/ "s3://$S3_BUCKET" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# HTML and JSON files should not be cached as long
aws s3 sync out/ "s3://$S3_BUCKET" \
  --cache-control "public, max-age=0, must-revalidate" \
  --include "*.html" \
  --include "*.json" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json"

# Invalidate CloudFront cache if distribution ID is set
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "🔄 Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text
  echo "✅ Cache invalidation started"
else
  echo "⚠️  No CLOUDFRONT_DISTRIBUTION_ID set. Skipping cache invalidation."
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Site: http://$S3_BUCKET.s3-website-us-east-1.amazonaws.com"
echo ""
