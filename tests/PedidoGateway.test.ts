import { PedidoGateway } from "../src/infra/database/gateways/PedidoGateway";
import { StatusPedido } from "../src/shared/enums/StatusPedido";
import PedidoModel from "../src/infra/database/repositories/Pedido";
import { PedidoMapper } from "../src/infra/database/mappers/PedidoMapper";
import { IPedido } from "../src/application/interfaces/IPedido";
import { Quantidade } from "../src/shared/valueobjects/Quantidade";
import { Preco } from "../src/shared/valueobjects/Preco";
import { PedidoResponse, PedidoRequest } from "../src/infra/http/controllers/PedidoController";
import { Pedido } from "../src/domain/entities/Pedido";
import { RepositoryPedidoDto } from "../src/domain/dtos/CadastrarPedidoDto";

//jest.mock("../src/infra/repositories/Pedido");
//jest.mock("../src/infra/database/mappers/PedidoMapper");

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


describe("PedidoGateway", () => {
    let pedidoGatewayMock: PedidoGateway;

    beforeEach(() => {
        pedidoGatewayMock = new PedidoGateway();
    });

    describe("generateShortId", () => {
        it("deve gerar um ID curto com o tamanho especificado", () => {
            const id = (pedidoGatewayMock as any).generateShortId(12);
            expect(id).toHaveLength(12);
        });
    });

    describe("Criação de pedidos", () => {
        it("deve criar e salvar um pedido com sucesso", async () => {
            const pedidoTeste = new Pedido();
            pedidoTeste.id = 'pedido123';
            pedidoTeste.cliente = {
                id: pedidoRequest.cliente!.id,
                nome: pedidoRequest.cliente!.nome,
                email: pedidoRequest.cliente!.email,
            }
            pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
            pedidoResponse.data = pedidoTeste.data;

            PedidoModel.prototype.save = jest.fn();

            const resultado = await pedidoGatewayMock.criarPedido(pedidoTeste);

            expect(PedidoModel.prototype.save).toHaveBeenCalled();
            expect(resultado.id).toEqual(pedidoTeste.id);
            expect(resultado.valorTotal).toEqual(pedidoTeste.valorTotal);
        });
    });

    describe("Buscar por pedidos", () => {
        it("deve buscar um pedido pelo ID com sucesso", async () => {
            const pedidoMock: RepositoryPedidoDto = {
                id: "pedido123",
                data: new Date(),
                cliente: pedidoRequest.cliente,
                itens: [{ item: pedidoRequest.itens![0].item, quantidade: pedidoRequest.itens![0].quantidade, total: 100 }],
                valorTotal: 100,
                status: StatusPedido.NOVO
            }

            PedidoModel.get = jest.fn().mockResolvedValue(pedidoMock);
            const resultado = await pedidoGatewayMock.buscaPedido("pedido123");

            expect(PedidoModel.get).toHaveBeenCalledWith({ id: "pedido123" });
            expect(resultado.id).toEqual(pedidoMock.id);
        });

        it("deve lançar erro se o pedido não for encontrado", async () => {
            PedidoModel.get = jest.fn().mockResolvedValue(null);

            await expect(pedidoGatewayMock.buscaPedido("pedidoInvalido")).rejects.toThrow(
                "Pedido não encontrado"
            );
        });
    });

    describe("Atualizar status dos pedidos", () => {
        it("deve atualizar o status do pedido com sucesso", async () => {
            const pedidoTeste = new Pedido();
            pedidoTeste.id = 'pedido123';
            pedidoTeste.cliente = {
                id: pedidoRequest.cliente!.id,
                nome: pedidoRequest.cliente!.nome,
                email: pedidoRequest.cliente!.email,
            }
            pedidoTeste.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);

            jest.spyOn(pedidoGatewayMock, "buscaPedido").mockResolvedValue(pedidoTeste);
            const pedidoMudado = new Pedido();
            pedidoMudado.id = 'pedido123';
            pedidoMudado.cliente = {
                id: pedidoRequest.cliente!.id,
                nome: pedidoRequest.cliente!.nome,
                email: pedidoRequest.cliente!.email,
            }
            pedidoMudado.adicionarItem(pedidoRequest.itens![0].item, pedidoRequest.itens![0].quantidade);
            pedidoMudado.atualizarStatus(StatusPedido.PRONTO_PARA_ENTREGA)
            jest.spyOn(pedidoGatewayMock, "criarPedido").mockResolvedValue(pedidoMudado);

            const resultado = await pedidoGatewayMock.atualizaStatusPedido(
                "pedido123",
                StatusPedido.PRONTO_PARA_ENTREGA
            );

            expect(pedidoGatewayMock.buscaPedido).toHaveBeenCalledWith("pedido123");
            expect(pedidoGatewayMock.criarPedido).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: StatusPedido.PRONTO_PARA_ENTREGA,
                })
            );
            expect(resultado.status).toEqual(StatusPedido.PRONTO_PARA_ENTREGA);
        });

        it("deve lançar erro se o pedido não for encontrado", async () => {

            expect(pedidoGatewayMock.atualizaStatusPedido("pedido123",StatusPedido.PRONTO_PARA_ENTREGA)).rejects.toThrow("Pedido não encontrado");
        });
    });

    describe("busca Por Status", () => {
        it("deve retornar pedidos com o status especificado", async () => {
            const pedidosMock = [
                { id: "pedido123", status: StatusPedido.NOVO, data: new Date() },
            ];

            PedidoModel.query = jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnThis(),
                using: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(pedidosMock),
            });

            const resultado = await pedidoGatewayMock.buscaPorStatus("NOVO");

            expect(PedidoModel.query).toHaveBeenCalledWith("status");
            expect(resultado).toHaveLength(1);
            expect(resultado[0].status).toEqual(StatusPedido.NOVO);
        });

        it("deve lançar erro se o status for inválido", async () => {
            await expect(pedidoGatewayMock.buscaPorStatus("INVALIDO")).rejects.toThrow(
                "Status inválido"
            );
        });

        it("deve retornar pedidos com o status do Módulo 2", async () => {
            const pedidosMock = [
                { id: "pedido123", status: StatusPedido.ENVIADO_PARA_A_COZINHA, data: new Date() },
            ];

            PedidoModel.scan = jest.fn().mockReturnValue({
                in: jest.fn().mockReturnThis(),
                using: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(pedidosMock),
            });

            const resultado = await pedidoGatewayMock.buscaPorStatusModulo2();

            expect(resultado).toHaveLength(1);
            expect(resultado[0].status).toEqual(StatusPedido.ENVIADO_PARA_A_COZINHA);
        });
    });
});
