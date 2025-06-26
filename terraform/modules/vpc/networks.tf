# public subnets configuration for the binomia vpc 
resource "aws_subnet" "public_subnet" {
  vpc_id                  = var.vpc_id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"

  tags = {
    Name = "public-subnet"
  }
}

# private subnets configuration for the binomia vpc
resource "aws_subnet" "private_subnet" {
  count             = 3
  vpc_id            = var.vpc_id
  cidr_block        = "10.0.${count.index + 2}.0/24"
  availability_zone = element(["us-east-1a", "us-east-1b", "us-east-1c"], count.index)

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}