# Create a security group for the main serve
resource "aws_security_group" "main_sg" {
  vpc_id = var.vpc_id

  ingress {
    from_port   = 8000
    to_port     = 8000
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
    Name = "main-server-sg"
  }
}

# Create a security group for internal services
resource "aws_security_group" "internal_sg" {
  vpc_id = var.vpc_id

  ingress {
    from_port   = 8001
    to_port     = 8003
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.0.0/16"]
  }

  tags = {
    Name = "internal-services-sg"
  }
}
