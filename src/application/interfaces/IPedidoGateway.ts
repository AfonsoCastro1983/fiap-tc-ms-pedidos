import { IPedido } from "./IPedido";
import { StatusPedido } from "../../shared/enums/StatusPedido";

export interface IPedidoGateway {
    criarPedido(pedido: IPedido): Promise<IPedido>;
    buscaPedido(pedido: String): Promise<IPedido>;
    buscaPorStatus(status: StatusPedido): Promise<Array<IPedido>>;
    buscaPorStatusModulo2(): Promise<Array<IPedido>>;
    atualizaStatusPedido(pedido: String, novo_status: StatusPedido): Promise<IPedido>;
}