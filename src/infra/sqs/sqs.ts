import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { IReceberFilaMensageria } from "../../application/interfaces/IReceberFilaMensageria";
import { IMensagemTransacao } from "../../application/interfaces/IMensagemTransacaoFila";

export class filaSQS implements IReceberFilaMensageria {
    private _sqsClient: SQSClient;
    private _queueURL: string = 'https://sqs.us-east-2.amazonaws.com/992382363343/lanchonete-fiap-status-pedido.fifo';

    constructor() {
        this._sqsClient = new SQSClient({ region: 'us-east-2' });
    }

    public async receberFila(): Promise<IMensagemTransacao[]> {
        const params = {
            QueueUrl: this._queueURL,
            MaxNumberOfMessages: 5, // Quantidade de mensagens para receber de uma vez
            WaitTimeSeconds: 15 // Long Polling
        };

        const mensagens_retorno: IMensagemTransacao[] = [];

        try {
            const data = await this._sqsClient.send(new ReceiveMessageCommand(params));
            if (data.Messages) {
                for (const message of data.Messages) {
                    console.log("mensagem recebida:", message.Body);
                    if (message.Body) {
                        const mensagem = JSON.parse(message.Body);
                        mensagens_retorno.push({
                            pedido: mensagem.pedido.toString(),
                            status: mensagem.status,
                            recibo: message.ReceiptHandle!
                        });
                    }
                }
            }
        } catch (err) {
            console.error("erro ao receber mensagens:", err);
        }

        return mensagens_retorno;        
    }

    public async marcarMensagemLida(idMensagem: string): Promise<Boolean> {
        try {
            await this._sqsClient.send(new DeleteMessageCommand({
                QueueUrl: this._queueURL,
                ReceiptHandle: idMensagem
            }));
            return true;
        }
        catch (error) {
            console.log('erro ao marcar mensagem como lida: Mensagem(',idMensagem,') erro =>', error);
            return false;
        }

    }
}
