output "endpoint" {
  description = "Valkey endpoint hostname"
  value       = aws_elasticache_serverless_cache.this.endpoint
}

output "port" {
  value = 6379
}

output "security_group_id" {
  value = aws_security_group.valkey.id
}
