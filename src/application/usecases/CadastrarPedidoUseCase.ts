import { Pedido } from "../../domain/entities/Pedido";
import { StatusPedido } from "../../shared/enums/StatusPedido";
import { CadastrarPedidoDto } from "../../domain/dtos/CadastrarPedidoDto";
import { IPedidoGateway } from "../interfaces/IPedidoGateway";
import { IPedido } from "../interfaces/IPedido";

export class CadastrarPedidoUseCase {
    private pedidoGateway: IPedidoGateway;

    constructor(pedidoGateway: IPedidoGateway) {
        this.pedidoGateway = pedidoGateway;
    }

    async execute(dto: CadastrarPedidoDto): Promise<IPedido> {
        const pedido = new Pedido();
        if (dto.cliente) {
            pedido.cliente = {
                id: dto.cliente.id,
                nome: dto.cliente.nome,
                email: dto.cliente.email
            }
        }
        if (dto.id) {
            pedido.id = dto.id;
        }
        pedido.atualizarStatus(dto.status);
        if (!dto.itens) {
            throw new Error('Pedido sem itens');
        }

        dto.itens.forEach(element => {
            pedido.adicionarItem(
                {
                    id: element.item.id,
                    nome: element.item.nome,
                    descricao: element.item.descricao,
                    ingredientes: element.item.ingredientes,
                    categoria: element.item.categoria,
                    preco: element.item.preco
                }, element.quantidade);
        });

        console.log('Pedido para gravação:', pedido);

        return await this.pedidoGateway.criarPedido(pedido);
    }

    async atualizaPedido(id: String, status: String): Promise<boolean> {
        const status_valido = StatusPedido[status.toUpperCase() as keyof typeof StatusPedido];
        const pedido = await this.pedidoGateway.atualizaStatusPedido(id, status_valido);
        console.log(pedido.status, status_valido.toString());
        return pedido.status == status_valido.toString();
    }
}
