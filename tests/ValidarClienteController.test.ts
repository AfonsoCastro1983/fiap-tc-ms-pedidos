import { ValidarClienteController } from '../src/infra/http/controllers/ValidaClienteController';
import { IValidarClienteGateway } from '../src/application/interfaces/IValidarClienteGateway';
import axios from 'axios';
import { Request } from 'express';
import { ValidarClienteGateway } from '../src/infra/database/gateways/ValidarClienteGateway';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ValidarClienteController', () => {
  let validarClienteController: ValidarClienteController;

  beforeEach(() => {

    validarClienteController = new ValidarClienteController(new ValidarClienteGateway());
  });

  describe('Cenário: Validar um token com sucesso', () => {
    it('DADO um token válido, QUANDO eu chamar o método validar, ENTÃO ele deve retornar o cliente', async () => {
      const mockRequest = {
        headers: {
          authorization: 'eyJraWQiOiJqUlpDSFNBcEtRc0dYMVI5OCtVWXNqcFczQm9iUjlcL252d29ta0xGU1hLYz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI4MWViYzVjMC0xMGUxLTcwZTEtZGViNy1lNzQ3MTUwNWZlM2UiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0yX1V2azEyQWhwZSIsImNvZ25pdG86dXNlcm5hbWUiOiJhbm9uaW1vQGFub25pbW8uY29tLmJyIiwib3JpZ2luX2p0aSI6ImI2YjI3NDI1LWJjMGMtNGM1ZC1iMjdiLWJmNTk3OWY1ZjM0NyIsImF1ZCI6IjFvMHZmcTB1ZG43NWs5MnBzcGxya283b2ppIiwiZXZlbnRfaWQiOiI3ZDBiNWQwYS05OWZiLTQ3MTItYjAzZi02NTc4MGI2OGMxZjkiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTczMzAwMjg1OCwibmFtZSI6ImFuw7RuaW1vIiwiZXhwIjoxNzMzMDA2NDU4LCJpYXQiOjE3MzMwMDI4NTgsImp0aSI6IjIxYzAzNjJmLWFlNjItNDRkZS04ODNjLWM2M2ZlMjI1MGIwMiIsImVtYWlsIjoiYW5vbmltb0Bhbm9uaW1vLmNvbS5iciJ9.IJzKivwmem7RcZ9RLyBtEFapXZ8lCObDMx5DLN0zH_jEJrRWgNXloHyFu-tdh38w6lTHgpK8fsacQaSTXbhWVEMY1kYDs_OE_dHdt23m784xulLcjUv6iFAqbgFVY592fIuOdO48NQLvQ-lmYGA1zPKBtqAcmlveqBSGaK50kVKHcHO1wPdi5sD3N-isokI9_dKXeRw34qgn2Uq2zdopr4ENZBZcBC5OnnHReSAOQd2Jmi5FzZLDTjRyAeU1ZUgZ_SqaqXwlcQmS1gAUnZNCTCXTlozvY712iLq4J3zGG8gnONBAfuHj-xJl9CyIfGW5QTL3928oRvFxhRijOaEFog',
        },
      } as Request;

      mockedAxios.get.mockResolvedValue({
        data: { id: 1, nome: 'Teste', idcognito: '81ebc5c0-10e1-70e1-deb7-e7471505fe3e' },
      });

      const resultado = await validarClienteController.validar(mockRequest);

      expect(resultado.id).toBe(1);
    });
  });

  describe('Cenário: Retornar cliente zerado ao validar um token ausente', () => {
    it('DADO uma requisição sem cabeçalho Authorization, QUANDO eu chamar o método validar, ENTÃO ele deve retornar um cliente zerado', async () => {
      const mockRequest = {
        headers: {},
      } as Request;

      /*mockedAxios.get.mockResolvedValue({
        data: { id: 0, nome: ''},
      });*/

      await expect(validarClienteController.validar(mockRequest)).rejects.toThrow('Token inválido');
    });
  });

  describe('Cenário: Retornar cliente zerado ao validar um token inválido', () => {
    it('DADO um token inválido, QUANDO eu chamar o método validar, ENTÃO ele deve retornar um cliente zerado', async () => {
      const mockRequest = {
        headers: {
          authorization: 'invalid-token',
        },
      } as Request;

      mockedAxios.get.mockResolvedValue({
        data: { id: 0, nome: '', email: ''},
      });

      const resultado = await validarClienteController.validar(mockRequest);
      
      expect(resultado.id).toBe(0);
    });
  });
});
