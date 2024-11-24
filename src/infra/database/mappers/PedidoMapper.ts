import { Pedido } from "../../../domain/entities/Pedido";
import { RepositoryPedidoDto } from "../../../domain/dtos/CadastrarPedidoDto";

export class PedidoMapper {
    static toDTO(pedido: Pedido): RepositoryPedidoDto {
        return {
            id: pedido.id,
            cliente: pedido.cliente,
            itens: pedido.itens.map(item => ({
                item: {
                    id: item.item.id,
                    nome: item.item.nome,
                    descricao: item.item.descricao,
                    preco: item.item.preco,
                    ingredientes: item.item.ingredientes,
                    categoria: item.item.categoria
                },
                quantidade: item.quantidade.valor,
                total: item.item.preco * item.quantidade.valor
            })),
            status: pedido.status,
            valorTotal: pedido.valorTotal.valor,
            data: pedido.data
        };
    }
}