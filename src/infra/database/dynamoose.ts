import dynamoose from "dynamoose";
import dotenv from 'dotenv';

dotenv.config();

// Configuração de ambiente para o DynamoDB
const region = "us-east-2";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

console.log('region:',region);
console.log('accessKeyId:',accessKeyId);
console.log('secretAccessKey:',secretAccessKey);

if (!accessKeyId || !secretAccessKey) {
    throw new Error("Credenciais AWS não configuradas");
}

// Configurando o DynamoDB para o Dynamoose
dynamoose.aws.ddb.set(new dynamoose.aws.ddb.DynamoDB({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    }
}));

console.log("Dynamoose configurado com sucesso para a região:", region);

export default dynamoose;