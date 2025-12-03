document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email');

  if (tipo !== 'professor' || !emailProfessor || localStorage.getItem('prof_tcc1_sis') !== 'true') {
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
  let termos = [];

  async function carregarTermos() {
    try {
      const res = await fetch('/termos');
      if (!res.ok) throw new Error();

      let dados = await res.json();
      if (Array.isArray(dados)) {
      } else if (Array.isArray(dados.content)) {
        dados = dados.content;
      } else if (Array.isArray(dados.items)) {
        dados = dados.items;
      } else {
        dados = [];
      }

      termos = dados.filter(termo => {
        const statusCoorientador = (termo.statusCoorientador || '').toLowerCase();
        const curso = (termo.cursoAluno || '').toUpperCase();
        return statusCoorientador === 'aprovado' && curso === 'SIS';
      });

      listaTermos.innerHTML = '';

      if (!termos.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td colspan="7" style="text-align:center; color:gray;">
            Você ainda não recebeu nenhum termo de compromisso.
          </td>
        `;
        listaTermos.appendChild(tr);
        return;
      }

      termos.forEach(termo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${termo.nomeAluno || termo.aluno?.nome || ''}</td>
          <td>${termo.nomeParceiro || '—'}</td>
          <td>${termo.titulo || ''}</td>
          <td data-email="${termo.emailOrientador || termo.orientador?.email || ''}" class="campoOrientador">Carregando...</td>
          <td data-email="${termo.emailCoorientador || termo.coorientador?.email || ''}" class="campoCoorientador">Carregando...</td>
          <td class="campoStatus">${criarBadgeStatus(termo.statusFinal || 'pendente')}</td>
          <td>
            <button class="btn btn-sm btn-primary btn-ver" data-id="${termo.id}" data-bs-toggle="modal" data-bs-target="#modalApresentacao">
              Ver
            </button>
          </td>
        `;
        listaTermos.prepend(tr);
      });

      await carregarNomesProfessores();

      document.querySelectorAll('.btn-ver').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = e.target.dataset.id;
          const termo = termos.find(t => String(t.id) === String(id));
          if (termo) preencherModal(termo);
        });
      });

    } catch (e) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="7" style="text-align:center; color:gray;">
          Você ainda não recebeu nenhum termo de compromisso.
        </td>
      `;
      listaTermos.appendChild(tr);
    }
  }

  async function carregarNomesProfessores() {
    const lista = document.querySelectorAll('.campoOrientador, .campoCoorientador');
    for (const campo of lista) {
      const email = campo.dataset.email;
      if (!email) {
        campo.textContent = '—';
        continue;
      }
      try {
        const r = await fetch(`/professores/${email}`);
        if (!r.ok) throw new Error();
        const prof = await r.json();
        campo.textContent = prof.nome || email;
      } catch {
        campo.textContent = email;
      }
    }
  }

  async function buscarNomeProfessor(email) {
    if (!email) return '—';
    try {
      const r = await fetch(`/professores/${email}`);
      if (!r.ok) throw new Error();
      const p = await r.json();
      return p.nome || email;
    } catch {
      return email;
    }
  }

  async function preencherModal(termo) {
    document.getElementById('modalNomeAluno').textContent = termo.nomeAluno || termo.aluno?.nome || '—';
    document.getElementById('modalTitulo').textContent = termo.titulo || '—';
    document.getElementById('modalResumo').textContent = termo.resumo || '—';
    document.getElementById('modalPerfilCoorientador').textContent = termo.perfilCoorientador || '—';

    document.getElementById('modalNomeOrientador').textContent = await buscarNomeProfessor(termo.emailOrientador);
    document.getElementById('modalNomeCoorientador').textContent = termo.emailCoorientador
      ? await buscarNomeProfessor(termo.emailCoorientador)
      : '—';

    const btnAprovar = document.getElementById('btnSalvar');
    const btnDevolver = document.querySelector('#modalApresentacao .btn-danger');

    const bloqueado = termo.statusFinal && termo.statusFinal.toLowerCase() !== 'pendente';
    btnAprovar.disabled = bloqueado;
    btnDevolver.disabled = bloqueado;

    btnAprovar.onclick = () => atualizarStatus(termo, 'aprovado');
    btnDevolver.onclick = () => atualizarStatus(termo, 'devolvido');
  }

  async function atualizarStatus(termo, status) {
    try {
      const r = await fetch(`/termos/${termo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusProfessorTcc1: status })
      });

      if (r.ok) {
        termo.statusFinal = status;

        const linha = [...listaTermos.querySelectorAll('tr')].find(tr =>
          tr.querySelector('.btn-ver')?.dataset.id === String(termo.id)
        );

        if (linha) {
          const campoStatus = linha.querySelector('.campoStatus');
          campoStatus.innerHTML = criarBadgeStatus(status);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalApresentacao'));
        if (modal) modal.hide();
      }
    } catch {}
  }

  function criarBadgeStatus(status) {
    const s = (status || '').toLowerCase();
    if (s === 'aprovado') return '<span class="badge bg-success">Aprovado</span>';
    if (s === 'devolvido') return '<span class="badge bg-danger">Devolvido</span>';
    return '<span class="badge bg-warning text-dark">Pendente</span>';
  }

  carregarTermos();
});
