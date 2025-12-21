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
