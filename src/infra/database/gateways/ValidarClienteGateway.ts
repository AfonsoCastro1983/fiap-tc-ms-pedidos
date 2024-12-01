import axios from 'axios';
import { IValidarClienteGateway } from '../../../application/interfaces/IValidarClienteGateway'
import { ICliente } from '../../../application/interfaces/ICliente';

export class ValidarClienteGateway implements IValidarClienteGateway {
  private readonly baseUrl = 'https://6c88dkaufi.execute-api.us-east-2.amazonaws.com/lanchonete';

  async validarToken(token: string): Promise<ICliente> {
    const headers = { 'Content-type': 'application/json', 'Authorization': token };
    console.log('Gateway-validarToken', headers);
    try {
      const response = await axios.get(`${this.baseUrl}/cliente/token/`, { headers });
      console.log('Gateway-validarToken-response', response.data);

      if (response.data.cliente) {
        return {
          id: response.data.cliente.id,
          nome: response.data.cliente.nome,
          email: response.data.cliente.email,
          cpf: response.data.cliente.cpf
        }
      }
      else {
        return {
          id: 0,
          nome: '',
          email: '',
          cpf: ''
        }
      }

    } catch (error) {
      console.error('Error validating token:', error);
      return {
        id: 0,
        nome: '',
        email: '',
        cpf: ''
      }
    }
  }
}