import express from "express";
import PedidoController from "../controllers/PedidoController";
import { PedidoGateway } from "../../database/gateways/PedidoGateway";
import { filaSQS } from "../../sqs/sqs";

const router = express.Router()

//Pedido
///2ªFase - Entregáveis 1 - Gravar pedido
router.post("/pedido", async (req, res) => {
    try {
        /*let authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: "Cabeçalho de Autorização não encontrado" });
        }
        //Retorna se token é de um cliente válido
        const cliGate = new ClienteGateway();
        const cli = await cliGate.buscarPorToken(authHeader);
        if (cli) {
            req.body.cliente = cli.id;
        }*/

        console.log("body", req.body);

        const controller = new PedidoController(new PedidoGateway(), new filaSQS());
        const item = await controller.cadastrarPedido(req.body);

        return res.status(201).send(item);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});
///2ªFase - Entregáveis 1 - v. Atualizar status do pedido
router.put("/pedido/status", async (req, res) => {
    try {
        /*let authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: "Cabeçalho de Autorização não encontrado" });
        }
        //Retorna se token é de um cliente válido
        const cliGate = new ClienteGateway();
        const cli = await cliGate.buscarPorToken(authHeader);
        if (cli) {
            req.body.cliente = cli.id;
        }*/
        
        const controller = new PedidoController(new PedidoGateway(), new filaSQS());
        const item = await controller.atualizarStatusPedido(req.body);

        return res.status(201).send(item);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
})
///1ªFase - Entregáveis 2 - vi. Listar pedidos
router.get("/pedido/listagem/:status", async (req, res) => {
    try {
        const controller = new PedidoController(new PedidoGateway(), new filaSQS());
        console.log("status",req.params.status);
        const resposta = await controller.buscaPorStatus(req.params.status);

        if (resposta) {
            return res.status(201).send(resposta);
        }
        else {
            return res.status(404).send("Pedido não encontrado");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

///2ªFase - Entregáveis 1 - iv. Lista de pedidos deverá retorná-los com sudas descrições ordenados na seguinte regra
////1. Pronto (PRONTO_PARA_ENTREGA) > Em Preparação (EM_PREPARACAO) > Recebido (ENVIADO_PARA_A_COZINHA)
////2. Pedidos mais antigos primeiro e mais novos depois
////3. Pedidos com status Finalizado (ENTREGUE) não devem aparecer na lista
router.get("/pedido/status/", async (req, res) => {
    try {
        const controller = new PedidoController(new PedidoGateway(), new filaSQS());
        const resposta = await controller.buscaPorStatusModulo2();

        if (resposta) {
            return res.status(201).send(resposta);
        }
        else {
            return res.status(404).send("Pedido não encontrado");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

///Buscar pedido
router.get("/pedido/id/:id", async (req, res) => {
    try {
        const controller = new PedidoController(new PedidoGateway(), new filaSQS());
        const resposta = await controller.buscaPorId(req.params.id);

        if (resposta) {
            return res.status(201).send(resposta);
        }
        else {
            return res.status(404).send("Pedido não encontrado");
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

///Atualizar status
router.get("/pedido/atualizastatus/", async(req, res) => {
    try {
        const controller = new PedidoController(new PedidoGateway(), new filaSQS());
        const resposta = await controller.atualizarStatusMensageria();

        if (resposta) {
            return res.status(201).send(resposta);
        }
        else {
            return res.status(404).send({erro: "Não retornou mensagens"});
        }
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});

export default router;