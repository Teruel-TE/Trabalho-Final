document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LÓGICA DO CARROSSEL DE FUNDO ---
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000); // Muda de imagem a cada 4 segundos
    }

    // --- 2. PROTEÇÃO DE ACESSO AO CARRINHO ---
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            const usuarioLogado = localStorage.getItem('usuarioLogado');

            if (!usuarioLogado) {
                alert('É necessário efetuar login para acessar o carrinho.');
                window.location.href = 'login.html';
            } else {
                window.location.href = 'carrinho.html';
            }
        });
    }

    // --- 3. ATUALIZAR CONTADOR DO CARRINHO ---
    atualizarContadorCarrinho();

    // --- 4. ADICIONAR PRODUTO AO CARRINHO (Com verificação de login) ---
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const usuarioLogado = localStorage.getItem('usuarioLogado');

            if (!usuarioLogado) {
                alert('Por favor, faça login para adicionar produtos ao carrinho.');
                window.location.href = 'login.html';
                return;
            }

            const produto = {
                id: e.target.getAttribute('data-id'),
                name: e.target.getAttribute('data-name'),
                price: parseFloat(e.target.getAttribute('data-price')),
                quantity: 1
            };

            adicionarProdutoAoCarrinhoStorage(produto);
            alert(`${produto.name} foi adicionado ao carrinho!`);
        });
    });
});

// --- FUNÇÕES AUXILIARES ---

function adicionarProdutoAoCarrinhoStorage(produto) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const index = carrinho.findIndex(item => item.id === produto.id);
    
    if (index > -1) {
        carrinho[index].quantity += 1;
    } else {
        carrinho.push(produto);
    }
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantity, 0);
    const contadorEl = document.getElementById('cart-count');
    
    if (contadorEl) {
        contadorEl.textContent = totalItens;
    }
}