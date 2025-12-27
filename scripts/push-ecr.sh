echo "🚧 Pushing Docker image to ECR..."


ECR_REPOSITORY_URL=$(terraform output -raw ecr-repository_url)
echo "🏷️  ECR Repository URL: $ECR_REPOSITORY_URL"

aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $ECR_REPOSITORY_URL