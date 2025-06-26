# eip configuration
resource "aws_eip" "nat" {}

# nat gateway configuration
resource "aws_nat_gateway" "binomia_nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_subnet.id

  tags = {
    Name = "binomia-nat"
  }
}
