import axios from 'axios';
import { IValidarClienteGateway } from '../../../application/interfaces/IValidarClienteGateway'
import { ICliente } from '../../../application/interfaces/ICliente';

export class ValidarClienteGateway implements IValidarClienteGateway {
  private readonly baseUrl = 'https://6c88dkaufi.execute-api.us-east-2.amazonaws.com/lanchonete';

  async validarToken(token: string): Promise<ICliente> {
    const headers = { 'Content-type': 'application/json', 'Authorization': token };
    try {
      const response = await axios.get(`${this.baseUrl}/cliente/token`, { headers});
      
      return {
        id: response.data.id,
        nome: response.data.nome,
        email: response.data.email,
        cpf: response.data.cpf
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