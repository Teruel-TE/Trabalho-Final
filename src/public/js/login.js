document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            // Guarda os dados do utilizador logado no localStorage para validação do carrinho
            localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario || { email }));
            
            alert('Login efetuado com sucesso!');
            window.location.href = 'index.html';
        } else {
            alert(data.error || 'Erro ao realizar login. Verifique o seu e-mail e senha.');
        }
    } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao conectar com o servidor.');
    }
});

