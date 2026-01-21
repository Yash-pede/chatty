variable "is_public" {
  type        = bool
  description = "Whether the database should be publicly accessible"
  default     = false
}

variable "db_name" {
  type        = string
  description = "Initial database name"
}

variable "db_username" {
  type        = string
  description = "Database master username"
}

variable "db_password" {
  type        = string
  description = "Database master password"
  sensitive   = true
}

variable "allowed_cidrs" {
  type        = list(string)
  description = "CIDR blocks allowed to access Postgres"
  default     = ["0.0.0.0/0"]
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "db_subnet_ids" {
  type = list(string)
  description = "Subnet IDs for RDS"
}