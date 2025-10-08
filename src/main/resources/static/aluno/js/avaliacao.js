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
    { p: document.getElementById('textEmailAluno'), campo: 'nota1' },
    { p: document.getElementById('textTelefoneAluno'), campo: 'nota2' },
    { p: document.getElementById('textCurso'), campo: 'nota3' },
  ];

  const tituloEl = document.getElementById('titulo');
  const orientadorEl = document.getElementById('orientador');
  const mediaFinalEl = document.getElementById('textData');
  const statusEl = document.getElementById('textStatus');

  try {
    const resBanca = await fetch(`/bancas/aluno/${emailAluno}`);
    if (!resBanca.ok) throw new Error('Erro ao buscar banca');
    const banca = await resBanca.json();

    tituloEl.textContent = banca.titulo || '—';

    if (banca.emailOrientador) {
      const resOrientador = await fetch(`/professores/${banca.emailOrientador}`);
      if (!resOrientador.ok) throw new Error('Erro ao buscar orientador');
      const orientador = await resOrientador.json();
      orientadorEl.textContent = orientador.nome || banca.emailOrientador;
    } else {
      orientadorEl.textContent = '—';
    }

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

    const notas = [banca.nota1, banca.nota2, banca.nota3];
    if (notas.some(n => !n || n === 0)) {
      banca.status = 'pendente';
      statusEl.innerHTML = '<span class="badge bg-warning text-dark">Pendente</span>';
    } else if (banca.mediaFinal >= 6) {
      banca.status = 'aprovado';
      statusEl.innerHTML = '<span class="badge bg-success">Aprovado</span>';
    } else {
      banca.status = 'reprovado';
      statusEl.innerHTML = '<span class="badge bg-danger">Reprovado</span>';
    }

  } catch (err) {
    console.error(err);
  }
});
