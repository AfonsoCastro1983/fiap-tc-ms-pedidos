import { ICliente } from "./ICliente";

export interface IValidarClienteGateway {
    validarToken(token: string): Promise<ICliente>;
}