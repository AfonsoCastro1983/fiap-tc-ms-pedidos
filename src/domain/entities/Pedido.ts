import { IItem } from '../../application/interfaces/IItem';
import { ICliente } from '../../application/interfaces/ICliente';
import { Preco } from '../../shared/valueobjects/Preco';
import { PedidoItem } from './PedidoItem';
import { StatusPedido } from '../../shared/enums/StatusPedido';
import { IPedido } from '../../application/interfaces/IPedido';

export class Pedido implements IPedido {
    private _id: string = "";
    private _cliente?: ICliente;
    private _itens: PedidoItem[] = [];
    private _status: StatusPedido;
    private _valorTotal: Preco;
    private _dataCriacao: Date;

    constructor() {
        this._status = StatusPedido.NOVO;
        this._valorTotal = new Preco(0);
        this.atualizarValorTotal(this._itens);
        this._dataCriacao = new Date();
    }

    private atualizarValorTotal(itens: PedidoItem[]) {
        this._valorTotal = itens.reduce(
            (total, item) => total.somar(item.total),
            new Preco(0)
        );
        console.log('atualizarValorTotal', this._valorTotal);
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get cliente(): ICliente | undefined {
        return this._cliente;
    }

    set cliente(value: ICliente | undefined) {
        this._cliente = value;
    }

    get itens(): PedidoItem[] {
        return this._itens;
    }

    get status(): StatusPedido {
        return this._status;
    }

    get valorTotal(): Preco {
        return this._valorTotal;
    }

    get data(): Date {
        return this._dataCriacao;
    }

    set data(value: Date) {
        this._dataCriacao = value;
    }

    atualizarStatus(novoStatus: StatusPedido): void {
        this._status = novoStatus;
    }

    adicionarItem(itemAdicionado: IItem, quantidade: number): void {
        const novoItem: PedidoItem = new PedidoItem(itemAdicionado, quantidade);
        this._itens.push(novoItem);
        //Atualizar total
        this.atualizarValorTotal(this._itens);
    }
}