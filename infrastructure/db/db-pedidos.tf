provider "aws" {
  region = "us-east-2"
}

resource "aws_dynamodb_table" "pedido_table" {
  name           = "mspedido"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "N" # Número
  }

  # Configuração opcional para facilitar consultas secundárias (Index)
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    projection_type = "ALL"

    # Capacidade para índices globais, ajustada automaticamente em PAY_PER_REQUEST
  }

  attribute {
    name = "status"
    type = "S" # String
  }

  tags = {
    Application = "FIAP-TechChallenge"
    Name = "dynamodb-fiap-ms-pedido"
  }
}
