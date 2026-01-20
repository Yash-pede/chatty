output "endpoint" {
  description = "Valkey endpoint hostname"
  value = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "port" {
  value = 6379
}

output "security_group_id" {
  value = aws_security_group.valkey.id
}
