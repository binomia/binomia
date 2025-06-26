resource "aws_vpc" "binomia_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "binomia-vpc"
  }
}

output "vpc_id" {
  value = aws_vpc.binomia_vpc.id
}
