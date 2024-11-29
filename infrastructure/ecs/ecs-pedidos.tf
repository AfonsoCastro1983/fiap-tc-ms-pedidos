# Provedor AWS
provider "aws" {
  region = "us-east-2"
}

# Reutilizar a VPC existente
data "aws_vpc" "existing_vpc" {
  tags = {
    Name = "ms_Clientes-ECS-VPC"
  }
}

# Reutilizar as subnets públicas existentes
data "aws_subnet" "public_subnet_1" {
  tags = {
    Name = "ms_Clientes-ECS-Public-Subnet"
  }
}

data "aws_subnet" "public_subnet_2" {
  tags = {
    Name = "ms_Clientes-ECS-Public-Subnet-2"
  }
}

# Reutilizar o Internet Gateway existente
data "aws_internet_gateway" "existing_igw" {
  tags = {
    Name = "ms_Clientes-ECS-Internet-Gateway"
  }
}

# Reutilizar a tabela de roteamento pública
data "aws_route_table" "existing_public_route_table" {
  tags = {
    Name = "ms_Clientes-ECS-Public-Route-Table"
  }
}

# Security Group para ALB de pedidos
resource "aws_security_group" "ms_pedidos_alb_sg" {
  name        = "ms_pedidos_alb_sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = data.aws_vpc.existing_vpc.id

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

  tags = {
    Name        = "ms_pedidos-ALB-SG"
    Application = "FIAP-TechChallenge"
  }
}

# Security Group para ECS de pedidos
resource "aws_security_group" "ms_pedidos_ecs_sg" {
  name        = "ms_pedidos_ecs_sg"
  description = "Security group for ECS tasks"
  vpc_id      = data.aws_vpc.existing_vpc.id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.ms_pedidos_alb_sg.id]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port       = 32768
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.ms_pedidos_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "ms_pedidos-ECS-SG"
    Application = "FIAP-TechChallenge"
  }
}

# CloudWatch Log Group para pedidos
resource "aws_cloudwatch_log_group" "ms_pedidos_logs" {
  name              = "/ecs/ms-pedidos"
  retention_in_days = 30

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_pedidos-Logs"
  }
}

# Load Balancer para pedidos
resource "aws_lb" "ms_pedidos_ecs_lb" {
  name               = "ms-pedidos-ecs-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ms_pedidos_alb_sg.id]
  subnets            = [
    data.aws_subnet.public_subnet_1.id,
    data.aws_subnet.public_subnet_2.id
  ]

  tags = {
    Name        = "ms_pedidos_ecs_lb"
    Application = "FIAP-TechChallenge"
  }
}

# Listener do Load Balancer
resource "aws_lb_listener" "ms_pedidos_ecs_lb_listener" {
  load_balancer_arn = aws_lb.ms_pedidos_ecs_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ms_pedidos_ecs_target_group.arn
  }
}

# Target Group
resource "aws_lb_target_group" "ms_pedidos_ecs_target_group" {
  name        = "ms-pedidos-ecs-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.existing_vpc.id
  target_type = "ip"

  health_check {
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200-299"
  }

  tags = {
    Name        = "ms_pedidos_ecs_target_group"
    Application = "FIAP-TechChallenge"
  }
}

# ECS Cluster para pedidos
resource "aws_ecs_cluster" "ms_pedidos_cluster" {
  name = "ms_pedidos-ECS-Cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "ms_pedidos-ECS-Cluster"
    Application = "FIAP-TechChallenge"
  }
}

# IAM Role para o ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ms_pedidos_ecs_task_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ms_pedidos_task" {
  family                   = "ms_pedidos-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "fiap-mspedidos-app"
    image     = "992382363343.dkr.ecr.us-east-2.amazonaws.com/ms-pedidos:latest"
    essential = true
    
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "DYNAMODB_TABLE_NAME"
        value = "mspedido"
      },
      {
        name  = "AWS_ACCESS_KEY_ID"
        value = var.aws_acces_key
      },
      {
        name  = "AWS_SECRET_ACCESS_KEY"
        value = var.aws_secret_access_key
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ms_pedidos_logs.name
        "awslogs-region"        = "us-east-2"
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Name        = "ms_pedidos-Task-Definition"
    Application = "FIAP-TechChallenge"
  }
}

# ECS Service
resource "aws_ecs_service" "ms_pedidos_service" {
  name            = "ms_pedidos-service"
  cluster         = aws_ecs_cluster.ms_pedidos_cluster.id
  task_definition = aws_ecs_task_definition.ms_pedidos_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [data.aws_subnet.public_subnet_1.id, data.aws_subnet.public_subnet_2.id]
    security_groups  = [aws_security_group.ms_pedidos_ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ms_pedidos_ecs_target_group.arn
    container_name   = "fiap-mspedidos-app"
    container_port   = 8000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  tags = {
    Name        = "ms_pedidos-ECS-Service"
    Application = "FIAP-TechChallenge"
  }
}
