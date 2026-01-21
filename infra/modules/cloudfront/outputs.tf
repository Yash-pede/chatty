output "distribution_id" {
  value = aws_cloudfront_distribution.this.id
}

output "distribution_domain_name" {
  value = aws_cloudfront_distribution.this.domain_name
}

output "backend_url" {
  value = "https://${aws_cloudfront_distribution.backend_cdn.domain_name}"
}
