provider "aws" {
  region = "ap-south-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name = "vpc-id"
    values = [data.aws_vpc.default.id]
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
  source       = "./modules/db"
  db_name      = "chatty_db"
  db_username  = var.db_username
  db_password  = var.db_password
  allowed_cidrs = ["0.0.0.0/0"]
}