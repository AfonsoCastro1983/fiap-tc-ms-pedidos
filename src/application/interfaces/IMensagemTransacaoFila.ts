import { StatusPedido } from "../../shared/enums/StatusPedido"

export interface IMensagemTransacao {
    pedido: string;
    status: StatusPedido;
    recibo: string;
}