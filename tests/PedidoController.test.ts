import PedidoController from '../src/infra/http/controllers/PedidoController';
import { PedidoGateway } from '../src/infra/database/gateways/PedidoGateway';
import { StatusPedido } from '../src/shared/enums/StatusPedido';
import { PedidoRequest, PedidoResponse } from '../src/infra/http/controllers/PedidoController';
import { Pedido } from '../src/domain/entities/Pedido';
import { IPedido } from '../src/application/interfaces/IPedido';
import { IReceberFilaMensageria } from '../src/application/interfaces/IReceberFilaMensageria';

const pedidoRequest: PedidoRequest = {
  cliente: {
    id: 1,
    nome: 'Cliente Teste',
    email: 'cliente@teste.com',
    cpf: ''
  },
  itens: [
    {
      item: {
        id: 1,
        nome: 'Pizza Margherita',
        descricao: 'Pizza com queijo e tomate',
        preco: 50.0,
        ingredientes: 'Queijo, Tomate, Manjericão',
        categoria: 'Lanche',
      },
      quantidade: 2,
    },
  ],
  status: StatusPedido.NOVO,
};

const pedidoResponse: PedidoResponse = {
  id: 'pedido123',
  data: new Date(),
  valorTotal: 100,
  cliente: {
    id: 1,
    nome: 'Cliente Teste',
    email: 'cliente@teste.com',
    cpf: ''
  },
  itens: [
    {
      item: {
        id: 1,
        nome: 'Pizza Margherita',
        descricao: 'Pizza com queijo e tomate',
        preco: 50.0,
        ingredientes: 'Queijo, Tomate, Manjericão',
        categoria: 'Lanche',
      },
      quantidade: 2,
      total: 100
    },
  ],
  status: StatusPedido.NOVO,
};

describe('Controlador de Pedidos', () => {
  let controller: PedidoController;
  let pedidoGatewayMock: jest.Mocked<PedidoGateway>;
  let filaMensageriaMock: jest.Mocked<IReceberFilaMensageria>;

  beforeEach(() => {
    pedidoGatewayMock = {
      criarPedido: jest.fn(),
      buscaPedido: jest.fn(),
      buscaPorStatus: jest.fn(),
      buscaPorStatusModulo2: jest.fn(),
      atualizaStatusPedido: jest.fn(),
    } as any;

    filaMensageriaMock = {
      receberFila: jest.fn(),
      marcarMensagemLida: jest.fn(),
    }

    controller = new PedidoController(pedidoGatewayMock, filaMensageriaMock);
  });


  describe("Cenário: Cadastrar um pedido com sucesso", () => {
    it("DADO um pedido válido, QUANDO eu tentar cadastrá-lo, ENTÃO o pedido deve ser criado com sucesso", async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
        cpf: pedidoRequest.cliente!.cpf
      }
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;

      const pedidoMock: IPedido = pedidoTeste;

      pedidoGatewayMock.criarPedido.mockResolvedValue(pedidoMock);

      const resultado = await controller.cadastrarPedido(pedidoRequest);

      expect(resultado).toEqual(pedidoResponse);
    });
  });

  describe("Cenário: Retornar erro ao cadastrar um pedido com dados inválidos", () => {
    it("DADO um pedido com dados inválidos, QUANDO eu tentar cadastrá-lo, ENTÃO deve lançar um erro informando 'Dados inválidos'", async () => {
      const pedidoRequest: PedidoRequest = {
        cliente: undefined,
        itens: [],
        status: StatusPedido.NOVO,
      };

      await expect(controller.cadastrarPedido(pedidoRequest)).rejects.toThrow('Pedido sem itens');
    });
  });

  describe("Cenário: Buscar um pedido específico com sucesso", () => {
    it("DADO um identificador de pedido válido, QUANDO eu buscar o pedido, ENTÃO os dados do pedido devem ser retornados", async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
        cpf: pedidoRequest.cliente!.cpf
      }
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;

      const ipedido: IPedido = pedidoTeste;

      pedidoGatewayMock.buscaPedido.mockResolvedValue(ipedido);

      const resultado = await controller.buscaPorId('pedido123');
      expect(resultado).toEqual({ pedidos: [pedidoResponse] });
    });
  });

  describe("Cenário: Retornar erro ao buscar um pedido inexistente", () => {
    it("DADO um identificador de pedido inexistente, QUANDO eu buscar o pedido, ENTÃO deve lançar um erro informando 'Pedido não encontrado'", async () => {
      await expect(controller.buscaPorId('pedido123')).rejects.toThrow('Pedido não encontrado');
    });
  });

  describe("Cenário: Listar pedidos por status com sucesso", () => {
    it("DADO um status válido, QUANDO eu listar os pedidos, ENTÃO deve retornar a lista de pedidos correspondentes", async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
        cpf: pedidoRequest.cliente!.cpf
      }
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;

      const ipedido: IPedido = pedidoTeste;
      const pedidosMock: Array<IPedido> = [ipedido];

      pedidoGatewayMock.buscaPorStatus.mockResolvedValue(pedidosMock);

      const resultado = await controller.buscaPorStatus('NOVO');

      expect(pedidoGatewayMock.buscaPorStatus).toHaveBeenCalled();
      expect(resultado).toEqual({ pedidos: [pedidoResponse] });
    });
  });

  describe("Cenário: Retornar erro ao listar pedidos por status inválido", () => {
    it("DADO um status inválido, QUANDO eu listar os pedidos, ENTÃO deve lançar um erro informando 'Status inválido'", async () => {
      await expect(controller.buscaPorStatus('NAO EXISTE')).rejects.toThrow('Status inválido');
    });
  });

  describe("Cenário: Listar pedidos por status do módulo da cozinha com sucesso", () => {
    it("DADO um status do módulo da cozinha, QUANDO eu listar os pedidos, ENTÃO deve retornar a lista de pedidos correspondentes", async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
        cpf: pedidoRequest.cliente!.cpf
      };
      pedidoTeste.atualizarStatus(StatusPedido.ENVIADO_PARA_A_COZINHA);
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;
      pedidoResponse.status = StatusPedido.ENVIADO_PARA_A_COZINHA;

      const ipedido: IPedido = pedidoTeste;
      const pedidosMock: Array<IPedido> = [ipedido];

      pedidoGatewayMock.buscaPorStatusModulo2.mockResolvedValue(pedidosMock);

      const resultado = await controller.buscaPorStatusModulo2();

      expect(pedidoGatewayMock.buscaPorStatusModulo2).toHaveBeenCalled();
      expect(resultado).toEqual({ pedidos: [pedidoResponse] });
    });
  });

  describe("Cenário: Processar mensagens de atualização de status com sucesso", () => {
    it("DADO mensagens recebidas de uma fila, QUANDO eu processá-las, ENTÃO o status dos pedidos deve ser atualizado e as mensagens marcadas como lidas", async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
        cpf: pedidoRequest.cliente!.cpf
      };
      pedidoTeste.atualizarStatus(StatusPedido.ENVIADO_PARA_A_COZINHA);
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;
      pedidoResponse.status = StatusPedido.CANCELADO;

      const pedido: IPedido = pedidoTeste;

      pedidoGatewayMock.atualizaStatusPedido.mockResolvedValue(pedido);

      const mensagens = [{ pedido: "pedido123", status: StatusPedido.CANCELADO, recibo: "string" }];

      filaMensageriaMock.receberFila.mockResolvedValue(mensagens);
      filaMensageriaMock.marcarMensagemLida.mockResolvedValue(true);

      const resultado = await controller.atualizarStatusMensageria();

      expect(pedidoGatewayMock.atualizaStatusPedido).toHaveBeenCalled();
      expect(resultado).toEqual(mensagens);
    });
  });
});
