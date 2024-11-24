import dynamoose from "dynamoose";
import { StatusPedido } from "../../../shared/enums/StatusPedido";

const PedidoSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    data: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(StatusPedido),
      required: true,
    },
    cliente: {
      type: Object,
      schema: {
        id: {
          type: Number
        },
        nome: {
          type: String
        },
        email: {
          type: String
        },
        cpf: {
          type: String
        },
      },
      required: false,
    },
    valorTotal: {
      type: Number,
      required: true,
    },
    itens: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: {
            item: {
              type: Object,
              schema: {
                id: { type: Number, required: true },
                nome: { type: String, required: true },
                descricao: { type: String, required: true },
                categoria: { type: String, required: true },
                preco: {
                  type: Number,
                  required: true,
                },
              },
              required: true,
            },
            quantidade: {
              type: Number,
              required: true,
            },
            total: {
              type: Number,
              required: true,
            },
          },
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PedidoModel = dynamoose.model("mspedido", PedidoSchema);

export default PedidoModel;