document.addEventListener('DOMContentLoaded', async () => {
  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const emailAluno = localStorage.getItem('email');
  const tipo = localStorage.getItem('tipo');

  if (tipo !== 'aluno' || !emailAluno) {
    alert('Você não tem permissão para acessar esta página.');
    window.location.href = '../login.html';
    return;
  }

  try {
    const resAluno = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
    if (!resAluno.ok) throw new Error('Erro ao carregar dados do aluno.');
    const aluno = await resAluno.json();

    if (!aluno.orientador) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return;
    }

    const resBanca = await fetch(`/bancas/aluno/${emailAluno}`);
    if (!resBanca.ok) throw new Error('Erro ao buscar banca.');
    const banca = await resBanca.json();

    const tituloEl = document.getElementById('titulo');
    const orientadorEl = document.getElementById('orientador');
    const mediaFinalEl = document.getElementById('textData');
    const statusEl = document.getElementById('textStatus');
    const dataEHoraEl = document.getElementById('dataEHora');

    tituloEl && (tituloEl.textContent = banca.titulo || '—');

    if (banca.emailOrientador) {
      const resOrientador = await fetch(`/professores/${banca.emailOrientador}`);
      if (!resOrientador.ok) throw new Error('Erro ao buscar orientador.');
      const orientador = await resOrientador.json();
      orientadorEl && (orientadorEl.textContent = orientador.nome || banca.emailOrientador);
    } else {
      orientadorEl && (orientadorEl.textContent = '—');
    }

    dataEHoraEl && (dataEHoraEl.textContent = formatarDataEHora(banca.data, banca.hora));

    const camposNotas = [
      { p: document.getElementById('textEmailAluno'), campo: 'nota1' },
      { p: document.getElementById('textTelefoneAluno'), campo: 'nota2' },
      { p: document.getElementById('textCurso'), campo: 'nota3' },
    ];

    const professoresEmails = [banca.emailProfessor1, banca.emailProfessor2, banca.emailProfessor3];

    for (let i = 0; i < 3; i++) {
      const campo = camposNotas[i];
      if (!campo.p || !professoresEmails[i]) continue;

      const resProf = await fetch(`/professores/${professoresEmails[i]}`);
      if (!resProf.ok) throw new Error(`Erro ao buscar professor ${i+1}.`);
      const prof = await resProf.json();

      campo.p.previousElementSibling && (campo.p.previousElementSibling.textContent = `Nota ${i + 1} - ${prof.nome}:`);
      campo.p.textContent = banca[campo.campo] != null ? banca[campo.campo].toFixed(2) : '—';
    }

    mediaFinalEl && (mediaFinalEl.textContent = banca.mediaFinal != null ? banca.mediaFinal.toFixed(2) : '—');

    const notas = [banca.nota1, banca.nota2, banca.nota3];
    if (notas.some(n => !n || n === 0)) {
      banca.status = 'pendente';
      statusEl && (statusEl.innerHTML = '<span class="badge bg-warning text-dark">Pendente</span>');
    } else if (banca.mediaFinal >= 6) {
      banca.status = 'aprovado';
      statusEl && (statusEl.innerHTML = '<span class="badge bg-success">Aprovado</span>');
    } else {
      banca.status = 'reprovado';
      statusEl && (statusEl.innerHTML = '<span class="badge bg-danger">Reprovado</span>');
    }

  } catch (err) {
    console.error(err);
    alert('Ocorreu um erro ao carregar os dados. Verifique o console.');
  }

  function formatarDataEHora(dataStr, horaStr) {
    if (!dataStr) return '—';
    const [ano, mes, dia] = dataStr.split('-');
    let [h, m] = horaStr ? horaStr.split(':') : ['00', '00'];
    return `${dia.padStart(2,'0')}/${mes.padStart(2,'0')}/${ano}, ${h.padStart(2,'0')}:${m.padStart(2,'0')}`;
  }
});
