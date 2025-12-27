data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_secretsmanager_secret" "chatty_env" {
  name = "chatty/backend/env"
}


resource "aws_security_group" "alb_sg" {
  name        = "chatty-alb-sg"
  description = "Allow HTTP traffic from internet"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "chatty_alb" {
  name               = "chatty-alb"
  load_balancer_type = "application"
  subnets            = data.aws_subnets.default.ids
  security_groups    = [aws_security_group.alb_sg.id]

  idle_timeout = 3600
}

resource "aws_lb_target_group" "chatty_tg" {
  name        = "chatty-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.aws_vpc.default.id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.chatty_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.chatty_tg.arn
  }
}

resource "aws_security_group" "ecs_sg" {
  name        = "chatty-ecs-sg"
  description = "Allow ALB to reach ECS tasks"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "ecs" {
  source = "terraform-aws-modules/ecs/aws"

  cluster_name = "chatty-cluster"
  task_exec_iam_statements = {
    secrets = {
      actions   = ["secretsmanager:GetSecretValue"]
      resources = [data.aws_secretsmanager_secret.chatty_env.arn]
    }
  }
  default_capacity_provider_strategy = {
    FARGATE = {
      base   = 1
      weight = 1
    }
    FARGATE_SPOT = {
      weight = 1
    }
  }

  services = {
    chatty-api = {
      desired_count = 2
      cpu           = 1024
      memory        = 2048
      launch_type   = "FARGATE"

      subnet_ids         = data.aws_subnets.default.ids
      security_group_ids = [aws_security_group.ecs_sg.id]
      container_definitions = {
        chatty-container = {
          image     = "${var.ecr_repo_url}:latest"
          essential = true

          port_mappings = [
            {
              name          = "chatty-api-8080" # Add name
              containerPort = 8080
              hostPort      = 8080 # Add hostPort for Fargate
              protocol      = "tcp"
            }
          ]

          secrets = [
            {
              name      = "DATABASE_URL"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:DATABASE_URL::"
            },
            {
              name      = "CLERK_SECRET_KEY"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:CLERK_SECRET_KEY::"
            },
            {
              name      = "CLERK_PUBLISHABLE_KEY"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:CLERK_PUBLISHABLE_KEY::"
            },
            {
              name      = "CLERK_WEBHOOK_SIGNING_SECRET"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:CLERK_WEBHOOK_SIGNING_SECRET::"
            }
          ]

          enable_cloudwatch_logging = true
        }
      }

      load_balancer = {
        service = {
          target_group_arn = aws_lb_target_group.chatty_tg.arn
          container_name   = "chatty-container"
          container_port   = var.container_port
        }
      }
    }
  }

  tags = {
    Project     = "chatty"
    Environment = "dev"
  }
}
