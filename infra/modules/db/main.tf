
# -----------------------------
# VPC (use default for sandbox)
# -----------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# -----------------------------
# Security Group for RDS
# -----------------------------
resource "aws_security_group" "rds" {
  name        = "chatty-rds-sg"
  description = "Allow PostgreSQL access from backend only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Postgres from backend (temporary open for sandbox)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidrs
    # security_groups = []
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "chatty-rds-sg"
  }
}

# -----------------------------
# Subnet Group
# -----------------------------
resource "aws_db_subnet_group" "this" {
  name       = "chatty-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "chatty-db-subnet-group"
  }
}

# -----------------------------
# Parameter Group
# -----------------------------
resource "aws_db_parameter_group" "this" {
  name   = "chatty-postgres-params"
  family = "postgres18"

  parameter {
    name  = "log_min_duration_statement"
    value = "500"
  }

  tags = {
    Name = "chatty-postgres-params"
  }
}

# -----------------------------
# RDS Instance
# -----------------------------
resource "aws_db_instance" "this" {
  identifier = "chatty-postgres"

  engine               = "postgres"
  engine_version       = "18.1"
  instance_class       = "db.t4g.micro"
  allocated_storage    = 20
  max_allocated_storage = 50

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name  = aws_db_parameter_group.this.name

  publicly_accessible = var.is_public
  skip_final_snapshot = true
  deletion_protection = false
  multi_az            = false

  backup_retention_period = 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  tags = {
    Name        = "chatty-postgres"
    Environment = "sandbox"
  }
}
