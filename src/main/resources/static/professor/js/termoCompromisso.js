document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email')
  if (tipo !== 'professor' || !emailProfessor || localStorage.getItem('prof_tcc1') !== 'true') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
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
      if (!res.ok) throw new Error('Erro ao carregar termos');

      let dados = await res.json();
      if (Array.isArray(dados)) {
      } else if (Array.isArray(dados.content)) {
        dados = dados.content;
      } else if (Array.isArray(dados.items)) {
        dados = dados.items;
      } else {
        console.warn('Formato inesperado de resposta:', dados);
        dados = [];
      }

      termos = dados.filter(termo => {
        const statusCoorientador = (termo.statusCoorientador || '').toLowerCase();
        return statusCoorientador === 'aprovado';
      });

      listaTermos.innerHTML = '';

      if (!termos.length) {
        const placeholder = document.createElement('tr');
        placeholder.innerHTML = `
          <td colspan="7" style="text-align:center; color:gray;">Você ainda não recebeu nenhum termo de compromisso.</td>
        `;
        listaTermos.appendChild(placeholder);
        return;
      }

      termos.forEach(termo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${termo.nomeAluno || termo.aluno?.nome || ''}</td>
          <td class="campoParceiro">${termo.nomeParceiro ? termo.nomeParceiro : '—'}</td>
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

    } catch (err) {
      console.error(err);
      const placeholder = document.createElement('tr');
      placeholder.innerHTML = `
        <td colspan="7" style="text-align:center; color:gray;">Você ainda não recebeu nenhum termo de compromisso.</td>
      `;
      listaTermos.appendChild(placeholder);
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
        if (!res.ok) throw new Error('Erro ao buscar professor');
        const prof = await res.json();
        campo.textContent = prof.nome || email;
      } catch (err) {
        console.error(err);
        campo.textContent = email;
      }
    }
  }

  async function preencherModal(termo) {
    document.getElementById('modalNomeAluno').textContent = termo.nomeAluno;
    document.getElementById('modalTitulo').textContent = termo.titulo;
    document.getElementById('modalResumo').textContent = termo.resumo;
    document.getElementById('modalPerfilCoorientador').textContent = termo.perfilCoorientador || '—';

    const modalParceiroContainer = document.getElementById('modalParceiroContainer');
    modalParceiroContainer.style.display = 'block';
    document.getElementById('modalNomeParceiro').textContent = termo.nomeParceiro || '—';

    const orientadorNome = await buscarNomeProfessor(termo.emailOrientador);
    const coorientadorNome = termo.emailCoorientador
      ? await buscarNomeProfessor(termo.emailCoorientador)
      : '—';

    document.getElementById('modalNomeOrientador').textContent = orientadorNome;
    document.getElementById('modalNomeCoorientador').textContent = coorientadorNome;

    const btnAprovar = document.getElementById('btnSalvar');
    const btnDevolver = document.querySelector('#modalApresentacao .btn-danger');

    const bloqueado = termo.statusFinal && termo.statusFinal.toLowerCase() !== 'pendente';
    btnAprovar.disabled = bloqueado;
    btnDevolver.disabled = bloqueado;

    btnAprovar.onclick = () => atualizarStatus(termo, 'aprovado');
    btnDevolver.onclick = () => atualizarStatus(termo, 'devolvido');
  }

  async function buscarNomeProfessor(email) {
    if (!email) return '—';
    try {
      const res = await fetch(`/professores/${email}`);
      if (!res.ok) throw new Error('Falha ao buscar professor');
      const prof = await res.json();
      return prof.nome || email;
    } catch (err) {
      console.error(err);
      return email;
    }
  }

  async function atualizarStatus(termo, status) {
    try {
      const res = await fetch(`/termos/${termo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusProfessorTcc1: status })
      });

      if (res.ok) {
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
    } catch (err) {
      console.error(err);
    }
  }

  function criarBadgeStatus(status) {
    const s = (status || 'pendente').toLowerCase();
    let badgeClass = 'bg-warning text-dark';
    let texto = 'Pendente';

    if (s === 'aprovado') {
      badgeClass = 'bg-success';
      texto = 'Aprovado';
    } else if (s === 'devolvido') {
      badgeClass = 'bg-danger';
      texto = 'Devolvido';
    } else if (s === 'pendente') {
      badgeClass = 'bg-warning text-dark';
      texto = 'Pendente';
    }

    return `<span class="badge ${badgeClass}">${texto}</span>`;
  }

  carregarTermos();
});
