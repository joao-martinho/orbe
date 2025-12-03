document.addEventListener('DOMContentLoaded', async () => {
    const tipo = localStorage.getItem('tipo')
	if (tipo !== 'admin') {
		alert('Você não tem permissão para acessar esta página :(')
		window.location.href = '../login.html'
	}

    document.getElementById('btnSair').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });

    const badgeMensagens = document.getElementById('badge-mensagens');
    const email = localStorage.getItem('email');

    if (!email) {
        console.error('Email do usuário não encontrado no localStorage!');
        badgeMensagens.textContent = '0';
        return;
    }

    async function atualizarBadgeMensagens() {
        try {
            const res = await fetch(`/mensagens/${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(`Falha ao carregar mensagens. Status: ${res.status}`);

            const dados = await res.json();
            const mensagens = Array.isArray(dados) ? dados : [dados];
            const naoLidas = mensagens.filter(msg => !msg.lida).length;

            if (naoLidas > 0) {
                badgeMensagens.textContent = naoLidas;
                badgeMensagens.style.display = 'inline-block';
            } else {
                badgeMensagens.style.display = 'none';
            }
            
        } catch (err) {
            console.error('Erro ao buscar mensagens:', err);
            badgeMensagens.textContent = '0';
        }
    }

    await atualizarBadgeMensagens();
});
