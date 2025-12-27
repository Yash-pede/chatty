output "website_bucket_name" {
  value = module.frontend_bucket.bucket_name
}

output "cloudfront_distribution_domain_id" {
  value = module.frontend_cdn.distribution_id
}
output "cloudfront_distribution_domain_name" {
  value = module.frontend_cdn.distribution_domain_name
}

output "rds_db_endpoint" {
  value = module.rds.db_endpoint
}

output "rds_db_port" {
  value = module.rds.db_port
}

output "rds_db_name" {
  value = module.rds.db_name
}

output "rds_db_username" {
  value = module.rds.db_username
}

output "ecr-repository_url" {
  value = aws_ecr_repository.api-ecr.repository_url
}
