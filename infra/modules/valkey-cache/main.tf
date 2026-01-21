resource "aws_security_group" "valkey" {
  name        = "${var.name}-sg"
  description = "Security group for Valkey cache"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow Valkey access from API"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    security_groups = [var.ecs_sg]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}


resource "aws_elasticache_subnet_group" "this" {
  name = "${var.name}-subnet-group"
  subnet_ids = var.private_subnet_ids
}


resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "valkey-cluster"
  description          = "A Valkey cluster"
  engine               = "valkey"
  engine_version = "7.2"             # Specify the desired engine version (e.g., 7.2)
  node_type = "cache.t4g.micro" # Choose an appropriate node type
  num_cache_clusters = 1                 # Number of nodes (primary + replica)
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.this.name
  security_group_ids = [aws_security_group.valkey.id]
  # automatic_failover_enabled = true
  # snapshot_retention_limit   = 7
  apply_immediately = true # Apply changes immediately instead of during maintenance window

  # Optional: Enforce encryption in transit and at rest for security
  transit_encryption_enabled = false
  at_rest_encryption_enabled = false
}
