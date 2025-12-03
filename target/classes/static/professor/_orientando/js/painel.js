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
        const emailAluno1 = localStorage.getItem('orientando');
        const emailAluno2 = localStorage.getItem('parceiro');

        if (tipo !== 'professor' || !emailProfessor || !emailAluno1) {
            alert('Você não tem permissão para acessar esta página :(');
            window.location.href = '../../login.html';
            return;
        }

        try {
            const res1 = await fetch(`/alunos/${encodeURIComponent(emailAluno1)}`);
            if (!res1.ok) throw new Error('Erro ao buscar dados do primeiro aluno.');
            const aluno1 = await res1.json();

            let aluno2 = null;
            if (emailAluno2) {
                try {
                    const res2 = await fetch(`/alunos/${encodeURIComponent(emailAluno2)}`);
                    if (res2.ok) aluno2 = await res2.json();
                } catch {
                    console.warn('Não foi possível carregar dados do segundo aluno.');
                }
            }

            atualizarInterface(aluno1, aluno2);

        } catch (erro) {
            console.error('Erro ao buscar dados do(s) aluno(s):', erro);
            window.location.href = '../../login.html';
        }
    }

    function atualizarInterface(aluno1, aluno2) {
        const h1 = document.getElementById('titulo-aluno');
        if (h1) {
            if (aluno2) {
                const nome1 = aluno1.nome || '(não identificado)';
                const nome2 = aluno2.nome || '(não identificado)';
                h1.textContent = `Orientandos: ${nome1} e ${nome2}`;
            } else {
                h1.textContent = `Orientando: ${aluno1.nome || '(não identificado)'}`;
            }
            h1.style.display = 'block';
        }

        const cards = Array.from(document.querySelectorAll('.col'))
            .filter(card => card.querySelector('.card-title').textContent !== 'Termo de compromisso');

        const alunoRef = aluno2 ? aluno1 : aluno1;

        if (!alunoRef.orientador && !alunoRef.orientadorProvisorio) {
            cards.forEach(card => card.classList.add('grayed-out'));
        } else if (!alunoRef.orientador && alunoRef.orientadorProvisorio) {
            cards.forEach(card => card.classList.add('grayed-out'));
        } else if (alunoRef.orientador) {
            cards.forEach(card => card.classList.remove('grayed-out'));
        }

        const isCoorientando = localStorage.getItem('isCoorientando') === 'true';
        if (isCoorientando) {
            const cardEnvio = document.querySelector('[data-role="envio-documentos"]');
            const cardRecebimento = document.querySelector('[data-role="recebimento-documentos"]');
            if (cardEnvio) cardEnvio.style.display = 'none';
            if (cardRecebimento) cardRecebimento.style.display = 'none';
        }

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
