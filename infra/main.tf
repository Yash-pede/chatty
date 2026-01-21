provider "aws" {
  region = "ap-south-1"
}

data "aws_availability_zones" "available" {}

locals {
  name = "chatty"

  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)

  tags = {
    Name = local.name
  }
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = local.name
  cidr = local.vpc_cidr
  azs  = local.azs

  public_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k)]     # /24
  private_subnets = [for k, v in local.azs : cidrsubnet(local.vpc_cidr, 8, k + 3)] # /24

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = local.tags
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
  db_subnet_ids = module.vpc.public_subnets
  vpc_id        = module.vpc.vpc_id
}

resource "aws_ecr_repository" "api-ecr" {
  name                 = "chatty-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

module "backend_ecs" {
  source             = "./modules/ecs-api"
  ecr_repo_url       = aws_ecr_repository.api-ecr.repository_url
  container_port     = 8080
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnets
  public_subnet_ids  = module.vpc.public_subnets
  apigw_sg_id        = module.api_gateway_security_group.security_group_id
  vpc_cidr_block     = module.vpc.vpc_cidr_block
}

module "chat_cache" {
  source = "./modules/valkey-cache"

  name               = "chat-app-cache"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnets
  ecs_sg             = module.backend_ecs.ecs_sg

  tags = {
    Project = "chat-app"
    Env     = "prod"
  }
}
#
# # aws ecs execute-command \
# # --cluster chatty-cluster \
# # --task <task-id> \
# # --container chatty-container \
# # --command "/bin/sh" \
# # --interactive
#


module "api_gateway_security_group" {
  source = "terraform-aws-modules/security-group/aws"

  name        = local.name
  description = "API Gateway group for example usage"
  vpc_id      = module.vpc.vpc_id

  ingress_cidr_blocks = ["0.0.0.0/0"]
  ingress_rules = ["http-80-tcp"]

  egress_rules = ["all-all"]

  tags = local.tags
}

module "api_gateway" {
  source = "terraform-aws-modules/apigateway-v2/aws"

  name          = "chatty-http-api"
  description   = "HTTP API Gateway in front of ALB"
  protocol_type = "HTTP"

  cors_configuration = {
    allow_origins = ["*"]
    allow_methods = ["*"]
    allow_headers = ["*"]
  }

  create_domain_name = false
  hosted_zone_name   = ""

  #################################
  # VPC LINK (API Gateway → ALB)
  #################################
  vpc_links = {
    alb = {
      name       = "chatty-alb-vpc-link"
      subnet_ids = module.vpc.private_subnets
      security_group_ids = [module.api_gateway_security_group.security_group_id]
    }
  }

  #################################
  # ROUTES
  #################################
  routes = {
    "ANY /{proxy+}" = {
      integration = {
        type            = "HTTP_PROXY"
        uri             = module.backend_ecs.listener_arn
        method          = "ANY"
        connection_type = "VPC_LINK"
        vpc_link_key    = "alb"
      }
    }

    "ANY /" = {
      integration = {
        type            = "HTTP_PROXY"
        uri             = module.backend_ecs.listener_arn
        method          = "ANY"
        connection_type = "VPC_LINK"
        vpc_link_key    = "alb"
      }
    }
  }

  tags = {
    Project = "chatty"
    Env     = "dev"
  }
}
