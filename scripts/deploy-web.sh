#!/bin/bash

pushd infra
#terraform init -input=false
echo "🚧 Applying Terraform infrastructure..."
#terraform apply -auto-approve
echo "✅ Infrastructure applied."


BUCKET_NAME=$(terraform output -raw website_bucket_name)
CF_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_domain_id)
CF_DISTRIBUTION_DOMAIN=$(terraform output -raw cloudfront_distribution_domain_name)
echo "🏷️  Retrieved infrastructure outputs: $BUCKET_NAME, $CF_DISTRIBUTION_ID, $CF_DISTRIBUTION_DOMAIN"

popd

pushd apps/web/dist
echo "📤 Uploading build to S3..."
echo "uploading these files" | tree
aws s3 sync . "s3://$BUCKET_NAME" --delete
echo "✅ Upload complete."
popd

echo "🧹 Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "/*"
echo "✅ Invalidation created."


echo "Deployed to: https://$CF_DISTRIBUTION_DOMAIN/"