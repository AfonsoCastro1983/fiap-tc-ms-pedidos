import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { FilaSQS } from "../src/infra/sqs/sqs";

// Mockando o SQSClient
jest.mock("@aws-sdk/client-sqs");

const mockedSQSClient = SQSClient as jest.MockedClass<typeof SQSClient>;

describe("filaSQS", () => {
    let fila: FilaSQS;
    let sendMock: jest.Mock;

    beforeEach(() => {
        // Limpa o mock antes de cada teste
        mockedSQSClient.prototype.send = jest.fn();
        sendMock = mockedSQSClient.prototype.send as jest.Mock;
        fila = new FilaSQS();
    });

    describe("Receber de uma fila", () => {
        it("deve retornar mensagens recebidas corretamente", async () => {
            const mensagensMock = [
                {
                    Body: JSON.stringify({ pedido: "123", status: "PENDENTE" }),
                    ReceiptHandle: "abc-receipt-123",
                },
                {
                    Body: JSON.stringify({ pedido: "456", status: "FINALIZADO" }),
                    ReceiptHandle: "def-receipt-456",
                },
            ];

            sendMock.mockResolvedValueOnce({ Messages: mensagensMock });

            const mensagens = await fila.receberFila();

            expect(sendMock).toHaveBeenCalledWith(
                expect.any(ReceiveMessageCommand)
            );

            expect(mensagens).toEqual([
                { pedido: "123", status: "PENDENTE", recibo: "abc-receipt-123" },
                { pedido: "456", status: "FINALIZADO", recibo: "def-receipt-456" },
            ]);
        });

        it("deve retornar um array vazio se não houver mensagens", async () => {
            sendMock.mockResolvedValueOnce({ Messages: undefined });

            const mensagens = await fila.receberFila();

            expect(sendMock).toHaveBeenCalledWith(
                expect.any(ReceiveMessageCommand)
            );
            expect(mensagens).toEqual([]);
        });

        it("deve capturar e logar erros", async () => {
            console.error = jest.fn(); // Mock do console.error
            sendMock.mockRejectedValueOnce(new Error("Erro ao receber mensagens"));

            const mensagens = await fila.receberFila();

            expect(sendMock).toHaveBeenCalledWith(
                expect.any(ReceiveMessageCommand)
            );
            expect(mensagens).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(
                "erro ao receber mensagens:",
                expect.any(Error)
            );
        });
    });

    describe("Marcar mensagem como lida", () => {
        it("deve retornar true ao marcar uma mensagem como lida com sucesso", async () => {
            sendMock.mockResolvedValueOnce({});

            const resultado = await fila.marcarMensagemLida("abc-receipt-123");

            expect(sendMock).toHaveBeenCalledWith(
                expect.any(DeleteMessageCommand)
            );
            expect(resultado).toBe(true);
        });

        it("deve retornar false se ocorrer um erro ao marcar uma mensagem como lida", async () => {
            console.log = jest.fn(); // Mock do console.log
            sendMock.mockRejectedValueOnce(new Error("Erro ao deletar mensagem"));

            const resultado = await fila.marcarMensagemLida("abc-receipt-123");

            expect(sendMock).toHaveBeenCalledWith(
                expect.any(DeleteMessageCommand)
            );
            expect(resultado).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                "erro ao marcar mensagem como lida: Mensagem(",
                "abc-receipt-123",
                ") erro =>",
                expect.any(Error)
            );
        });
    });
});