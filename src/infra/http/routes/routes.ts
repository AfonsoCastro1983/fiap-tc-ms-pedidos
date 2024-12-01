import express from "express";
import PedidoController from "../controllers/PedidoController";
import { PedidoGateway } from "../../database/gateways/PedidoGateway";
import { FilaSQS } from "../../sqs/sqs";
import { ValidarClienteController } from "../controllers/ValidaClienteController";
import { ValidarClienteGateway } from "../../database/gateways/ValidarClienteGateway";

const router = express.Router()

const sendResponse = (res: express.Response, statusCode: number, data: any) => {
    if (data) {
        return res.status(statusCode).send(data);
    }
    return res.status(404).send("Não encontrado");
};

//Pedido
///2ªFase - Entregáveis 1 - Gravar pedido
router.post("/pedido", async (req, res) => {
    try {
       const validaClienteController = new ValidarClienteController(new ValidarClienteGateway());
       const clienteAchado = await validaClienteController.validar(req);
       console.log(clienteAchado);
       if (clienteAchado.id == 0) {
        return res.status(500).json({erro: 'Cliente inválido'});
       }

       console.log("body", req.body);
       req.body.cliente = clienteAchado;
       console.log("body", req.body);

        const controller = new PedidoController(new PedidoGateway(), new FilaSQS());
        const item = await controller.cadastrarPedido(req.body);

        return res.status(201).send(item);
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ erro: error.message });
        }
    }
});
///1ªFase - Entregáveis 2 - vi. Listar pedidos
router.get("/pedido/listagem/:status", async (req, res) => {
    try {
        const controller = new PedidoController(new PedidoGateway(), new FilaSQS());
        console.log("status",req.params.status);
        const resposta = await controller.buscaPorStatus(req.params.status);

        sendResponse(res,201,resposta);
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
        const controller = new PedidoController(new PedidoGateway(), new FilaSQS());
        const resposta = await controller.buscaPorStatusModulo2();

        sendResponse(res,201,resposta);
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
        const controller = new PedidoController(new PedidoGateway(), new FilaSQS());
        const resposta = await controller.buscaPorId(req.params.id);

        sendResponse(res,201,resposta);
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
        const controller = new PedidoController(new PedidoGateway(), new FilaSQS());
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