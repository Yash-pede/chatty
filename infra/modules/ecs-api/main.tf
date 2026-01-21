data "aws_secretsmanager_secret" "chatty_env" {
  name = "chatty/backend/env"
}

resource "aws_security_group" "alb_sg" {
  name        = "chatty-alb-sg"
  description = "Allow HTTP traffic from internet"
  vpc_id = var.vpc_id

  # ingress {
  #   from_port = 80
  #   to_port   = 80
  #   protocol  = "tcp"
  #   # cidr_blocks = [var.vpc_cidr_block]
  #   #   API GATEWAY SG
  #   security_groups = [var.apigw_sg_id]
  # }

  ingress {
    description = "Allow CloudFront/Public Traffic"
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
  subnets  = var.public_subnet_ids
  security_groups    = [aws_security_group.alb_sg.id]
  internal = false
  idle_timeout = 3600
}

resource "aws_lb_target_group" "chatty_tg" {
  name        = "chatty-tg"
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id = var.vpc_id

  stickiness {
    enabled         = true
    type            = "lb_cookie"
    cookie_duration = 1800 # Duration in seconds (30 minutes). Range is 1 second to 1 week (604800s).
  }

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
  vpc_id = var.vpc_id

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

  # cluster_capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  # default_capacity_provider_strategy = {
  #   FARGATE = {
  #     base   = 1
  #     weight = 1
  #   }
  #   FARGATE_SPOT = {
  #     base   = 0
  #     weight = 2
  #   }
  # }

  create_task_exec_iam_role = true
  create_task_exec_policy   = true
  # task_exec_ssm_param_arns = [
  #   data.aws_secretsmanager_secret.chatty_env.arn
  # ]
  task_exec_iam_statements = {
    secrets_manager_read = {
      sid     = "SecretsManagerRead"
      effect  = "Allow"
      actions = ["secretsmanager:GetSecretValue"]
      resources = [
        data.aws_secretsmanager_secret.chatty_env.arn
      ]
    }
  }

  services = {
    chatty-api = {
      desired_count = 1
      cpu           = 1024
      memory        = 2048
      launch_type   = "FARGATE"

      assign_public_ip = false
      enable_execute_command    = false
      create_task_exec_iam_role = false
      create_task_exec_policy   = false

      subnet_ids = var.private_subnet_ids
      security_group_ids = [aws_security_group.ecs_sg.id]

      container_definitions = {
        chatty-container = {
          image     = "${var.ecr_repo_url}:latest"
          essential = true

          portMappings = [
            {
              name          = "chatty-api-8080"
              containerPort = 8080
              protocol      = "tcp"
            }
          ]

          secrets = [
            {
              name      = "PORT"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:PORT::"
            },
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
            },
            {
              name      = "REDIS_HOST"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:REDIS_HOST::"
            },
            {
              name      = "REDIS_PORT"
              valueFrom = "${data.aws_secretsmanager_secret.chatty_env.arn}:REDIS_PORT::"
            },
          ]

          enable_cloudwatch_logging = true
        }
      }

      load_balancer = {
        service = {
          target_group_arn = aws_lb_target_group.chatty_tg.arn
          container_name   = "chatty-container"
          container_port   = 8080
        }
      }
    }
  }

  tags = {
    Project     = "chatty"
    Environment = "dev"
  }
}
