document.addEventListener('DOMContentLoaded', carregarNotasFiscais);

async function carregarNotasFiscais() {
    const status = document.getElementById('invoice-status');
    const lista = document.getElementById('invoice-list');
    const token = localStorage.getItem('tokenAcesso');
    if (!token || !localStorage.getItem('usuarioLogado')) {
        solicitarLogin();
        return;
    }

    try {
        const response = await fetch('/api/notas-fiscais', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.status === 401) {
            solicitarLogin();
            return;
        }
        if (!response.ok) {
            throw new Error(data.erro || 'Não foi possível carregar as notas fiscais.');
        }
        if (!Array.isArray(data)) {
            throw new Error('A resposta das notas fiscais está em um formato inválido.');
        }

        const notas = data.filter(compra => compra.id_nota_fiscal && compra.numero_nota);
        lista.replaceChildren();
        if (notas.length === 0) {
            status.textContent = 'Você ainda não possui notas fiscais disponíveis.';
            return;
        }

        status.textContent = '';
        for (const nota of notas) lista.append(criarCartaoNota(nota, token, status));
    } catch (error) {
        console.error('Erro ao carregar notas fiscais:', error);
        status.textContent = error.message || 'Não foi possível carregar suas notas fiscais.';
    }
}

function solicitarLogin() {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('tokenAcesso');
    alert('Faça login para consultar suas notas fiscais.');
    window.location.href = 'login.html?retorno=notas-fiscais.html';
}

function criarCartaoNota(nota, token, status) {
    const cartao = document.createElement('article');
    cartao.className = 'invoice-card';

    const cabecalho = document.createElement('div');
    cabecalho.className = 'invoice-card-header';

    const titulo = document.createElement('div');
    const numero = document.createElement('h3');
    numero.textContent = `Nota fiscal ${nota.numero_nota}`;
    const emissao = document.createElement('p');
    emissao.textContent = `Emitida em ${formatarData(nota.data_emissao)}`;
    titulo.append(numero, emissao);

    const total = document.createElement('strong');
    total.className = 'invoice-total';
    total.textContent = formatarMoeda(nota.valor_nota ?? nota.valor_total);
    cabecalho.append(titulo, total);

    const resumo = document.createElement('dl');
    resumo.className = 'invoice-summary';
    adicionarCampoResumo(resumo, 'Compra', `#${nota.id_compra}`);
    adicionarCampoResumo(resumo, 'Pagamento', nota.forma_pagamento);
    adicionarCampoResumo(resumo, 'Status', nota.status);

    const detalhe = document.createElement('div');
    detalhe.className = 'invoice-detail';
    detalhe.hidden = true;

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn-primary invoice-toggle';
    botao.textContent = 'Visualizar nota';
    botao.addEventListener('click', () => alternarDetalhes(nota, token, detalhe, botao, status));

    cartao.append(cabecalho, resumo, botao, detalhe);
    return cartao;
}

function adicionarCampoResumo(lista, rotulo, valor) {
    const termo = document.createElement('dt');
    termo.textContent = rotulo;
    const descricao = document.createElement('dd');
    descricao.textContent = valor || '—';
    lista.append(termo, descricao);
}

async function alternarDetalhes(nota, token, detalhe, botao, status) {
    if (!detalhe.hidden) {
        detalhe.hidden = true;
        botao.textContent = 'Visualizar nota';
        return;
    }
    if (detalhe.dataset.carregado === 'true') {
        detalhe.hidden = false;
        botao.textContent = 'Ocultar nota';
        return;
    }

    botao.disabled = true;
    botao.textContent = 'Carregando...';
    try {
        const response = await fetch(`/api/notas-fiscais/${encodeURIComponent(nota.id_nota_fiscal)}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.status === 401) {
            solicitarLogin();
            return;
        }
        if (!response.ok) {
            throw new Error(data.erro || 'Não foi possível abrir esta nota fiscal.');
        }

        renderizarDetalhes(detalhe, data);
        detalhe.dataset.carregado = 'true';
        detalhe.hidden = false;
        botao.textContent = 'Ocultar nota';
        status.textContent = '';
    } catch (error) {
        console.error('Erro ao consultar nota fiscal:', error);
        status.textContent = error.message || 'Não foi possível abrir esta nota fiscal.';
        botao.textContent = 'Tentar novamente';
    } finally {
        botao.disabled = false;
    }
}

function renderizarDetalhes(container, nota) {
    const chaveTitulo = document.createElement('h4');
    chaveTitulo.textContent = 'Chave de acesso';
    const chave = document.createElement('p');
    chave.className = 'invoice-access-key';
    chave.textContent = nota.chave_acesso || 'Chave não disponível.';

    const itensTitulo = document.createElement('h4');
    itensTitulo.textContent = 'Itens da compra';
    const itens = document.createElement('ul');
    itens.className = 'invoice-items';
    for (const item of nota.itens || []) {
        const linha = document.createElement('li');
        linha.textContent = `${item.nome} — ${item.quantidade} × ${formatarMoeda(item.preco_unitario)} = ${formatarMoeda(item.subtotal)}`;
        itens.append(linha);
    }

    container.replaceChildren(chaveTitulo, chave, itensTitulo, itens);
}

function formatarData(valor) {
    if (!valor) return 'Data não disponível';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return 'Data não disponível';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(data);
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}
