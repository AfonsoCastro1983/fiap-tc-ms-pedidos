#Provedor AWS
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

# Security Group para ECS de pedidos
resource "aws_security_group" "ms_pedidos_ecs_sg" {
  name        = "ms_pedidos_ecs_sg"
  description = "Security group for ECS tasks"
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

resource "aws_iam_policy" "dynamodb_access_policy" {
  name        = "DynamoDBAccessPolicy"
  description = "Policy granting access to the DynamoDB table for ECS tasks"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        Resource = "arn:aws:dynamodb:us-east-2:992382363343:table/mspedido"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.dynamodb_access_policy.arn
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
    image     = "992382363343.dkr.ecr.us-east-2.amazonaws.com/ms-pedido:latest"
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

  tags = {
    Name        = "ms_pedidos-ECS-Service"
    Application = "FIAP-TechChallenge"
  }
}