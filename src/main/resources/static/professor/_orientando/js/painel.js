document.addEventListener('DOMContentLoaded', async () => {
    const btnSair = document.getElementById('btnSair');
    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../../login.html';
    });

    await verificarAcesso();

    async function verificarAcesso() {
        const tipo = localStorage.getItem('tipo');
        const emailProfessor = localStorage.getItem('email');
        const emailAluno = localStorage.getItem('orientando');

        if (tipo !== 'professor' || !emailProfessor || !emailAluno) {
            alert('Você não tem permissão para acessar esta página.');
            window.location.href = '../../login.html';
            return;
        }

        try {
            const resAluno = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
            if (!resAluno.ok) {
                alert('Erro ao carregar dados do orientando.');
                window.location.href = '../../login.html';
                return;
            }

            const aluno = await resAluno.json();
            atualizarInterface(aluno);

        } catch (erro) {
            console.error('Erro ao buscar dados do aluno:', erro);
            alert('Erro de conexão ao carregar dados do aluno.');
            window.location.href = '../../login.html';
        }
    }

    function atualizarInterface(aluno) {
        const h1 = document.getElementById('titulo-aluno');
        if (h1) {
            h1.textContent = `Orientando: ${aluno.nome || '(não identificado)'}`;
            h1.style.display = 'block';
        }

        // Seleciona todos os cards exceto o “Termo de compromisso”
        const cards = Array.from(document.querySelectorAll('.col'))
            .filter(card => card.querySelector('.card-title').textContent !== 'Termo de compromisso');

        if (!aluno.orientador && !aluno.orientadorProvisorio) {
            cards.forEach(card => card.classList.add('grayed-out'));
        } else if (!aluno.orientador && aluno.orientadorProvisorio) {
            // Apenas Termo ativo, o resto bloqueado
            cards.forEach(card => card.classList.add('grayed-out'));
        } else if (aluno.orientador) {
            cards.forEach(card => card.classList.remove('grayed-out'));
        }

        // Controle de coorientando
        const isCoorientando = localStorage.getItem('isCoorientando') === 'true';
        if (isCoorientando) {
            const cardEnvio = document.querySelector('[data-role="envio-documentos"]');
            const cardRecebimento = document.querySelector('[data-role="recebimento-documentos"]');
            if (cardEnvio) cardEnvio.style.display = 'none';
            if (cardRecebimento) cardRecebimento.style.display = 'none';
        }

        // Controle por papéis ativos
        const papeisAtivos = [];
        ['coordTcc1', 'coordBcc', 'coordSis'].forEach(papel => {
            if (localStorage.getItem(papel) === 'true') {
                papeisAtivos.push(papel);
            }
        });

        document.querySelectorAll('.col').forEach(card => {
            const roles = card.getAttribute('data-role');
            if (!roles) return;
            const lista = roles.split(',').map(r => r.trim());
            const autorizado = lista.some(r => papeisAtivos.includes(r));
            if (autorizado) {
                card.style.display = 'block';
            }
        });
    }
});
