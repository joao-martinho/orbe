document.addEventListener('DOMContentLoaded', async () => {
    
    const tipo = localStorage.getItem('tipo');
    if (!tipo) {
        alert('Você não tem permissão para acessar esta página :(');
        window.location.href = '../login.html';
        return;
    }

    const btnVoltar = document.querySelector('#btnVoltarPainel');
    if (btnVoltar) {
        btnVoltar.href = tipo === 'professor' ? '/professor/painel.html' : '/aluno/painel.html';
    }

    const btnSair = document.getElementById('btnSair');
    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });

    const btnMarcarTodas = document.getElementById('btnMarcarTodas');
    const container = document.querySelector('.row.row-cols-1');
    const email = localStorage.getItem('email');

    if (!container) {
        console.error('Container de notificações não encontrado.');
        return;
    }

    if (!email) {
        console.error('Email do usuário não encontrado no localStorage!');
        container.innerHTML = `<div class="col"><div class="alert alert-danger">Erro ao carregar notificações.</div></div>`;
        return;
    }

    if (btnMarcarTodas) {
        btnMarcarTodas.style.display = 'none';
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex justify-content-end mb-3';
        container.parentNode.insertBefore(wrapper, container);
        wrapper.appendChild(btnMarcarTodas);
    }

    function mostrarAlerta(mensagem, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alert alert-${tipo} col`;
        alerta.textContent = mensagem;
        container.prepend(alerta);
        setTimeout(() => alerta.remove(), 5000);
    }

    async function buscarNotificacoes() {
        try {
            const res = await fetch(`/notificacoes/${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error(`Falha ao carregar notificações. Status: ${res.status}`);
            const dados = await res.json();
            const notificacoes = Array.isArray(dados) ? dados : [dados];
            renderizarNotificacoes(notificacoes);
        } catch (err) {
            console.error('Erro ao buscar notificações:', err);
            mostrarAlerta('Não foi possível carregar notificações.', 'danger');
        }
    }

    function renderizarNotificacoes(notificacoes) {
        container.innerHTML = '';

        if (!notificacoes || notificacoes.length === 0) {
            const col = document.createElement('div');
            col.className = 'col';
            const card = document.createElement('div');
            card.className = 'card shadow-sm border-secondary';
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body text-center';
            const mensagem = document.createElement('p');
            mensagem.className = 'mb-0 text-muted';
            mensagem.textContent = 'Nenhuma notificação encontrada.';
            cardBody.appendChild(mensagem);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
            btnMarcarTodas.style.display = 'none';
            return;
        }

        let temNaoLida = false;

        notificacoes.forEach(not => {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = `card shadow-sm ${not.lida ? 'border-secondary' : 'border-warning'}`;
            card.dataset.lida = not.lida;
            card.dataset.id = not.id;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const header = document.createElement('div');
            header.className = 'd-flex justify-content-between align-items-start mb-2';

            const titulo = document.createElement('h5');
            titulo.className = 'card-title mb-0';
            titulo.textContent = not.titulo;

            const badge = document.createElement('span');
            if (!not.lida) {
                badge.className = 'badge bg-warning text-dark';
                badge.textContent = 'Não lida';
                temNaoLida = true;
            }

            header.appendChild(titulo);
            if (badge.textContent) header.appendChild(badge);

            const conteudo = document.createElement('p');
            conteudo.className = 'card-text mt-2 flex-grow-1';
            conteudo.textContent = not.conteudo;

            let footer;
            if (!not.lida) {
                footer = document.createElement('div');
                footer.className = 'mt-auto d-flex justify-content-end gap-2';
                const btnLida = document.createElement('button');
                btnLida.className = 'btn btn-sm btn-success marcar-lida';
                btnLida.textContent = 'Marcar como lida';
                btnLida.dataset.id = not.id;
                btnLida.addEventListener('click', () => marcarComoLida(not.id, card));
                footer.appendChild(btnLida);
            }

            cardBody.appendChild(header);
            cardBody.appendChild(conteudo);
            if (footer) cardBody.appendChild(footer);

            card.appendChild(cardBody);
            col.appendChild(card);
            container.prepend(col);
        });

        btnMarcarTodas.style.display = temNaoLida ? 'inline-block' : 'none';
    }

    async function marcarComoLida(id, card) {
        try {
            const res = await fetch(`/notificacoes/${encodeURIComponent(id)}/marcar-lida`, { method: 'PATCH' });
            if (!res.ok) throw new Error(`Falha ao marcar notificação como lida. Status: ${res.status}`);
            card.classList.remove('border-warning');
            card.classList.add('border-secondary');
            card.dataset.lida = 'true';
            const badge = card.querySelector('.badge');
            if (badge) badge.remove();
            const btn = card.querySelector('.marcar-lida');
            if (btn) btn.remove();
            const aindaNaoLidas = container.querySelectorAll('.card[data-lida="false"]');
            if (aindaNaoLidas.length === 0) btnMarcarTodas.style.display = 'none';
        } catch (err) {
            console.error(err);
        }
    }

    async function marcarTodasComoLidas() {
        const cards = container.querySelectorAll('.card[data-lida="false"]');
        for (const card of cards) {
            const id = card.dataset.id;
            if (!id) continue;
            await marcarComoLida(id, card);
        }
        btnMarcarTodas.style.display = 'none';
    }

    btnMarcarTodas?.addEventListener('click', marcarTodasComoLidas);

    await buscarNotificacoes();
});
