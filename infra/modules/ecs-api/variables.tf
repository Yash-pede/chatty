variable "container_port" {
  default = 8080
  type    = number
}
variable "ecr_repo_url" {
  type = string
}
variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "private_subnet_ids" {
  type = list(string)
  description = "Subnet IDs for RDS"
}

variable "public_subnet_ids" {
  type = list(string)
  description = "Subnet IDs for RDS"
}

variable "apigw_sg_id" {
  type        = string
  description = "Security group for API Gateway"
}

variable "vpc_cidr_block" {
  type = string
}
