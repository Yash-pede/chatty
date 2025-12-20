output "website_bucket_name" {
  value = module.frontend_bucket.bucket_name
}

output "cloudfront_distribution_domain_id" {
  value = module.frontend_cdn.distribution_id
}
output "cloudfront_distribution_domain_name" {
  value = module.frontend_cdn.distribution_domain_name
}