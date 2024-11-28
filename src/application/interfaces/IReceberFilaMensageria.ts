import { IMensagemTransacao } from "./IMensagemTransacaoFila";

export interface IReceberFilaMensageria {
    receberFila(): Promise<IMensagemTransacao[]>;
    marcarMensagemLida(idMensagem: string): Promise<Boolean>;
}