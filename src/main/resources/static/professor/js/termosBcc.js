document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email');

  if (tipo !== 'professor' || !emailProfessor || localStorage.getItem('prof_tcc1_bcc') !== 'true') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const listaTermos = document.getElementById('listaTermos');
  const modalEl = document.getElementById('modalApresentacao');
  let instanciaModal = null;
  let termos = [];

  modalEl.addEventListener('shown.bs.modal', () => {
    instanciaModal = bootstrap.Modal.getInstance(modalEl);
  });

  async function carregarTermos() {
    try {
      const res = await fetch('/termos');
      if (!res.ok) throw new Error('Falha ao carregar termos');

      let dados = await res.json();

      if (Array.isArray(dados)) {
      } else if (Array.isArray(dados.content)) {
        dados = dados.content;
      } else if (Array.isArray(dados.items)) {
        dados = dados.items;
      } else {
        dados = [];
      }

      termos = dados.filter(t => {
        const statusCoor = (t.statusCoorientador || '').toLowerCase();
        const curso = (t.cursoAluno || '').toUpperCase();
        return statusCoor === 'aprovado' && curso === 'BCC';
      });

      listaTermos.innerHTML = '';

      if (termos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center text-muted">Você ainda não recebeu nenhum termo de compromisso.</td>`;
        listaTermos.appendChild(tr);
        return;
      }

      termos.forEach(termo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${termo.nomeAluno || termo.aluno?.nome || ''}</td>
          <td>${termo.titulo || ''}</td>
          <td data-email="${termo.emailOrientador}" class="campoOrientador">Carregando...</td>
          <td data-email="${termo.emailCoorientador || ''}" class="campoCoorientador">Carregando...</td>
          <td class="campoStatus">${criarBadgeStatus(termo.statusFinal || 'pendente')}</td>
          <td>
            <button class="btn btn-sm btn-primary btn-ver" data-id="${termo.id}" data-bs-toggle="modal" data-bs-target="#modalApresentacao">
              Ver
            </button>
          </td>
        `;
        listaTermos.appendChild(tr);
      });

      await carregarNomesProfessores();

      document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = e.target.dataset.id;
          const termo = termos.find(t => String(t.id) === String(id));
          if (termo) preencherModal(termo);
        });
      });

    } catch (err) {
      console.error(err);
      listaTermos.innerHTML =
        `<tr><td colspan="6" class="text-center text-muted">Você ainda não recebeu nenhum termo de compromisso.</td></tr>`;
    }
  }

  async function carregarNomesProfessores() {
    const campos = document.querySelectorAll('.campoOrientador, .campoCoorientador');
    for (const campo of campos) {
      const email = campo.dataset.email;
      if (!email) {
        campo.textContent = '—';
        continue;
      }
      try {
        const res = await fetch(`/professores/${email}`);
        if (!res.ok) throw new Error();
        const prof = await res.json();
        campo.textContent = prof.nome || email;
      } catch {
        campo.textContent = email;
      }
    }
  }

  async function preencherModal(termo) {
    document.getElementById('modalNomeAluno').textContent = termo.nomeAluno;
    document.getElementById('modalTitulo').textContent = termo.titulo;
    document.getElementById('modalResumo').textContent = termo.resumo;
    document.getElementById('modalPerfilCoorientador').textContent = termo.perfilCoorientador || '—';

    document.getElementById('modalNomeOrientador').textContent =
      await buscarNome(termo.emailOrientador);

    document.getElementById('modalNomeCoorientador').textContent =
      termo.emailCoorientador ? await buscarNome(termo.emailCoorientador) : '—';

    const btnAprovar = document.getElementById('btnSalvar');
    const btnDevolver = modalEl.querySelector('.btn-danger');

    const bloqueado = termo.statusFinal && termo.statusFinal.toLowerCase() !== 'pendente';
    btnAprovar.disabled = bloqueado;
    btnDevolver.disabled = bloqueado;

    btnAprovar.onclick = () => atualizarStatus(termo, 'aprovado');
    btnDevolver.onclick = () => atualizarStatus(termo, 'devolvido');
  }

  async function buscarNome(email) {
    try {
      const res = await fetch(`/professores/${email}`);
      if (!res.ok) throw new Error();
      const prof = await res.json();
      return prof.nome || email;
    } catch {
      return email;
    }
  }

  async function atualizarStatus(termo, status) {
    const btnAprovar = document.getElementById('btnSalvar');
    const btnDevolver = modalEl.querySelector('.btn-danger');

    btnAprovar.disabled = true;
    btnDevolver.disabled = true;

    btnAprovar.textContent = 'Salvando...';
    btnDevolver.textContent = 'Salvando...';

    try {
      const res = await fetch(`/termos/${termo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusProfessorTcc1: status })
      });

      if (res.ok) {
        termo.statusFinal = status;

        const linha = [...listaTermos.querySelectorAll('tr')]
          .find(tr => tr.querySelector('.btn-ver')?.dataset.id === String(termo.id));

        if (linha) {
          linha.querySelector('.campoStatus').innerHTML = criarBadgeStatus(status);
        }

        if (instanciaModal) instanciaModal.hide();
      }

    } catch (err) {
      console.error(err);
    } finally {
      btnAprovar.textContent = 'Aprovar';
      btnDevolver.textContent = 'Devolver';
    }
  }

  function criarBadgeStatus(status) {
    const s = (status || 'pendente').toLowerCase();
    if (s === 'aprovado') return '<span class="badge bg-success">Aprovado</span>';
    if (s === 'devolvido') return '<span class="badge bg-danger">Devolvido</span>';
    return '<span class="badge bg-warning text-dark">Pendente</span>';
  }

  carregarTermos();
});
