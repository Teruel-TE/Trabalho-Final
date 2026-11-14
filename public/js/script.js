document.addEventListener('DOMContentLoaded', () => {
    const usuario = obterUsuarioLogado();
    document.querySelectorAll('.auth-buttons').forEach(buttons => {
        buttons.hidden = Boolean(usuario);
    });
    document.querySelectorAll('.private-link').forEach(link => {
        link.hidden = !usuario;
    });
    document.querySelectorAll('.logout-button').forEach(button => {
        button.hidden = !usuario;
        button.addEventListener('click', async () => {
            const token = localStorage.getItem('tokenAcesso');
            if (token) {
                try {
                    const response = await fetch('/api/logout', {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!response.ok) {
                        console.error('Não foi possível encerrar a sessão no servidor.');
                    }
                } catch (error) {
                    console.error('Erro ao encerrar a sessão:', error);
                }
            }
            localStorage.removeItem('usuarioLogado');
            localStorage.removeItem('tokenAcesso');
            window.location.href = 'index.html';
        });
    });

    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000); // Muda de imagem a cada 4 segundos
    }

    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            const usuario = obterUsuarioLogado();
            if (!usuario) {
                alert('É necessário efetuar login para acessar o carrinho.');
                window.location.href = 'login.html';
            } else {
                window.location.href = 'carrinho.html';
            }
        });
    }

    if (document.getElementById('cart-count')) {
        atualizarContadorCarrinho();
    }

    carregarCatalogo();
});

async function carregarCatalogo() {
    const grid = document.getElementById('productGrid');
    const status = document.getElementById('catalog-status');
    if (!grid) return;

    try {
        const response = await fetch('/api/produtos');
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.erro || 'Não foi possível carregar os produtos.');
        }
        if (!Array.isArray(data)) {
            throw new Error('A resposta do catálogo está em um formato inválido.');
        }

        grid.replaceChildren();
        status.textContent = '';
        if (data.length === 0) {
            status.textContent = 'Nenhum produto cadastrado. Execute o arquivo db/seed-produtos.sql para cadastrar os produtos iniciais.';
            return;
        }

        for (const product of data) grid.append(criarCartaoProduto(product));
    } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        grid.replaceChildren();
        status.textContent = 'Não foi possível carregar os produtos do servidor. Tente novamente mais tarde.';
    }
}

function criarCartaoProduto(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.src = obterImagemProduto(product.nome);
    image.alt = product.nome;
    image.loading = 'lazy';

    const category = document.createElement('p');
    category.className = 'product-category';
    category.textContent = product.categoria;

    const name = document.createElement('h3');
    name.textContent = product.nome;

    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = product.descricao || 'Produto para laboratório.';

    const stock = document.createElement('p');
    stock.className = 'product-stock';
    stock.textContent = Number(product.estoque) > 0
        ? `Em estoque: ${product.estoque}`
        : 'Indisponível no momento';

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const price = document.createElement('span');
    price.className = 'price';
    price.textContent = formatarMoeda(product.preco);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-primary btn-add-cart';
    button.textContent = Number(product.estoque) > 0 ? 'Adicionar' : 'Sem estoque';
    button.disabled = Number(product.estoque) <= 0;
    button.addEventListener('click', () => adicionarAoCarrinho(product, button));

    footer.append(price, button);
    card.append(image, category, name, description, stock, footer);
    return card;
}

async function adicionarAoCarrinho(product, button) {
    const usuario = obterUsuarioLogado();
    if (!usuario) {
        alert('Por favor, faça login para adicionar produtos ao carrinho.');
        window.location.href = 'login.html';
        return;
    }

    button.disabled = true;
    try {
        const response = await fetch(`/api/carrinho/${usuario.id_cliente}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_produto: product.id_produto,
                quantidade: 1
            })
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.erro || 'Não foi possível adicionar o produto ao carrinho.');
            return;
        }

        await atualizarContadorCarrinho();
        alert('Produto adicionado ao carrinho!');
    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        alert('Erro ao conectar com o servidor.');
    } finally {
        button.disabled = false;
    }
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

async function atualizarContadorCarrinho() {
    const contadorEl = document.getElementById('cart-count');
    const usuario = obterUsuarioLogado();
    if (!contadorEl || !usuario) {
        if (contadorEl) contadorEl.textContent = '0';
        return;
    }

    try {
        const response = await fetch(`/api/carrinho/${usuario.id_cliente}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.erro || 'Não foi possível consultar o carrinho.');
        }
        contadorEl.textContent = data.itens.reduce(
            (total, item) => total + Number(item.quantidade),
            0
        );
    } catch (error) {
        console.error('Erro ao consultar o carrinho:', error);
    }
}