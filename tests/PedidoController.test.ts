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
  total: 100,
  cliente: {
    id: 1,
    nome: 'Cliente Teste',
    email: 'cliente@teste.com',
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

describe('PedidoController', () => {
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

  describe('Cadastrar Pedido', () => {
    it('deve cadastrar um pedido com sucesso', async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
      }
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;

      const pedidoMock: IPedido = pedidoTeste;

      pedidoGatewayMock.criarPedido.mockResolvedValue(pedidoMock);

      const resultado = await controller.cadastrarPedido(pedidoRequest);

      expect(resultado).toEqual(pedidoResponse);
    });

    it('deve retornar erro quando os dados do pedido forem inválidos', async () => {
      const pedidoRequest: PedidoRequest = {
        cliente: undefined,
        itens: [],
        status: StatusPedido.NOVO,
      };
      pedidoGatewayMock.criarPedido.mockRejectedValue(new Error('Dados inválidos'));

      await expect(controller.cadastrarPedido(pedidoRequest)).rejects.toThrow('Dados inválidos');
    });
  });

  describe('Listar Pedidos', () => {
    it('deve buscar por um pedido específico', async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
      }
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;

      const ipedido: IPedido = pedidoTeste;

      pedidoGatewayMock.buscaPedido.mockResolvedValue(ipedido);

      const resultado = await controller.buscaPorId('pedido123');
      expect(resultado).toEqual({ pedidos: [pedidoResponse] });
    });

    it('deve buscar por um pedido específico e não encontrar', async () => {
      await expect(controller.buscaPorId('pedido123')).rejects.toThrow('Pedido não encontrado');
    });

    it('deve listar os pedidos por status', async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
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

    it('deve listar os pedidos por status', async () => {
      await expect(controller.buscaPorStatus('NAO EXISTE')).rejects.toThrow('Status inválido');
    });

    it('deve listar os pedidos por status da cozinha (Módulo2)', async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
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

  describe('Atualizar status', () => {
    it('atualizar o status de um pedido', async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
      };
      pedidoTeste.atualizarStatus(StatusPedido.ENVIADO_PARA_A_COZINHA);
      pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
      pedidoResponse.data = pedidoTeste.data;
      pedidoResponse.status = StatusPedido.ENVIADO_PARA_A_COZINHA;

      const pedido: IPedido = pedidoTeste;

      pedidoGatewayMock.atualizaStatusPedido.mockResolvedValue(pedido);

      const resultado = await controller.atualizarStatusPedido({ id: 'pedido123', status: 'ENVIADO_PARA_A_COZINHA' });
      expect(resultado).toBe(true);
    });
  });

  describe('Processar Mensagens', () => {
    it('deve processar mensagens com sucesso', async () => {
      const pedidoTeste = new Pedido();
      pedidoTeste.id = 'pedido123';
      pedidoTeste.cliente = {
        id: pedidoRequest.cliente!.id,
        nome: pedidoRequest.cliente!.nome,
        email: pedidoRequest.cliente!.email,
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
