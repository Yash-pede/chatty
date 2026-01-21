output "api_security_group_id" {
  value = aws_security_group.alb_sg.id
}

output "ecs_sg" {
  value = aws_security_group.ecs_sg.id
}

output "listener_arn" {
  description = "Map of listener ARNs"
  value       = aws_lb_listener.http.arn
}
output "chatty_alb_dns_name" {
  value = aws_lb.chatty_alb.dns_name
}