document.addEventListener('DOMContentLoaded', async () => {
    const btnSair = document.getElementById('btnSair');
    btnSair?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });
	
    verificarAcesso();

    async function verificarAcesso() {
        const tipo = localStorage.getItem('tipo');
        const emailAluno = localStorage.getItem('email');

        if (tipo !== 'aluno' || !emailAluno) {
            alert('Você não tem permissão para acessar esta página.');
            window.location.href = '../login.html';
            return;
        }

        const res = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
        if (!res.ok) {
            alert('Erro ao carregar dados do aluno.');
            window.location.href = '../login.html';
            return;
        }
    }

    const email = localStorage.getItem('email');
    if (!email) {
        console.error('Email do usuário não encontrado no localStorage!');
        return;
    }

    try {
        const resAluno = await fetch(`/alunos/${encodeURIComponent(email)}`);
        if (!resAluno.ok) throw new Error('Falha ao carregar dados do aluno.');

        const aluno = await resAluno.json();

        const cardTermo = document.getElementById('card-termo');
        const cardEntregas = document.getElementById('card-entregas');
        const cardRevisao = document.getElementById('card-revisao');
        const cardAvaliacao = document.getElementById('card-avaliacao');

        if (!aluno.orientador && !aluno.orientadorProvisorio) {
            cardTermo.classList.add('grayed-out');
            cardEntregas.classList.add('grayed-out');
            cardRevisao.classList.add('grayed-out');
            cardAvaliacao.classList.add('grayed-out');
        } else if (!aluno.orientador && aluno.orientadorProvisorio) {
            cardTermo.classList.remove('grayed-out');
            cardEntregas.classList.add('grayed-out');
            cardRevisao.classList.add('grayed-out');
            cardAvaliacao.classList.add('grayed-out');
        } else if (aluno.orientador) {
            cardTermo.classList.remove('grayed-out');
            cardEntregas.classList.remove('grayed-out');
            cardRevisao.classList.remove('grayed-out');
            cardAvaliacao.classList.remove('grayed-out');
        }

        cardAvaliacao.addEventListener('click', () => {
            if (cardAvaliacao.classList.contains('grayed-out')) return;

            if (aluno.curso === 'BCC') {
                window.location.href = './avaliacao-bcc.html';
            } else if (aluno.curso === 'SIS') {
                window.location.href = './avaliacao-sis.html';
            } else {
                alert('Curso não reconhecido para redirecionamento.');
            }
        });

    } catch (error) {
        console.error('Erro ao verificar orientador:', error);
    }
});
