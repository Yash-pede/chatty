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

variable "api_security_group_id" {
  description = "Security group ID of the API service"
  type        = string
}

variable "max_storage_gb" {
  description = "Maximum Valkey storage in GB"
  type        = number
  default     = 10
}

variable "max_ecpu" {
  description = "Maximum eCPU per second"
  type        = number
  default     = 10000
}

variable "tags" {
  description = "Tags to apply"
  type = map(string)
  default = {}
}
