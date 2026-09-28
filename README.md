# Balle Shop

Pequeno e-commerce experimental criado para o vídeo da Rafaella Ballerini.

## O que já existe

- Landing page responsiva
- 3 produtos digitais fictícios
- Carrinho
- Quantidade de itens
- Cálculo de total
- Persistência do carrinho no navegador
- Backend Node + Express
- Endpoint `/api/create-checkout`
- Estrutura preparada para conectar o Checkout da InfinitePay

## Rodar localmente

Requisitos: Node.js instalado.

```bash
npm install
npm start
```

Abra:

http://localhost:3000

Durante o desenvolvimento:

```bash
npm run dev
```

## Próximo passo: InfinitePay

O briefing do vídeo informa o endpoint:

POST https://api.checkout.infinitepay.io/links

e um payload mínimo com:

- `handle`
- `items`
  - `quantity`
  - `price` em centavos
  - `description`

A integração real deve ser feita no backend, dentro de:

`POST /api/create-checkout`

Não coloque credenciais ou segredos no JavaScript do frontend.

## Roteiro do experimento

1. Criar/acessar conta InfinitePay
2. Definir a InfiniteTag/nome de usuário
3. Selecionar produtos no Balle Shop
4. Enviar o carrinho para `/api/create-checkout`
5. Montar a requisição real para a API do Checkout
6. Receber o link
7. Redirecionar o usuário para o pagamento
8. Fazer uma compra real de teste
9. Implementar/mostrar o webhook
10. Mostrar a confirmação e o saldo

O projeto está em modo demo até a etapa de integração real.
