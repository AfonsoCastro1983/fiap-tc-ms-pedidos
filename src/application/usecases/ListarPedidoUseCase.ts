import { AnyItem } from "dynamoose/dist/Item";
import PedidoModel from "../../infra/database/repositories/Pedido";
import { StatusPedido } from "../../shared/enums/StatusPedido";
import { IPedido } from "../interfaces/IPedido";
import { Pedido } from "../../domain/entities/Pedido";

export class ListarPedidosUseCase {

    private async converteEmIPedido(repository: AnyItem): Promise<IPedido> {
        const pedido = new Pedido();
        if (repository.cliente) {
            pedido.cliente = {
                id: repository.cliente.id,
                nome: repository.cliente.nome,
                email: repository.cliente.email,
            }
        }
        pedido.data = repository.data;
        pedido.id = repository.id;
        pedido.atualizarStatus(repository.status);

        if (repository.itens && Array.isArray(repository.itens)) {
            for (const item of repository.itens) {
                if (item.item && item.quantidade?.valor) {
                    pedido.adicionarItem(
                        {
                            id: item.item.id,
                            nome: item.item.nome,
                            descricao: item.item.descricao,
                            ingredientes: item.item.ingredientes,
                            categoria: item.item.categoria,
                            preco: item.item.preco,
                        },
                        item.quantidade.valor
                    );
                }
            }
        }

        return pedido;
    }

    async buscaPorID(index: string): Promise<Array<IPedido>> {
        console.log("buscaPorID(", index, ")");
        const pedido = await PedidoModel.get({id: index});
        return this.converteArrayPedidos([pedido]);
    }

    async converteArrayPedidos(repPedidos: Array<AnyItem>): Promise<IPedido[]> {
        const pedidos: IPedido[] = [];
        for (const element of repPedidos) {
            const pedido = await this.converteEmIPedido(element);
            pedidos.push(pedido);
        }
        return pedidos;
    }

    async buscaPorStatus(status: string): Promise<Array<IPedido>> {
        const statusValido = StatusPedido[status.toUpperCase() as keyof typeof StatusPedido];       

        if (statusValido) {
            const pedidos = await PedidoModel.query("status").eq(statusValido).using("StatusIndex").exec();
            return this.converteArrayPedidos(pedidos);
        }
        else {
            throw new Error('Status inválido')
        }
    }

    async buscaPorStatusModulo2(): Promise<Array<IPedido>> {
        const statusValido = [StatusPedido.PRONTO_PARA_ENTREGA, StatusPedido.EM_PREPARACAO, StatusPedido.ENVIADO_PARA_A_COZINHA];

        if (statusValido) {
            const pedidos = await PedidoModel.query("status").in(statusValido).using("StatusIndex").exec();
            return this.converteArrayPedidos(pedidos);
        }
        else {
            throw new Error('Status inválido')
        }
    }
}