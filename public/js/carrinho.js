document.addEventListener('DOMContentLoaded', async () => {
    const usuario = obterUsuarioLogado();
    const token = localStorage.getItem('tokenAcesso');
    if (!usuario || !token) {
        limparSessaoLocal();
        alert('É necessário efetuar login para acessar o carrinho.');
        redirecionarParaLogin();
        return;
    }

    try {
        const response = await fetch('/api/usuarios/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 401) {
            limparSessaoLocal();
            alert('Sua sessão expirou. Faça login novamente para continuar a compra.');
            redirecionarParaLogin();
            return;
        }
        if (!response.ok) {
            throw new Error('Não foi possível validar sua sessão.');
        }
    } catch (error) {
        console.error('Erro ao validar sessão:', error);
        alert('Não foi possível validar sua sessão. Tente novamente.');
        return;
    }

    carregarCarrinho(usuario.id_cliente);
    document.getElementById('btn-checkout').addEventListener('click', () => finalizarCompra(usuario.id_cliente));
});

function limparSessaoLocal() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('tokenAcesso');
}

function redirecionarParaLogin() {
    window.location.href = 'login.html?retorno=carrinho.html';
}

function obterUsuarioLogado() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        return Number.isSafeInteger(Number(usuario?.id_cliente)) && Number(usuario.id_cliente) > 0
            ? usuario
            : null;
    } catch (error) {
        console.error('Dados de login inválidos no navegador:', error);
        return null;
    }
}

async function carregarCarrinho(idCliente) {
    try {
        const response = await fetch(`/api/carrinho/${idCliente}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.erro || 'Não foi possível carregar o carrinho.');
        }
        renderizarCarrinho(idCliente, data.itens);
    } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
        alert(error.message || 'Erro ao conectar com o servidor.');
    }
}

function renderizarCarrinho(idCliente, itens) {
    const corpo = document.getElementById('cart-items');
    corpo.replaceChildren();

    if (!itens.length) {
        const linha = document.createElement('tr');
        const celula = document.createElement('td');
        celula.colSpan = 5;
        celula.className = 'empty-cart-msg';
        celula.textContent = 'O seu carrinho está vazio.';
        linha.append(celula);
        corpo.append(linha);
    } else {
        for (const item of itens) {
            corpo.append(criarLinhaItem(idCliente, item));
        }
    }

    const total = itens.reduce((soma, item) => soma + Number(item.subtotal), 0);
    const totalFormatado = total.toFixed(2).replace('.', ',');
    document.getElementById('cart-subtotal').textContent = totalFormatado;
    document.getElementById('cart-total').textContent = totalFormatado;
    document.getElementById('btn-checkout').disabled = itens.length === 0;
}

function criarLinhaItem(idCliente, item) {
    const linha = document.createElement('tr');
    const nome = document.createElement('td');
    const produto = document.createElement('div');
    produto.className = 'cart-product';
    const imagem = document.createElement('img');
    imagem.className = 'cart-product-image';
    imagem.src = obterImagemProduto(item.nome);
    imagem.alt = item.nome;
    imagem.loading = 'lazy';
    const nomeProduto = document.createElement('span');
    nomeProduto.textContent = item.nome;
    produto.append(imagem, nomeProduto);
    nome.append(produto);
    const preco = document.createElement('td');
    preco.textContent = formatarMoeda(item.preco_unitario);
    const quantidade = document.createElement('td');
    const controlesQuantidade = document.createElement('div');
    controlesQuantidade.className = 'cart-quantity-controls';

    const diminuir = document.createElement('button');
    diminuir.type = 'button';
    diminuir.className = 'cart-action-button';
    diminuir.textContent = '−';
    diminuir.setAttribute('aria-label', `Diminuir quantidade de ${item.nome}`);
    diminuir.addEventListener('click', () => {
        atualizarQuantidade(idCliente, item, Number(item.quantidade) - 1);
    });

    const campoQuantidade = document.createElement('input');
    campoQuantidade.type = 'number';
    campoQuantidade.className = 'cart-quantity-input';
    campoQuantidade.min = '1';
    campoQuantidade.max = String(Math.min(1000, Math.max(Number(item.estoque), Number(item.quantidade))));
    campoQuantidade.step = '1';
    campoQuantidade.value = item.quantidade;
    campoQuantidade.setAttribute('aria-label', `Quantidade de ${item.nome}`);
    campoQuantidade.addEventListener('change', () => {
        const novaQuantidade = Number(campoQuantidade.value);
        if (!Number.isInteger(novaQuantidade) || novaQuantidade < 1 || novaQuantidade > 1000) {
            alert('Informe uma quantidade entre 1 e 1000.');
            campoQuantidade.value = item.quantidade;
            return;
        }
        atualizarQuantidade(idCliente, item, novaQuantidade);
    });

    const aumentar = document.createElement('button');
    aumentar.type = 'button';
    aumentar.className = 'cart-action-button';
    aumentar.textContent = '+';
    aumentar.setAttribute('aria-label', `Aumentar quantidade de ${item.nome}`);
    aumentar.disabled = Number(item.quantidade) >= Math.min(1000, Number(item.estoque));
    aumentar.addEventListener('click', () => {
        atualizarQuantidade(idCliente, item, Number(item.quantidade) + 1);
    });

    controlesQuantidade.append(diminuir, campoQuantidade, aumentar);
    quantidade.append(controlesQuantidade);
    const subtotal = document.createElement('td');
    subtotal.textContent = formatarMoeda(item.subtotal);
    const acao = document.createElement('td');

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.className = 'cart-action-button cart-remove-button';
    remover.textContent = 'Remover';
    remover.setAttribute('aria-label', `Remover ${item.nome} do carrinho`);
    remover.addEventListener('click', async () => {
        await enviarRemocao(idCliente, item.id_produto);
    });

    acao.append(remover);
    linha.append(nome, preco, quantidade, subtotal, acao);
    return linha;
}

async function atualizarQuantidade(idCliente, item, novaQuantidade) {
    if (novaQuantidade < 1) {
        await enviarRemocao(idCliente, item.id_produto);
        return;
    }
    await enviarAlteracao(idCliente, item.id_produto, novaQuantidade);
}

function formatarMoeda(valor) {
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function obterImagemProduto(nome) {
    const nomeNormalizado = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (nomeNormalizado.includes('bequer')) return 'images/becker.webp';
    if (nomeNormalizado.includes('erlenmeyer') || nomeNormalizado.includes('frasco')) return 'images/frasco.jpg';
    if (nomeNormalizado.includes('tiras') || nomeNormalizado.includes('ph')) return 'images/Tiras_PH.jpg';
    return 'images/kit.jpg';
}

async function enviarAlteracao(idCliente, idProduto, quantidade) {
    await enviarRequisicao(`/api/carrinho/${idCliente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_produto: idProduto, quantidade })
    }, idCliente);
}

async function enviarRemocao(idCliente, idProduto) {
    await enviarRequisicao(`/api/carrinho/${idCliente}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_produto: idProduto })
    }, idCliente);
}

async function enviarRequisicao(url, options, idCliente) {
    try {
        const response = await fetch(url, options);
        const data = response.status === 204 ? {} : await response.json();
        if (!response.ok) {
            throw new Error(data.erro || 'Não foi possível atualizar o carrinho.');
        }
        await carregarCarrinho(idCliente);
    } catch (error) {
        console.error('Erro ao atualizar o carrinho:', error);
        alert(error.message || 'Erro ao conectar com o servidor.');
    }
}

async function finalizarCompra(idCliente) {
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const botao = document.getElementById('btn-checkout');
    botao.disabled = true;

    try {
        const response = await fetch('/api/vendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('tokenAcesso') || ''}`
            },
            body: JSON.stringify({
                forma_pagamento: formaPagamento.trim()
            })
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                limparSessaoLocal();
                alert('Sua sessão expirou. Faça login novamente para finalizar a compra.');
                redirecionarParaLogin();
                return;
            }
            alert(data.erro || 'Não foi possível finalizar a compra.');
            return;
        }

        alert(`${data.mensagem} Nota fiscal: ${data.numero_nota}. Total: ${formatarMoeda(data.valor_total)}.`);
        await carregarCarrinho(idCliente);
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        alert('Erro ao conectar com o servidor.');
    } finally {
        botao.disabled = document.querySelector('#cart-items .empty-cart-msg') !== null;
    }
}
