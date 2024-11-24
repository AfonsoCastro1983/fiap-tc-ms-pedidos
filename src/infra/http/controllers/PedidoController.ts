import { Body, Post, Get, Route, Tags, Path, Put } from "tsoa";
import { CadastrarPedidoDto } from "../../../domain/dtos/CadastrarPedidoDto";
import { CadastrarPedidoUseCase } from "../../../application/usecases/CadastrarPedidoUseCase";
import { ListarPedidosUseCase } from "../../../application/usecases/ListarPedidoUseCase";
import { IPedido } from "../../../application/interfaces/IPedido";
import { PedidoGateway } from "../../database/gateways/PedidoGateway";
import { ICliente } from "../../../application/interfaces/ICliente";
import { IItem } from "../../../application/interfaces/IItem";

export interface PedidoRequest extends CadastrarPedidoDto {
}

export interface PedidoStatusRequest {
    id: String;
    status: String;
}

interface PedidoResponse {
    id: String;
    data: Date;
    status: String;
    cliente?: ICliente;
    total: number;
    pedidoItems: { item: IItem, quantidade: number, total: number }[];
}

interface Pedidos {
    pedidos: Array<PedidoResponse>;
}

@Route("pedido")
@Tags("Pedido")
export default class PedidoController {
    private cadastrarPedidoUseCase: CadastrarPedidoUseCase;

    constructor(pedidoGateway: PedidoGateway) {
        this.cadastrarPedidoUseCase = new CadastrarPedidoUseCase(pedidoGateway);
    }

    private formataResposta(pedidos: Array<IPedido>) {
        if (!pedidos || pedidos.length === 0) {
            throw new Error("Pedido não encontrado");
        }

        const pedidosResponse: PedidoResponse[] = pedidos.map(pedido => ({
            id: pedido.id ?? "",
            data: pedido.data,
            status: pedido.status,
            cliente: !pedido.cliente ? undefined : {
                id: pedido.cliente.id,
                nome: pedido.cliente.nome,
                email: pedido.cliente.email
            },
            total: pedido.valorTotal.valor,
            pedidoItems: pedido.itens === undefined
                ? []
                : pedido.itens.map(item => ({
                    item: {
                        id: item.item.id,
                        nome: item.item.nome,
                        descricao: item.item.descricao,
                        ingredientes: item.item.ingredientes,
                        categoria: item.item.categoria,
                        preco: item.item.preco
                    },
                    quantidade: item.quantidade.valor,
                    total: item.total.valor
                }))
        }));
        return pedidosResponse;
    }
    /**
     * Busca um pedido específico
     * @param id identificador do pedido
     * @returns 
     * Lista de pedidos encontrados
     */
    @Get("/id/:id")
    public async buscaPorId(@Path() id: string): Promise<Pedidos> {
        const listaPedidos = new ListarPedidosUseCase();
        const pedidos = await listaPedidos.buscaPorID(id);

        console.log('BuscaPorId', pedidos);

        const pedidosResponse: PedidoResponse[] = this.formataResposta(pedidos);

        console.log('BuscaPorIdSaida', pedidosResponse);

        return { pedidos: pedidosResponse };
    }
    /**
     * Busca pedidos por um status específico
     * @param status status do pedido.
     * Opções de status para pesquisar:
     * - NOVO (Pedido que acabou de ser solicitado),
     * - ENVIAR_PARA_PAGAMENTO (Pedido que já foi conlcuído pelo cliente e o mesmo solicitou seu pagamento)
     * - CANCELADO (Pedido Cancelado, pelo cliente ou pelo sistema)
     * - ENVIADO_PARA_A_COZINHA (Pedido já pago, enviado para iniciar a preparação)
     * - EM_PREPARACAO (Pedido em preparação)
     * - PREPARADO (Pedido finalizado e disponível para embalagem)
     * - PRONTO_PARA_ENTREGA (Pedido embalado ou pronto para entrega no balcão)
     * - ENTREGUE (Pedido entregue pelo cliente)
     * @returns 
     * Lista de pedidos encontrados
     */
    @Get("listagem/:status")
    public async buscaPorStatus(@Path() status: string): Promise<Pedidos> {
        const listaPedidos = new ListarPedidosUseCase();
        const pedidos = await listaPedidos.buscaPorStatus(status);

        const pedidosResponse: PedidoResponse[] = this.formataResposta(pedidos);

        return { pedidos: pedidosResponse };
    }
    /**
     * Busca pedidos pelos status descritos no módulo 2 (Pronto (PRONTO_PARA_ENTREGA) > Em Preparação (EM_PREPARACAO) > Recebido (ENVIADO_PARA_A_COZINHA))
     * @returns 
     * Lista de pedidos encontrados
     */
    @Get("/status/")
    public async buscaPorStatusModulo2(): Promise<Pedidos> {
        const listaPedidos = new ListarPedidosUseCase();
        const pedidos = await listaPedidos.buscaPorStatusModulo2();

        const pedidosResponse: PedidoResponse[] = this.formataResposta(pedidos);

        return { pedidos: pedidosResponse };
    }
    /**
     * Cadastrar pedido
     */
    @Post("/")
    public async cadastrarPedido(@Body() body: PedidoRequest): Promise<PedidoResponse> {
        const dto: CadastrarPedidoDto = {
            id: body.id,
            cliente: body.cliente,
            itens: body.itens,
            status: body.status,
        }

        const pedido = await this.cadastrarPedidoUseCase.execute(dto);
        console.log(pedido);

        const pedidoResponse: PedidoResponse = {
            id: pedido.id ?? "",
            data: pedido.data,
            status: pedido.status,
            cliente: !pedido.cliente ? undefined : {
                id: pedido.cliente.id,
                nome: pedido.cliente.nome,
                email: pedido.cliente.email
            },
            total: pedido.valorTotal.valor,
            pedidoItems: pedido.itens === undefined
                ? []
                : pedido.itens.map(item => ({
                    item: {
                        id: item.item.id,
                        nome: item.item.nome,
                        descricao: item.item.descricao,
                        ingredientes: item.item.ingredientes,
                        categoria: item.item.categoria,
                        preco: item.item.preco
                    },
                    quantidade: item.quantidade.valor,
                    total: item.total.valor
                }))
        };

        return pedidoResponse;
    }
    /**
     * Atualizar status de um pedido
     * @param body 
     * @returns 
     */
    @Put("/status")
    public async atualizarStatusPedido(@Body() body: PedidoStatusRequest): Promise<boolean> {
        const resposta = await this.cadastrarPedidoUseCase.atualizaPedido(body.id, body.status);
        return resposta;
    }
}