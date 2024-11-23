# Lanchonete API - Pós-Tech FIAP - Arquitetura de Software

Este repositório contém o código-fonte para as APIs de gerenciamento de pedidos da Lanchonete, desenvolvido durante o primeiro módulo da Pós-Tech FIAP de Arquitetura de Software. O projeto foi atualizado para usar uma arquitetura baseada em micro serviços e implementado com tecnologias modernas para escalabilidade e manutenção.

## Tecnologias Utilizadas

- **TypeScript**: Linguagem de programação.
- **PostgreSQL**: Sistema de gerenciamento de banco de dados.
- **Docker**: Ferramenta de virtualização e orquestração de containers.
- **Swagger**: Ferramenta de documentação de APIs.
- **DynamoDB**: Banco de dados chave-valor.
- **Amazon ECS**: Serviço gerenciado para execução de containers.
- **API Gateway**: Serviço gerenciado que permite criar, publicar e gerenciar APIs seguras e escaláveis para acessar aplicações backend.

## APIs de Pedidos

### Domínios e Entidades

A API de gerenciamento de pedidos inclui as seguintes classes de domínio:

- **Pedido**: Representa um pedido realizado por um cliente, contendo itens e informações de pagamento.

### Endpoints

- **POST /pedido**: Criação de um novo pedido.
  - Exemplo de payload:
    ```json
    {
      "clienteId": "12345",
      "itens": [
        {
          "itemId": "1",
          "quantidade": 2
        },
        {
          "itemId": "3",
          "quantidade": 1
        }
      ],
      "total": 50.00
    }
    ```
- **GET /pedido/{id}**: Busca de um pedido específico pelo identificador.
- **GET /pedido/listagem/{status}**: Busca de pedidos por status. Status disponíveis: 
  - `NOVO`, `ENVIAR_PARA_PAGAMENTO`, `CANCELADO`, `ENVIADO_PARA_A_COZINHA`, `EM_PREPARACAO`, `PREPARADO`, `PRONTO_PARA_ENTREGA`, `ENTREGUE`.
- **PUT /pedido/status**: Atualização do status de um pedido.
  - Exemplo de payload:
    ```json
    {
      "pedidoId": "12345",
      "status": "EM_PREPARACAO"
    }
    ```
- **DELETE /pedido/{id}**: Exclusão de um pedido pelo identificador.

### Documentação da API

A documentação da API pode ser acessada através do Swagger no ambiente local:

```bash
http://localhost:8000/docs
Para o ambiente em produção na AWS, utilize o link abaixo:
```

### Documentação na AWS.

Regras de Negócio Aplicadas
Validação de Estoque: Antes de criar um pedido, é validado se os itens solicitados possuem estoque disponível.
Atualização de Status: O status do pedido é alterado conforme o fluxo operacional da lanchonete.
Cancelamento: Apenas pedidos nos status NOVO ou ENVIAR_PARA_PAGAMENTO podem ser cancelados.
Arquitetura AWS para Micro Serviços
A aplicação foi implementada usando Amazon ECS para orquestração de containers, garantindo escalabilidade e facilidade de gerenciamento. A arquitetura segue os princípios de uma implementação baseada em micro serviços.

### Descrição da Arquitetura
#### ECS Cluster
O ECS Cluster gerencia os serviços e tasks, orquestrando os containers e garantindo alta disponibilidade.

#### VPC e Subnets
Uma VPC foi configurada com subnets públicas e privadas para isolar os recursos e garantir a segurança dos dados.

#### DynamoDB
O DynamoDB é um banco de dados NoSQL gerenciado pela AWS, projetado para alta performance, escalabilidade e baixa latência.

#### API Gateway
O API Gateway gerencia e protege os endpoints das APIs, integrando-se ao AWS Cognito para autenticação e autorização.

#### AWS Lambda
Funções Lambda foram criadas para processar eventos assíncronos relacionados a mudanças de status de pedidos e auditorias.

### Comandos para Inicializar o Serviço na Máquina Local
Clonar o repositório:

```bash
git clone https://github.com/AfonsoCastro1983/fiap-techchallenge.git
Instalar as dependências:
```

```bash
cd lanchonete-api
npm install
Iniciar os serviços Docker:
```

```bash
docker-compose up -d
Acessar a documentação da API Swagger: http://localhost:8000/docs
```

### Observações
Este projeto foi atualizado para usar Amazon ECS e arquitetura de micro serviços.
Foco exclusivo no gerenciamento de APIs de Pedidos para simplificação e escalabilidade.
Para mais informações sobre o código e a arquitetura do projeto, consulte os arquivos de código-fonte e a documentação interna.