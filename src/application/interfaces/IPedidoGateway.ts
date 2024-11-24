import { IPedido } from "./IPedido";
import { StatusPedido } from "../../shared/enums/StatusPedido";

export interface IPedidoGateway {
    criarPedido(pedido: IPedido): Promise<IPedido>;
    buscarPedido(pedido: String): Promise<IPedido>;
    atualizaStatusPedido(pedido: String, novo_status: StatusPedido): Promise<IPedido>;
}