variable "name" {
  description = "Name of the Valkey cache"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for Valkey"
  type = list(string)
}

variable "ecs_sg" {
  description = "Security group ID of ECS"
  type        = string
}

variable "tags" {
  description = "Tags to apply"
  type = map(string)
  default = {}
}
