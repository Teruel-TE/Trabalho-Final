const campoDocumento = document.getElementById('cadastro-cnpj-cpf');
const cadastroForm = document.getElementById('cadastro-form');

if (campoDocumento && cadastroForm) {
    campoDocumento.addEventListener('input', () => {
        const numeros = campoDocumento.value.replace(/\D/g, '').slice(0, 14);
        if (numeros.length <= 11) {
            campoDocumento.value = numeros
                .replace(/^(\d{3})(\d)/, '$1.$2')
                .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
            return;
        }

        campoDocumento.value = numeros
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
            .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');
    });

    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dadosFormulario = {
            nome: document.getElementById('cadastro-nome').value,
            cnpj_cpf: campoDocumento.value.replace(/\D/g, ''),
            email: document.getElementById('cadastro-email').value,
            senha: document.getElementById('cadastro-password').value,
            instituicao_laboratorio: document.getElementById('cadastro-instituicao').value,
            telefone: document.getElementById('cadastro-telefone').value,
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
                alert(data.erro || 'Erro ao realizar cadastro.');
            }
        } catch (err) {
            console.error('Erro:', err);
            alert('Erro ao conectar com o servidor.');
        }
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
                localStorage.setItem('tokenAcesso', data.token);
                alert('Login efetuado com sucesso!');
                const retorno = new URLSearchParams(window.location.search).get('retorno');
                window.location.href = ['carrinho.html', 'notas-fiscais.html'].includes(retorno)
                    ? retorno
                    : 'index.html';
            } else {
                alert(data.erro || 'Erro ao realizar login. Verifique o seu e-mail e senha.');
            }
        } catch (err) {
            console.error('Erro:', err);
            alert('Erro ao conectar com o servidor.');
        }
    });
}
