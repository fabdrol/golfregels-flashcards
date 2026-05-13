#!/usr/bin/env bash
set -euo pipefail

AWS_PROFILE=syt
S3_BUCKET=video.superyachtapi.com
S3_PREFIX=golf
CLOUDFRONT_DISTRIBUTION_ID=E317157QNBRTYO

cd "$(dirname "$0")"

echo "==> Building"
npm run build

echo "==> Syncing assets to s3://${S3_BUCKET}/${S3_PREFIX}/"
aws s3 sync dist/ "s3://${S3_BUCKET}/${S3_PREFIX}/" \
  --profile "$AWS_PROFILE" \
  --delete \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

echo "==> Uploading index.html (no-cache)"
aws s3 cp dist/index.html "s3://${S3_BUCKET}/${S3_PREFIX}/index.html" \
  --profile "$AWS_PROFILE" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8"

echo "==> Triggering CloudFront invalidation (fire and forget)"
aws cloudfront create-invalidation \
  --profile "$AWS_PROFILE" \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/${S3_PREFIX}/*" \
  --no-cli-pager \
  --output text \
  --query 'Invalidation.Id' >/dev/null &

echo "==> Done. Live at https://video.superyachtapi.com/${S3_PREFIX}/"
