#!/bin/bash

pushd infra|| {
               echo "Error: please run the pnpm deploy:api from root"
               exit 1
           }
echo "Pushing to AWS ECR"
ECR_REPOSITORY_URL=$(terraform output -raw ecr-repository_url)
if [[ -z "$ECR_REPOSITORY_URL" ]]; then
  echo "Please check terraform or run script from root using pnpm deploy:api command"
  popd
  exit 1
fi
echo "ECR Repository URL: $ECR_REPOSITORY_URL"
popd

docker compose build api

aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin "$ECR_REPOSITORY_URL"

docker tag chatty-api:latest "$ECR_REPOSITORY_URL":latest
docker push "$ECR_REPOSITORY_URL":latest