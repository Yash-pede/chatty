provider "aws" {
  region = "ap-south-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_availability_zones" "available" {
  # Exclude local zones
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

locals {
  region = "ap-south-1"
  name   = "ex-${basename(path.cwd)}"

  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)

  container_name = "ecs-sample"
  container_port = 80

  tags = {
    Name    = local.name
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


################################################################################
# Cluster
################################################################################


module "ecs_cluster" {
  source = "terraform-aws-modules/ecs/aws"

  # Capacity provider
  default_capacity_provider_strategy = {
    # FARGATE = {
    #   weight = 50
    #   base   = 20
    # }
    FARGATE_SPOT = {
      weight = 10
    }
  }

  tags = local.tags
}
