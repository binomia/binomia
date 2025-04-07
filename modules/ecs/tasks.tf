# ECS task definitions for the main server.
resource "aws_ecs_task_definition" "main_task" {
  family                   = "main-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "test-express"
      image     = "brayhandeaza/test-express:latest"
      cpu       = 256
      memory    = 512
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    }
  ])
}

# # ECS task definitions for the main server.
# resource "aws_ecs_task_definition" "main_task" {
#   family                   = "main-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"

#   container_definitions = jsonencode([
#     {
#       name      = "main-server"
#       image     = "your-main-server-image"
#       cpu       = 256
#       memory    = 512
#       essential = true
#       portMappings = [
#         {
#           containerPort = 8000
#           hostPort      = 8000
#         }
#       ]
#     }
#   ])
# }

# # ECS task definitions for the notification server.
# resource "aws_ecs_task_definition" "notification_task" {
#   family                   = "notification-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"

#   container_definitions = jsonencode([
#     {
#       name      = "notification-server"
#       image     = "your-notification-image"
#       cpu       = 256
#       memory    = 512
#       essential = true
#       portMappings = [
#         {
#           containerPort = 8001
#           hostPort      = 8001
#         }
#       ]
#     }
#   ])
# }

# # ECS task definitions for the queue server
# resource "aws_ecs_task_definition" "queue_task" {
#   family                   = "queue-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"

#   container_definitions = jsonencode([
#     {
#       name      = "queue-server"
#       image     = "your-queue-image"
#       cpu       = 256
#       memory    = 512
#       essential = true
#       portMappings = [
#         {
#           containerPort = 8002
#           hostPort      = 8002
#         }
#       ]
#     }
#   ])
# }

# # ECS task definitions for the anomaly server.
# resource "aws_ecs_task_definition" "anomaly_task" {
#   family                   = "anomaly-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"

#   container_definitions = jsonencode([
#     {
#       name      = "anomaly-server"
#       image     = "your-anomaly-image"
#       cpu       = 256
#       memory    = 512
#       essential = true
#       portMappings = [
#         {
#           containerPort = 8003
#           hostPort      = 8003
#         }
#       ]
#     }
#   ])
# }
