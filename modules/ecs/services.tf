# # ECS service configuration for main server.
# resource "aws_ecs_service" "main_service" {
#   name            = "main-service"
#   cluster         = aws_ecs_cluster.binomia_cluster.id
#   task_definition = aws_ecs_task_definition.main_task.arn
#   launch_type     = "FARGATE"

#   network_configuration {
#     subnets          = [aws_subnet.public_subnet.id]
#     security_groups  = [aws_security_group.main_sg.id]
#     assign_public_ip = true
#   }

#   desired_count = 1
# }

# # ECS service configuration for notification server.
# resource "aws_ecs_service" "notification_service" {
#   name            = "notification-service"
#   cluster         = aws_ecs_cluster.binomia_cluster.id
#   task_definition = aws_ecs_task_definition.notification_task.arn
#   launch_type     = "FARGATE"

#   network_configuration {
#     subnets          = [aws_subnet.private_subnet[0].id]
#     security_groups  = [aws_security_group.internal_sg.id]
#     assign_public_ip = false
#   }

#   desired_count = 1
# }

# # ECS service configuration for queue server
# resource "aws_ecs_service" "queue_service" {
#   name            = "queue-service"
#   cluster         = aws_ecs_cluster.binomia_cluster.id
#   task_definition = aws_ecs_task_definition.queue_task.arn
#   launch_type     = "FARGATE"

#   network_configuration {
#     subnets          = [aws_subnet.private_subnet[2].id]
#     security_groups  = [aws_security_group.internal_sg.id]
#     assign_public_ip = false
#   }

#   desired_count = 1
# }


# # ECS service configuration for anomaly detection server.
# resource "aws_ecs_service" "anomaly_service" {
#   name            = "anomaly-service"
#   cluster         = aws_ecs_cluster.binomia_cluster.id
#   task_definition = aws_ecs_task_definition.anomaly_task.arn
#   launch_type     = "FARGATE"

#   network_configuration {
#     subnets          = [aws_subnet.private_subnet[1].id]
#     security_groups  = [aws_security_group.internal_sg.id]
#     assign_public_ip = false
#   }

#   desired_count = 1
# }