import { ValidarClienteGateway } from "../../database/gateways/ValidarClienteGateway";
import { ValidarClienteUseCase } from "../../../application/usecases/ValidarClienteUseCase";
import { Request } from "express";
import { ICliente } from "../../../application/interfaces/ICliente";

export class ValidarClienteController {
    private readonly validarClienteUseCase: ValidarClienteUseCase;

    constructor(validarClienteGateway: ValidarClienteGateway) {
        this.validarClienteUseCase = new ValidarClienteUseCase(validarClienteGateway);
    }
  
    async validar(request: Request): Promise<ICliente> {
      const token = request.headers.authorization;
  
      if (!token) {
        throw new Error('Token inválido');
      }
  
      const retorno = await this.validarClienteUseCase.execute(token);
  
      return retorno;
    }
  }
  