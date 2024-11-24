import { ICliente } from "../../application/interfaces/ICliente";
import { StatusPedido } from "../../shared/enums/StatusPedido";

export class CadastrarPedidoDto {
    id?: string;
    cliente?: ICliente;
    itens?: { item: { id: number, nome: string, descricao: string, preco: number, ingredientes: string, categoria: string }, quantidade: number }[];
    status: StatusPedido = StatusPedido.NOVO;
}

export class RepositoryPedidoDto {
    id: string = "";
    data: Date = new Date();
    cliente?: ICliente;
    itens?: { item: { id: number, nome: string, descricao: string, preco: number, ingredientes: string, categoria: string }, quantidade: number, total: number }[];
    valorTotal: number = 0;
    status: StatusPedido = StatusPedido.NOVO;
}