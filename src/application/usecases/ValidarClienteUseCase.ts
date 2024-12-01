import { ICliente } from "../interfaces/ICliente";
import { IValidarClienteGateway } from "../interfaces/IValidarClienteGateway";

export class ValidarClienteUseCase {
    constructor(private readonly validarClienteGateway: IValidarClienteGateway) {}
  
    async execute(token: string): Promise<ICliente> {
      return await this.validarClienteGateway.validarToken(token);
    }
  }
  