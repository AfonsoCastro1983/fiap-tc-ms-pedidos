import { StatusPedido } from "../../shared/enums/StatusPedido";
import { IPedido } from "../interfaces/IPedido";
import { IPedidoGateway } from "../interfaces/IPedidoGateway";

export class ListarPedidosUseCase {
    private _pedidoGateway: IPedidoGateway;

    constructor (pedidoGateway: IPedidoGateway) {
        this._pedidoGateway = pedidoGateway;
    }   

    async buscaPorID(index: string): Promise<Array<IPedido>> {
        const pedido = await this._pedidoGateway.buscaPedido(index);
        let resposta: Array<IPedido> = [];
        if (pedido) {
            resposta = [pedido];
        }
        return resposta;
    }   

    async buscaPorStatus(status: string): Promise<Array<IPedido>> {
        const statusValido = StatusPedido[status.toUpperCase() as keyof typeof StatusPedido];

        if (statusValido) {
            return await this._pedidoGateway.buscaPorStatus(statusValido);            
        }
        else {
            throw new Error('Status inválido')
        }
    }

    async buscaPorStatusModulo2(): Promise<Array<IPedido>> {
        return await this._pedidoGateway.buscaPorStatusModulo2();
    }
}