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

  const listaTermos = document.getElementById('listaTermos');
  const modal = new bootstrap.Modal(document.getElementById('modalApresentacao'));
  let termos = [];
  let professoresCache = {};
  let alunosCache = {};
  let todosProfessores = [];
  let termoAtual = null;

  async function carregarBancas() {
    try {
      const res = await fetch('/bancas');
      termos = await res.json();
      await popularNomes(termos);
      renderizarTabela();
    } catch {
      alert('Erro ao carregar as bancas.');
    }
  }

  async function getNomeAluno(email) {
    if (!email) return '—';
    if (alunosCache[email]) return alunosCache[email];
    try {
      const res = await fetch(`/alunos/${email}`);
      const data = await res.json();
      alunosCache[email] = data.nome;
      return data.nome;
    } catch {
      return email;
    }
  }

  async function getNomeProfessor(email) {
    if (!email) return '—';
    if (professoresCache[email]) return professoresCache[email];
    try {
      const res = await fetch(`/professores/${email}`);
      const data = await res.json();
      professoresCache[email] = data.nome;
      return data.nome;
    } catch {
      return email;
    }
  }

  async function popularNomes(termos) {
    for (const t of termos) {
      t.nomeAluno = await getNomeAluno(t.emailAluno);
      t.nomeOrientador = await getNomeProfessor(t.emailOrientador);
      t.nomeCoorientador = t.emailCoorientador ? await getNomeProfessor(t.emailCoorientador) : '—';
      t.nomeProfessor1 = t.emailProfessor1 ? await getNomeProfessor(t.emailProfessor1) : '—';
      t.nomeProfessor2 = t.emailProfessor2 ? await getNomeProfessor(t.emailProfessor2) : '—';
      t.nomeProfessor3 = t.emailProfessor3 ? await getNomeProfessor(t.emailProfessor3) : '—';
    }
  }

  async function renderizarTabela() {
    listaTermos.innerHTML = '';

    let termosFiltrados = termos;

    if (localStorage.getItem('coordBcc') === 'true') {
        termosFiltrados = termos.filter(t => t.curso === 'BCC');
    } else if (localStorage.getItem('coordSis') === 'true') {
        termosFiltrados = termos.filter(t => t.curso === 'SIS');
    }

    if (!termosFiltrados.length) {
      const placeholder = document.createElement('tr');
      placeholder.innerHTML = `
        <td colspan="6" style="text-align:center; color:gray;">Você ainda não tem nenhuma banca registrada.</td>
      `;
      listaTermos.appendChild(placeholder);
      return;
    }

    termosFiltrados
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      .forEach(async termo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${termo.nomeAluno}</td>
            <td>${termo.titulo}</td>
            <td>${termo.nomeOrientador}</td>
            <td>${termo.nomeCoorientador}</td>
            <td>${criarBadgeStatus(termo.marcada)}</td>
            <td>
                <button class="btn btn-sm btn-primary btn-configurar">Ver</button>
            </td>
        `;
        tr.querySelector('.btn-configurar').addEventListener('click', () => abrirModal(termo));
        listaTermos.prepend(tr);
    });
  }

  function criarBadgeStatus(status) {
    switch (status) {
        case false: return '<span class="badge bg-warning text-dark">Não marcada</span>';
        case true: return '<span class="badge bg-success">Marcada</span>';
    }
  }

  async function carregarTodosProfessores() {
    if (todosProfessores.length > 0) return todosProfessores;
    try {
      const res = await fetch('/professores');
      todosProfessores = await res.json();
      todosProfessores.forEach(prof => {
        professoresCache[prof.email] = prof.nome;
      });
      return todosProfessores;
    } catch {
      alert('Erro ao carregar professores.');
      return [];
    }
  }

  async function abrirModal(termo) {
    termoAtual = termo;
    document.getElementById('modalNomeAluno').textContent = termo.nomeAluno;
    document.getElementById('modalTitulo').textContent = termo.titulo;
    document.getElementById('modalResumo').textContent = termo.resumo;

    const professores = await carregarTodosProfessores();
    const nomeOrientador = termo.nomeOrientador || await getNomeProfessor(termo.emailOrientador);
    const nomeCoorientador = termo.nomeCoorientador || (termo.emailCoorientador ? await getNomeProfessor(termo.emailCoorientador) : '—');

    document.getElementById('modalNomeOrientador').textContent = nomeOrientador;
    document.getElementById('modalNomeCoorientador').textContent = nomeCoorientador;

    ['professor1', 'professor2', 'professor3'].forEach((id, i) => {
      const select = document.getElementById(id);
      select.innerHTML = '<option value="">Selecione</option>';
      professores.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.email;
        option.textContent = prof.nome;
        if (prof.email === termo[`emailProfessor${i + 1}`]) option.selected = true;
        select.appendChild(option);
      });
    });

    document.getElementById('dataApresentacao').value = termo.data || '';
    document.getElementById('horaApresentacao').value = termo.hora || '';

    const btnSalvar = document.getElementById('btnSalvar');
    if (termo.marcada) {
        btnSalvar.disabled = true;
        btnSalvar.style.opacity = '0.5';
    } else {
        btnSalvar.disabled = false;
        btnSalvar.style.opacity = '1';
    }

    modal.show();
  }

  document.getElementById('btnSalvar').addEventListener('click', async () => {
    if (!termoAtual) return;

    const payload = {
      emailAluno: termoAtual.emailAluno,
      emailOrientador: termoAtual.emailOrientador,
      curso: termoAtual.curso,
      titulo: termoAtual.titulo,
      resumo: termoAtual.resumo,
      emailProfessor1: document.getElementById('professor1').value || null,
      emailProfessor2: document.getElementById('professor2').value || null,
      emailProfessor3: document.getElementById('professor3').value || null,
      data: document.getElementById('dataApresentacao').value || null,
      hora: document.getElementById('horaApresentacao').value || null,
      marcada: true
    };

    try {
      const res = await fetch(`/bancas/${termoAtual.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      termoAtual.emailProfessor1 = payload.emailProfessor1;
      termoAtual.emailProfessor2 = payload.emailProfessor2;
      termoAtual.emailProfessor3 = payload.emailProfessor3;
      termoAtual.data = payload.data;
      termoAtual.hora = payload.hora;
      termoAtual.marcada = true;

      await popularNomes([termoAtual]);
      modal.hide();
      renderizarTabela();
    } catch {
      alert('Houve um erro. Verifique suas credenciais e tente novamente.');
    }
  });

  document.getElementById('btnSair').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/login.html';
  });

  await carregarBancas();
});
