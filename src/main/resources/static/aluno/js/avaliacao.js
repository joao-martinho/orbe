document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'aluno') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const emailAluno = localStorage.getItem('email');

  const camposNotas = [
    { p: document.getElementById('textEmailAluno'), label: null, campo: 'nota1' },
    { p: document.getElementById('textTelefoneAluno'), label: null, campo: 'nota2' },
    { p: document.getElementById('textCurso'), label: null, campo: 'nota3' },
  ];

  const mediaFinalEl = document.getElementById('textTitulo');

  try {
    const resBanca = await fetch(`/bancas/aluno/${emailAluno}`);
    if (!resBanca.ok) throw new Error('Erro ao buscar banca');
    const banca = await resBanca.json();

    const professoresEmails = [
      banca.emailProfessor1,
      banca.emailProfessor2,
      banca.emailProfessor3
    ];

    for (let i = 0; i < 3; i++) {
      const resProf = await fetch(`/professores/${professoresEmails[i]}`);
      if (!resProf.ok) throw new Error('Erro ao buscar professor');
      const prof = await resProf.json();

      camposNotas[i].p.previousElementSibling.textContent = `Nota ${i + 1} - ${prof.nome}:`;
      camposNotas[i].p.textContent = banca[camposNotas[i].campo] != null ? banca[camposNotas[i].campo].toFixed(2) : '—';
    }

    if (banca.mediaFinal != null) {
      mediaFinalEl.textContent = banca.mediaFinal.toFixed(2);
    } else {
      mediaFinalEl.textContent = '—';
    }

  } catch (err) {
    console.error(err);
  }
});
