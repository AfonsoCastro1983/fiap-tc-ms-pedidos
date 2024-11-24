import { IPedidoGateway } from "../../../application/interfaces/IPedidoGateway";
import { IPedido } from "../../../application/interfaces/IPedido";
import PedidoModel from "../repositories/Pedido";
import { StatusPedido } from "../../../shared/enums/StatusPedido";
import { ListarPedidosUseCase } from "../../../application/usecases/ListarPedidoUseCase";
import { Preco } from "../../../shared/valueobjects/Preco";
import { PedidoMapper } from "../mappers/PedidoMapper";
import { Pedido } from "../../../domain/entities/Pedido";

export class PedidoGateway implements IPedidoGateway {
    private generateShortId(length: number = 12): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const currentTime = new Date().getTime().toString().slice(-4);

        // Adiciona timestamp para garantir unicidade
        result += currentTime;

        // Completa o resto do ID com caracteres aleatórios
        const remainingLength = length - currentTime.length;
        for (let i = 0; i < remainingLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    }

    async criarPedido(pedido: IPedido): Promise<IPedido> {
        console.log('PedidoGateway.criarPedido()');
        console.log(pedido);

        const pdd = new Pedido();
        pdd.id = pedido.id || this.generateShortId();
        if (pedido.cliente) {
            pdd.cliente = {
                id: pedido.cliente.id,
                nome: pedido.cliente.nome,
                email: pedido.cliente.email
            }
        }
        pedido.itens.forEach(element => {
            pdd.adicionarItem({
                id: element.item.id,
                nome: element.item.nome,
                descricao: element.item.descricao,
                ingredientes: element.item.ingredientes,
                categoria: element.item.categoria,
                preco: element.item.preco
            }, element.quantidade.valor);
        });

        // Constrói o objeto de saída seguindo a estrutura da interface IPedido
        const pedidoGravacao = PedidoMapper.toDTO(pdd);

        // Log de conversão
        console.log('pedidoGravacao', pedidoGravacao);

        // Cria o modelo Dynamoose
        const gravaPedido = new PedidoModel(pedidoGravacao);

        console.log('gravaPedido:', gravaPedido);
        console.log('Dados enviados ao DynamoDB:', JSON.stringify(gravaPedido.toJSON(), null, 2))

        // Salva no DynamoDB
        await gravaPedido.save();

        console.log('Pedido gravado!');

        const retorno: IPedido = pdd;

        return retorno;
    }

    async buscarPedido(pedido: string): Promise<IPedido> {
        console.log("buscarPedido");
        const pedidos = await new ListarPedidosUseCase().buscaPorID(pedido);
        if (!pedidos) {
            throw new Error('Erro na pesquisa de pedidos');
        }
        if (pedidos.length == 0) {
            throw new Error('Pedido não encontrado');
        }
        const pedidoRegistrado = pedidos[0];
        console.log('Pedido registrado =>', pedidoRegistrado);

        return pedidoRegistrado;
    }

    async atualizaStatusPedido(pedido: string, novo_status: StatusPedido): Promise<IPedido> {
        let pedidoRegistrado = await this.buscarPedido(pedido);
        if (!pedidoRegistrado) {
            throw new Error('Pedido não encontrado');
        }

        console.log('AtualizaPedido(', pedido, ',', novo_status, ')');

        pedidoRegistrado.atualizarStatus(novo_status);

        pedidoRegistrado = await this.criarPedido(pedidoRegistrado);
        return pedidoRegistrado;
    }
}