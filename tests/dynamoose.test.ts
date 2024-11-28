import dynamoose from "dynamoose";
import dotenv from "dotenv";

// Cria o mock fora do jest.mock para poder referenciá-lo depois
const mockDynamoDB = jest.fn();
const mockSet = jest.fn();

// Mock do dynamoose
jest.mock("dynamoose", () => ({
    aws: {
        ddb: {
            set: mockSet,
            DynamoDB: mockDynamoDB
        },
    },
}));

jest.mock("dotenv", () => ({
    config: jest.fn().mockReturnValue({ parsed: {} }),
}));

describe("Configuração do Dynamoose", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let consoleLogSpy: jest.SpyInstance;

    beforeAll(() => {
        originalEnv = { ...process.env };
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(() => {
        process.env = originalEnv;
        consoleLogSpy.mockRestore();
    });

    beforeEach(() => {
        // Limpa mocks e módulos
        jest.clearAllMocks();
        jest.resetModules();
        
        // Configura variáveis de ambiente
        process.env.AWS_ACCESS_KEY_ID = "test-access-key-id";
        process.env.AWS_SECRET_ACCESS_KEY = "test-secret-access-key";
        
        // Reseta os mocks
        mockDynamoDB.mockReset();
        mockSet.mockReset();
        
        // Configura retorno padrão
        mockDynamoDB.mockReturnValue({});

        // Limpa cache
        jest.isolateModules(() => {
            try {
                delete require.cache[require.resolve('../src/infra/database/dynamoose')];
            } catch (error) {
                // Ignora erro se o módulo ainda não foi carregado
            }
        });
    });

    it("deve configurar o Dynamoose corretamente com credenciais válidas", () => {
        const region = "us-east-2";
        
        // Carrega o módulo
        require("../src/infra/database/dynamoose");

        // Verifica a chamada do mockDynamoDB
        expect(mockDynamoDB).toHaveBeenCalledWith({
            region,
            credentials: {
                accessKeyId: "test-access-key-id",
                secretAccessKey: "test-secret-access-key",
            },
        });

        // Verifica se o set foi chamado
        expect(mockSet).toHaveBeenCalledWith(expect.any(Object));
    });

    it("deve lançar um erro se as credenciais não estiverem configuradas", () => {
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;

        expect(() => {
            require("../src/infra/database/dynamoose");
        }).toThrow("Credenciais AWS não configuradas");
    });

    it("deve logar as informações de configuração corretamente", () => {
        require("../src/infra/database/dynamoose");

        expect(consoleLogSpy).toHaveBeenCalledWith("region:", "us-east-2");
        expect(consoleLogSpy).toHaveBeenCalledWith(
            "accessKeyId:",
            "test-access-key-id"
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            "secretAccessKey:",
            "test-secret-access-key"
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
            "Dynamoose configurado com sucesso para a região:",
            "us-east-2"
        );
    });
});