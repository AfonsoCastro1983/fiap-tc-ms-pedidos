import { IPedidoGateway } from "../../../application/interfaces/IPedidoGateway";
import { IPedido } from "../../../application/interfaces/IPedido";
import PedidoModel from "../repositories/Pedido";
import { StatusPedido } from "../../../shared/enums/StatusPedido";
import { PedidoMapper } from "../mappers/PedidoMapper";
import { Pedido } from "../../../domain/entities/Pedido";
import { AnyItem } from "dynamoose/dist/Item";
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

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
        console.log('Array itens', repository.itens);

        if (repository.itens && Array.isArray(repository.itens)) {
            for (const item of repository.itens) {
                console.log('Iteração', item);
                pedido.adicionarItem(
                    {
                        id: item.item.id,
                        nome: item.item.nome,
                        descricao: item.item.descricao,
                        ingredientes: item.item.ingredientes,
                        categoria: item.item.categoria,
                        preco: item.item.preco,
                    },
                    item.quantidade
                );
            }
        }

        return pedido;
    }

    async converteArrayPedidos(repPedidos: AnyItem[]| QueryResponse<AnyItem>): Promise<IPedido[]> {
        const pedidos: IPedido[] = [];
        for (const element of repPedidos) {
            if (element) {
                const pedido = await this.converteEmIPedido(element);
                pedidos.push(pedido);
            }
        }
        return pedidos;
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

    async buscaPedido(pedido: string): Promise<IPedido> {
        console.log("buscarPedido");
        const pedidos = await PedidoModel.get({ id: pedido });;
        if (!pedidos) {
            throw new Error('Pedido não encontrado');
        }
        const pedidoRegistrado = this.converteEmIPedido(pedidos);
        console.log('Pedido registrado =>', pedidoRegistrado);

        return pedidoRegistrado;
    }

    async atualizaStatusPedido(pedido: string, novo_status: StatusPedido): Promise<IPedido> {
        let pedidoRegistrado = await this.buscaPedido(pedido);

        console.log('AtualizaPedido(', pedido, ',', novo_status, ')');

        pedidoRegistrado.atualizarStatus(novo_status);

        pedidoRegistrado = await this.criarPedido(pedidoRegistrado);
        return pedidoRegistrado;
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

        const pedidos = await PedidoModel.scan("status").in(statusValido).using("StatusIndex").exec();
        return this.converteArrayPedidos(pedidos);
    }
}