resource "aws_security_group" "valkey" {
  name        = "${var.name}-sg"
  description = "Security group for Valkey cache"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow Valkey access from API"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    security_groups = [var.api_security_group_id]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_elasticache_serverless_cache" "this" {
  name        = var.name
  description = "Valkey serverless cache for ${var.name}"
  engine      = "valkey"

  subnet_ids = var.private_subnet_ids

  security_group_ids = [
    aws_security_group.valkey.id
  ]

  cache_usage_limits {
    data_storage {
      maximum = var.max_storage_gb
      unit    = "GB"
    }

    ecpu_per_second {
      maximum = var.max_ecpu
    }
  }

  tags = var.tags
}
