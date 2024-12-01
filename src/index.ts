import express, { Application } from "express";
import morgan from "morgan";
import router from "./infra/http/routes/routes";
import swaggerUi from "swagger-ui-express";
import dotenv from 'dotenv';
import dynamoose from "./infra/database/dynamoose";

dotenv.config();

const PORT = process.env.PORT || 8000;

const app: Application = express();
app.disable("x-powered-by");

console.log('MODE:', process.env.MODE);

const initializeApp = async () => {
    try {
        // Verifica a configuração do Dynamoose (opcional: listar tabelas para validar a conexão)
        const tables = await dynamoose.aws.ddb().listTables();
        console.log("Conexão com o DynamoDB bem-sucedida.");
        console.log("Tabelas disponíveis:", tables.TableNames);
    } catch (error) {
        console.error("Erro ao inicializar a aplicação:", error);
        process.exit(1); // Encerra o processo em caso de falha crítica
    }
};

initializeApp();

app.use(express.json());
app.use(morgan("tiny"));
app.use(express.static("public"));

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        swaggerOptions: {
            url: "/swagger.json",
        },
    })
);

app.use(router);

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});