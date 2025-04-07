provider "aws" {
  region = "us-east-1"
}

terraform {
  required_version = ">= 1.0"
}

module "vpc" {
  source = "./modules/vpc"
  vpc_id = module.vpc.vpc_id
}

module "ecs" {
  source = "./modules/ecs"
  vpc_id = module.vpc.vpc_id
}

module "sg" {
  source = "./modules/sg"
  vpc_id = module.vpc.vpc_id
}

