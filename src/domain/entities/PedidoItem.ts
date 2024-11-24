import { IItem } from "../../application/interfaces/IItem";
import { IPedidoItem } from "../../application/interfaces/IPedidoItem";
import { Preco } from "../../shared/valueobjects/Preco";
import { Quantidade } from "../../shared/valueobjects/Quantidade";

export class PedidoItem implements IPedidoItem{
    private _item: IItem;
    private _quantidade: Quantidade;

    constructor(item: IItem, quantidade: number) {
        this._item = item;
        this._quantidade = new Quantidade(quantidade);
    }

    get item(): IItem {
        return this._item;
    }

    get quantidade(): Quantidade {
        return this._quantidade;
    }

    get total(): Preco {
        return new Preco(this._item.preco * this._quantidade.valor);
    }

    alterarQuantidade(quantidade: number) {
        this._quantidade.alterarQuantidade(quantidade);
    }
}