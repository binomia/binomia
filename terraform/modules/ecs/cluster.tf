resource "aws_ecs_cluster" "binomia_cluster" {
  name = "binomia-cluster"

  tags = {
    Name = "binomia-cluster"
  }
}











