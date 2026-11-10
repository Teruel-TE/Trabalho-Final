document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dadosFormulario = {
        nome: document.getElementById('cadastro-nome').value,
        email: document.getElementById('cadastro-email').value,
        senha: document.getElementById('cadastro-password').value,
        
        // Dados da tabela cadastro
        cep: document.getElementById('cadastro-cep').value,
        logradouro: document.getElementById('cadastro-logradouro').value,
        numero: document.getElementById('cadastro-numero').value,
        bairro: document.getElementById('cadastro-bairro').value,
        cidade: document.getElementById('cadastro-cidade').value,
        estado: document.getElementById('cadastro-estado').value.toUpperCase()
    };

    try {
        const response = await fetch('/api/usuarios/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFormulario)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cadastro efetuado com sucesso!');
            window.location.href = 'login.html';
        } else {
            alert(data.error || 'Erro ao realizar cadastro.');
        }
    } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao conectar com o servidor.');
    }
});