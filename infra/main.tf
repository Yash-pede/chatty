provider "aws" {
  region = "ap-south-1"
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