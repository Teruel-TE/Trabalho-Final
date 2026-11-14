# Trabalho-Final

## Usuários

O servidor é iniciado pela raiz do projeto com `npm start` (ou `npm run dev`).
As operações da API de usuários são:

| Método | Rota | Ação |
| --- | --- | --- |
| `POST` | `/api/usuarios/cadastrar` | Cadastrar conta |
| `POST` | `/api/login` | Entrar e receber um token |
| `GET` | `/api/usuarios/me` | Consultar a própria conta |
| `PUT` | `/api/usuarios/me` | Atualizar a própria conta |
| `DELETE` | `/api/usuarios/me` | Excluir a própria conta |
| `POST` | `/api/logout` | Encerrar a sessão |

As rotas `/api/usuarios/me` e `/api/logout` exigem
`Authorization: Bearer <token>`. O `PUT` recebe os campos do cadastro;
`senha` é opcional e, quando enviada, atualiza a senha. As sessões expiram
após oito horas e ficam em memória, então reiniciar o servidor encerra as
sessões ativas.

## Vendas

As operações de venda também exigem `Authorization: Bearer <token>` e só
permitem acessar as vendas do usuário autenticado:

| Método | Rota | Ação |
| --- | --- | --- |
| `POST` | `/api/vendas` | Finalizar o carrinho e emitir a nota fiscal |
| `GET` | `/api/vendas` | Listar o histórico de vendas |
| `GET` | `/api/vendas/:id_compra` | Consultar uma compra e seus itens |

A criação recebe `forma_pagamento` (`Pix`, `Cartão de crédito`,
`Cartão de débito` ou `Dinheiro`). Vendas finalizadas não podem ser alteradas
ou excluídas por essas rotas. A estrutura do banco deve estar atualizada com
as tabelas de `db/db.sql`.

Clientes autenticados podem consultar suas notas fiscais em
`public/notas-fiscais.html`. A página consulta a tabela `nota_fiscal` pelo
cliente autenticado, lista suas notas e permite visualizar a chave de acesso
e os itens de cada compra. A API autenticada oferece `GET /api/notas-fiscais`
e `GET /api/notas-fiscais/:id_nota_fiscal`.