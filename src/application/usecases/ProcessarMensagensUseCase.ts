import { IReceberFilaMensageria } from "../interfaces/IReceberFilaMensageria";
import { IPedidoGateway } from "../interfaces/IPedidoGateway";
import { IMensagemTransacao } from "../interfaces/IMensagemTransacaoFila";

export class ProcessarMensagensFilaUseCase {
    private _filaMensageria: IReceberFilaMensageria;
    private _pedidoGateway: IPedidoGateway;

    constructor(filaMensageria: IReceberFilaMensageria, pedidoGateway: IPedidoGateway) {
        this._filaMensageria = filaMensageria;
        this._pedidoGateway = pedidoGateway;
    }

    public async executar(): Promise<IMensagemTransacao[]> {
        const mensagens = await this._filaMensageria.receberFila();

        for (const mensagem of mensagens) {

            console.log("Processando mensagem:", mensagem);
            // Atualiza pedido
            try {
                await this._pedidoGateway.atualizaStatusPedido(mensagem.pedido, mensagem.status);
            }
            catch (error) {
                console.log('Processamento mensagem =>',error);
            }
            // Retira da fila
            const retornoMarcacaoLida = await this._filaMensageria.marcarMensagemLida(mensagem.recibo);
            if (!retornoMarcacaoLida) {
                console.log('Falha ao marcar mensagem como lida: Receipt =>',mensagem.recibo);
            }
        }

        return mensagens;
    }
}