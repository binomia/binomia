# internet gateway configuration for the binomia vpc
resource "aws_internet_gateway" "binomia_igw" {
  vpc_id = var.vpc_id

  tags = {
    Name = "binomia-igw"
  }
}

