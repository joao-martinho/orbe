document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
	if (tipo !== 'professor') {
		alert('Você não tem permissão para acessar esta página :(');
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
  const camposNotas = [
    { input: document.getElementById('nota1'), label: document.querySelector('label[for="nota1"]') },
    { input: document.getElementById('nota2'), label: document.querySelector('label[for="nota2"]') },
    { input: document.getElementById('nota3'), label: document.querySelector('label[for="nota3"]') },
  ];

  try {
    const resAluno = await fetch(`/alunos/${emailAluno}`);
    if (!resAluno.ok) throw new Error('Erro ao buscar aluno');
    const aluno = await resAluno.json();
    campoAluno.textContent = `Aluno: ${aluno.nome}`;

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

      camposNotas[i].label.textContent = `Nota ${i + 1} - ${prof.nome}`;

      if (professoresEmails[i] !== emailProfessorLogado) {
        camposNotas[i].input.readOnly = true;
      }
    }
  } catch (err) {
    console.error(err);
    alert('Ocorreu um erro ao carregar os dados.');
  }
});
