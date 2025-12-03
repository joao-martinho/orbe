document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailUsuario = localStorage.getItem('email')
  if (
  tipo !== 'professor' ||
  !emailUsuario ||
  (
    localStorage.getItem('prof_tcc2_sis') !== 'true'
  )
) {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.removeItem('bancas_bcc');
    localStorage.removeItem('bancas_sis');
    localStorage.removeItem('bancas_curso');
    localStorage.removeItem('tipo');
    localStorage.removeItem('email');
    window.location.href = '../login.html';
  });

  const listaTermos = document.getElementById('listaTermos');
  const modalElement = document.getElementById('modalApresentacao');
  const modal = new bootstrap.Modal(modalElement);
  const form = document.getElementById('formApresentacao');
  let todasBancas = [];
  let termos = [];
  let professoresCache = {};
  let alunosCache = {};
  let todosProfessores = [];
  let termoAtual = null;
  let papeisUsuario = [];

  async function carregarUsuarioAtual() {
    try {
      const res = await fetch(`/professores/${emailUsuario}`);
      const professor = await res.json();
      papeisUsuario = professor.papeis || [];
    } catch {
      console.log('Erro ao carregar usuário atual.');
      papeisUsuario = [];
    }
  }

  async function carregarBancas() {
    try {
      const res = await fetch('/bancas');
      todasBancas = await res.json();

      termos = [];
      termos = termos.concat(todasBancas.filter(banca => banca.curso === 'SIS'));

      await popularNomes(termos);
      renderizarTabela();
    } catch {
      console.log('Erro ao carregar as bancas.');
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
      t.nomeAluno1 = await getNomeAluno(t.emailAluno1);
      t.nomeAluno2 = await getNomeAluno(t.emailAluno2);
      t.nomeOrientador = await getNomeProfessor(t.emailOrientador);
      t.nomeCoorientador = t.emailCoorientador ? await getNomeProfessor(t.emailCoorientador) : '—';
      t.nomeAvaliador = t.emailAvaliador ? await getNomeProfessor(t.emailAvaliador) : '—';
    }
  }

  async function renderizarTabela() {
    listaTermos.innerHTML = '';

    if (!termos.length) {
      const placeholder = document.createElement('tr');
      placeholder.innerHTML = `
        <td colspan="6" style="text-align:center; color:gray;">Ainda não há nenhuma banca registrada.</td>
      `;
      listaTermos.appendChild(placeholder);
      return;
    }

    termos
      .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
      .forEach(termo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${termo.nomeAluno1}</td>
          <td>${termo.nomeAluno2}</td>
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
      case false:
        return '<span class="badge bg-warning text-dark">Não marcada</span>';
      case true:
        return '<span class="badge bg-success">Marcada</span>';
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
      console.log('Erro ao carregar professores.');
      return [];
    }
  }

  async function abrirModal(termo) {
    termoAtual = termo;
    let tipo;
    if (termo.tipo === 'inovacao') {
      tipo = "inovação";
    }
    else {
      tipo = "aplicado"
    }

    document.getElementById('modalNomeAluno1').textContent = termo.nomeAluno1;
    document.getElementById('modalNomeAluno2').textContent = termo.nomeAluno2;
    document.getElementById('modalTitulo').textContent = termo.titulo;
    document.getElementById('modalTipo').textContent = tipo;
    document.getElementById('modalResumo').textContent = termo.resumo;

    const professores = await carregarTodosProfessores();
    document.getElementById('modalNomeOrientador').textContent = termo.nomeOrientador;
    document.getElementById('modalNomeCoorientador').textContent = termo.nomeCoorientador;

    const selectAvaliador = document.getElementById('avaliador');
    selectAvaliador.innerHTML = '<option value="">Escolha</option>';
    professores.forEach(prof => {
      const option = document.createElement('option');
      option.value = prof.email;
      option.textContent = prof.nome;
      if (prof.email === termo.emailAvaliador) option.selected = true;
      selectAvaliador.appendChild(option);
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

    form.classList.remove('was-validated');
    modal.show();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    if (!termoAtual) return;

    const payload = {
      emailAluno: termoAtual.emailAluno,
      emailOrientador: termoAtual.emailOrientador,
      curso: termoAtual.curso,
      titulo: termoAtual.titulo,
      resumo: termoAtual.resumo,
      emailAvaliador: document.getElementById('avaliador').value || null,
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

      termoAtual.emailAvaliador = payload.emailAvaliador;
      termoAtual.data = payload.data;
      termoAtual.hora = payload.hora;
      termoAtual.marcada = true;

      await popularNomes([termoAtual]);
      modal.hide();
      renderizarTabela();
    } catch (error) {
      console.log(error);
    }
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    form.classList.remove('was-validated');
    form.reset();
  });

  await carregarUsuarioAtual();
  await carregarBancas();
});
