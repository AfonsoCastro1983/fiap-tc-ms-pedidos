import { CadastrarPedidoDto, RepositoryPedidoDto } from '../src/domain/dtos/CadastrarPedidoDto';
import { StatusPedido } from '../src/shared/enums/StatusPedido';
import { ICliente } from '../src/application/interfaces/ICliente';

describe('CadastrarPedidoDto', () => {
    it('deve criar uma instância com valores padrão', () => {
        const dto = new CadastrarPedidoDto();
        
        expect(dto.status).toBe(StatusPedido.NOVO);
        expect(dto.id).toBeUndefined();
        expect(dto.cliente).toBeUndefined();
        expect(dto.itens).toBeUndefined();
    });

    it('deve aceitar valores personalizados na criação', () => {
        const cliente: ICliente = {
            id: 1,
            nome: 'João',
            email: 'joao@email.com',
            cpf: ''
        };

        const itens = [
            {
                item: {
                    id: 1,
                    nome: 'X-Burger',
                    descricao: 'Hambúrguer com queijo',
                    preco: 15.90,
                    ingredientes: 'Pão, carne, queijo',
                    categoria: 'Lanches'
                },
                quantidade: 2
            }
        ];

        const dto = new CadastrarPedidoDto();
        dto.id = '123';
        dto.cliente = cliente;
        dto.itens = itens;

        expect(dto.id).toBe('123');
        expect(dto.cliente).toEqual(cliente);
        expect(dto.itens).toEqual(itens);
        expect(dto.status).toBe(StatusPedido.NOVO);
    });
});

describe('RepositoryPedidoDto', () => {
    let dto: RepositoryPedidoDto;

    beforeEach(() => {
        dto = new RepositoryPedidoDto();
    });

    it('deve criar uma instância com valores padrão', () => {
        expect(dto.id).toBe('');
        expect(dto.data).toBeInstanceOf(Date);
        expect(dto.valorTotal).toBe(0);
        expect(dto.status).toBe(StatusPedido.NOVO);
        expect(dto.cliente).toBeUndefined();
        expect(dto.itens).toBeUndefined();
    });

    it('deve aceitar valores personalizados na criação', () => {
        const now = new Date();
        const cliente: ICliente = {
            id: 1,
            nome: 'Maria',
            email: 'maria@email.com',
            cpf: ''
        };

        const itens = [
            {
                item: {
                    id: 1,
                    nome: 'X-Salada',
                    descricao: 'Hambúrguer com salada',
                    preco: 18.90,
                    ingredientes: 'Pão, carne, alface, tomate',
                    categoria: 'Lanches'
                },
                quantidade: 2,
                total: 37.80
            }
        ];

        dto.id = '456';
        dto.data = now;
        dto.cliente = cliente;
        dto.itens = itens;
        dto.valorTotal = 37.80;
        dto.status = StatusPedido.EM_PREPARACAO;

        expect(dto.id).toBe('456');
        expect(dto.data).toBe(now);
        expect(dto.cliente).toEqual(cliente);
        expect(dto.itens).toEqual(itens);
        expect(dto.valorTotal).toBe(37.80);
        expect(dto.status).toBe(StatusPedido.EM_PREPARACAO);
    });

    it('deve calcular corretamente o valor total dos itens', () => {
        const itens = [
            {
                item: {
                    id: 1,
                    nome: 'X-Bacon',
                    descricao: 'Hambúrguer com bacon',
                    preco: 20.90,
                    ingredientes: 'Pão, carne, bacon',
                    categoria: 'Lanches'
                },
                quantidade: 2,
                total: 41.80
            },
            {
                item: {
                    id: 2,
                    nome: 'Refrigerante',
                    descricao: 'Refrigerante 350ml',
                    preco: 5.00,
                    ingredientes: 'Refrigerante',
                    categoria: 'Bebidas'
                },
                quantidade: 1,
                total: 5.00
            }
        ];

        dto.itens = itens;
        dto.valorTotal = 46.80;

        expect(dto.itens.length).toBe(2);
        expect(dto.valorTotal).toBe(46.80);
        expect(dto.itens[0].total).toBe(41.80);
        expect(dto.itens[1].total).toBe(5.00);
    });

    it('deve validar a estrutura dos itens', () => {
        const item = {
            item: {
                id: 1,
                nome: 'X-Bacon',
                descricao: 'Hambúrguer com bacon',
                preco: 20.90,
                ingredientes: 'Pão, carne, bacon',
                categoria: 'Lanches'
            },
            quantidade: 2,
            total: 41.80
        };

        dto.itens = [item];

        expect(dto.itens[0]).toHaveProperty('item');
        expect(dto.itens[0].item).toHaveProperty('id');
        expect(dto.itens[0].item).toHaveProperty('nome');
        expect(dto.itens[0].item).toHaveProperty('descricao');
        expect(dto.itens[0].item).toHaveProperty('preco');
        expect(dto.itens[0].item).toHaveProperty('ingredientes');
        expect(dto.itens[0].item).toHaveProperty('categoria');
        expect(dto.itens[0]).toHaveProperty('quantidade');
        expect(dto.itens[0]).toHaveProperty('total');
    });

    it('deve validar a estrutura do cliente', () => {
        const cliente: ICliente = {
            id: 1,
            nome: 'José',
            email: 'jose@email.com',
            cpf: '',
        };

        dto.cliente = cliente;

        expect(dto.cliente).toHaveProperty('id');
        expect(typeof dto.cliente.id).toBe('number');
        expect(dto.cliente).toHaveProperty('nome');
        expect(dto.cliente).toHaveProperty('email');
    });
});