provider "aws" {
  region = "ap-south-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "map-public-ip-on-launch"
    values = ["true"]
  }
}


data "aws_availability_zones" "available" {
  # Exclude local zones
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}
resource "aws_subnet" "private" {
  count = 2

  vpc_id                  = data.aws_vpc.default.id
  cidr_block = cidrsubnet(data.aws_vpc.default.cidr_block, 8, count.index + 100)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "chatty-private-${count.index}"
  }
}

locals {
  region = "ap-south-1"
  name   = "chatty"

  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)

  tags = {
    Name = local.name
    # Example = local.name
  }
}


module "frontend_bucket" {
  source      = "./modules/s3-static-site"
  bucket_name = "chatty-frontend"
}

module "frontend_cdn" {
  source             = "./modules/cloudfront"
  bucket_domain_name = module.frontend_bucket.bucket_domain_name
  bucket_arn         = module.frontend_bucket.bucket_arn
  bucket_name        = module.frontend_bucket.bucket_name
}

module "rds" {
  source        = "./modules/db"
  db_name       = "chatty_db"
  db_username   = var.db_username
  db_password   = var.db_password
  allowed_cidrs = ["0.0.0.0/0"]
  is_public     = true
}

resource "aws_ecr_repository" "api-ecr" {
  name                 = "chatty-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

module "backend_ecs" {
  source         = "./modules/ecs-api"
  ecr_repo_url   = aws_ecr_repository.api-ecr.repository_url
  container_port = 8080
}

module "chat_cache" {
  source = "./modules/valkey-cache"

  name                  = "chat-app-cache"
  vpc_id                = data.aws_vpc.default.id
  private_subnet_ids    = aws_subnet.private[*].id
  api_security_group_id = module.backend_ecs.api_security_group_id

  max_storage_gb = 10
  max_ecpu       = 10000

  tags = {
    Project = "chat-app"
    Env     = "prod"
  }
}
