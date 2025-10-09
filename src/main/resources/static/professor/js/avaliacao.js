document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    mostrarMensagem('Você não tem permissão para acessar esta página :(', 'danger');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const emailAluno = localStorage.getItem('avaliando');
  const emailProfessorLogado = localStorage.getItem('email');

  const campoAluno = document.querySelector('#formNotas h5');
  const tituloEl = document.getElementById('titulo');
  const orientadorEl = document.getElementById('orientador');
  const mediaEl = document.getElementById('mediaFinal');
  const statusEl = document.getElementById('textStatus');

  const camposNotas = [
    { input: document.getElementById('nota1'), label: document.querySelector('label[for="nota1"]'), campo: 'nota1' },
    { input: document.getElementById('nota2'), label: document.querySelector('label[for="nota2"]'), campo: 'nota2' },
    { input: document.getElementById('nota3'), label: document.querySelector('label[for="nota3"]'), campo: 'nota3' },
  ];

  let banca;
  let aluno;

  function mostrarMensagem(texto, tipo='success') {
    const div = document.getElementById('mensagens');
    div.innerHTML = `<div class="alert alert-${tipo}" role="alert">${texto}</div>`;
    setTimeout(() => div.innerHTML = '', 5000);
  }

  function atualizarStatus(bancaObj) {
    const notas = [bancaObj.nota1, bancaObj.nota2, bancaObj.nota3];
    if (notas.some(n => !n || n === 0)) {
      bancaObj.status = 'pendente';
      statusEl.innerHTML = '<span class="badge bg-warning text-dark">Pendente</span>';
    } else if (bancaObj.mediaFinal >= 6) {
      bancaObj.status = 'aprovado';
      statusEl.innerHTML = '<span class="badge bg-success">Aprovado</span>';
    } else {
      bancaObj.status = 'reprovado';
      statusEl.innerHTML = '<span class="badge bg-danger">Reprovado</span>';
    }
  }

  try {
    const resAluno = await fetch(`/alunos/${emailAluno}`);
    if (!resAluno.ok) throw new Error('Erro ao buscar aluno');
    aluno = await resAluno.json();
    campoAluno.textContent = `Aluno: ${aluno.nome}`;

    const resBanca = await fetch(`/bancas/aluno/${emailAluno}`);
    if (!resBanca.ok) throw new Error('Erro ao buscar banca');
    banca = await resBanca.json();

    tituloEl.textContent = banca.titulo || '—';

    if (banca.emailOrientador) {
      const resOrientador = await fetch(`/professores/${banca.emailOrientador}`);
      if (resOrientador.ok) {
        const orientador = await resOrientador.json();
        orientadorEl.textContent = orientador.nome || banca.emailOrientador;
      } else {
        orientadorEl.textContent = banca.emailOrientador;
      }
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

      camposNotas[i].label.textContent = `Nota ${i + 1} - ${prof.nome}`;
      camposNotas[i].input.value = banca[camposNotas[i].campo] ?? '';

      if (professoresEmails[i] !== emailProfessorLogado) {
        camposNotas[i].input.readOnly = true;
      }
    }

    mediaEl.textContent = banca.mediaFinal != null ? banca.mediaFinal.toFixed(2) : '—';

    atualizarStatus(banca);

    if (banca.status === 'aprovado' || banca.status === 'reprovado') {
      camposNotas.forEach(c => c.input.disabled = true);
      const btnSubmit = document.querySelector('#formNotas button[type="submit"]');
      if (btnSubmit) btnSubmit.disabled = true;
    }

  } catch (err) {
    console.error(err);
  }

  function calcularMedia(bancaObj) {
    const n1 = bancaObj.nota1 ?? 0;
    const n2 = bancaObj.nota2 ?? 0;
    const n3 = bancaObj.nota3 ?? 0;
    let media = 0;

    if (!aluno || !aluno.curso) return 0;

    if (aluno.curso === 'BCC') {
      media = (n1 * 0.1) + (n2 * 0.2) + (n3 * 0.1) + (n1 * 0.2) + (n2 * 0.4);
    } else if (aluno.curso === 'SIS') {
      media = (n1 * 0.1) + (n2 * 0.2) + (n1 * 0.25) + (n2 * 0.45);
    } else {
      const notasValidas = [n1, n2, n3].filter(n => n != null && !isNaN(n));
      media = notasValidas.length > 0 ? notasValidas.reduce((a,b)=>a+b,0)/notasValidas.length : 0;
    }

    return media;
  }

  const form = document.getElementById('formNotas');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (banca.status === 'aprovado' || banca.status === 'reprovado') return;

    let notaAtualizada = null;
    let campoNota = null;

    for (let i = 0; i < 3; i++) {
      if (!camposNotas[i].input.readOnly) {
        notaAtualizada = parseFloat(camposNotas[i].input.value);
        campoNota = camposNotas[i].campo;
        break;
      }
    }

    if (notaAtualizada == null || isNaN(notaAtualizada)) {
      mostrarMensagem('Nota inválida.', 'danger');
      return;
    }

    const bancaAtualizada = { ...banca, [campoNota]: notaAtualizada };
    bancaAtualizada.mediaFinal = calcularMedia(bancaAtualizada);
    mediaEl.textContent = bancaAtualizada.mediaFinal.toFixed(2);

    atualizarStatus(bancaAtualizada);

    try {
      const res = await fetch(`/bancas/${banca.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bancaAtualizada)
      });

      if (!res.ok) throw new Error('Erro ao atualizar a banca');
      mostrarMensagem('Nota salva com sucesso.', 'success');
      banca = bancaAtualizada;

      if (banca.status === 'aprovado' || banca.status === 'reprovado') {
        camposNotas.forEach(c => c.input.disabled = true);
        const btnSubmit = document.querySelector('#formNotas button[type="submit"]');
        if (btnSubmit) btnSubmit.disabled = true;
      }

    } catch (err) {
      console.error(err);
      mostrarMensagem('Ocorreu um erro ao salvar a nota.', 'danger');
    }
  });
});
