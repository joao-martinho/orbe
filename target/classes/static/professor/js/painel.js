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

  const email = localStorage.getItem('email');
  if (!email) {
    console.error('Email não encontrado no localStorage');
    return;
  }

  const row = document.querySelector('.row');
  if (!row) {
    console.error('Container .row não encontrado!');
    return;
  }

  const emailsProcessados = new Set();
  let alunoSelecionado = null;
  let colSelecionado = null;

  document.querySelectorAll('.col.revisao').forEach(col => {
    const role = col.dataset.role;
    if (localStorage.getItem(role) === 'true') {
      col.style.display = 'block';
    }
  });

  document.querySelectorAll('.col[data-role]').forEach(col => {
    const role = col.dataset.role;
    if (localStorage.getItem(role) === 'true') {
      col.style.display = 'block';
    } else {
      col.style.display = 'none';
    }
  });

  document.querySelectorAll('.col[data-role]').forEach(col => {
    const role = col.dataset.role;
    let label = null;

    if (role === 'prof_tcc1') label = 'Professor de TCC I';
    if (role === 'coord_bcc') label = 'Coordenador de BCC';
    if (role === 'coord_sis') label = 'Coordenador de SIS';

    if (label) {
      const card = col.querySelector('.card');
      if (!card) return;

      const badgeContainer = document.createElement('div');
      badgeContainer.className = 'position-absolute top-0 end-0 m-2';

      const badge = document.createElement('span');
      badge.className = 'badge bg-success';
      badge.textContent = label;

      badgeContainer.appendChild(badge);
      card.classList.add('position-relative');
      card.appendChild(badgeContainer);
    }
  });

  function criarCard(aluno, tipoOrientacao = 'Orientando', isProvisorio = false) {
    if (emailsProcessados.has(aluno.email)) return;
    emailsProcessados.add(aluno.email);

    const col = document.createElement('div');
    col.className = 'col';
    col.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm position-relative';

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'position-absolute top-0 end-0 m-2 d-flex gap-1';

    if (isProvisorio || tipoOrientacao.includes('provisório')) {
      const badgeProvisorio = document.createElement('span');
      badgeProvisorio.className = 'badge bg-warning text-dark';
      badgeProvisorio.textContent = 'Provisório';
      badgeContainer.appendChild(badgeProvisorio);
    }

    if (tipoOrientacao.includes('Coorientando')) {
      const badgeCoorientando = document.createElement('span');
      badgeCoorientando.className = 'badge bg-info text-dark';
      badgeCoorientando.textContent = 'Coorientando';
      badgeContainer.appendChild(badgeCoorientando);
    }

    if (badgeContainer.childElementCount > 0) {
      card.appendChild(badgeContainer);
    }

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column justify-content-between';

    const nomes = aluno.nome.split(' ');
    let exibicao;

    if (nomes.length >= 2) {
        const segundo = nomes[1].toLowerCase();
        const primeirasPreposicoes = ['de', 'do', 'da', 'dos', 'das'];

        if (primeirasPreposicoes.includes(segundo)) {
            const terceiro = nomes[2] ? nomes[2][0] + '.' : '';
            exibicao = `${nomes[0]} ${nomes[1]} ${terceiro}`;
        } else {
            exibicao = `${nomes[0]} ${nomes[1][0]}.`;
        }
    } else {
        exibicao = nomes[0];
    }

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = exibicao;

    const text = document.createElement('p');
    text.className = 'card-text text-muted';
    text.textContent = `Clique para acompanhar o progresso do ${tipoOrientacao.toLowerCase()}.`;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'd-flex gap-2 mt-3';

    if (isProvisorio || tipoOrientacao.includes('provisório')) {
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn btn-danger flex-fill';
      btnRemover.textContent = 'Remover';
      btnRemover.addEventListener('click', e => {
        e.stopPropagation();
        alunoSelecionado = aluno.email;
        colSelecionado = col;
        modalConfirm.show();
      });
      buttonContainer.appendChild(btnRemover);
    }

    const link = document.createElement('a');
    link.href = 'orientando/painel.html';
    link.className = 'btn btn-primary flex-fill';
    link.textContent = 'Acessar';

    buttonContainer.appendChild(link);

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(buttonContainer);

    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);

    card.addEventListener('click', () => {
      localStorage.setItem('orientando', aluno.email);
    });
  }

  try {
    const tipos = [
      { url: `/professores/orientandos/${email}`, tipo: 'Orientando', provisorio: false },
      { url: `/professores/orientandos-provisorios/${email}`, tipo: 'Orientando', provisorio: true },
      { url: `/professores/coorientandos/${email}`, tipo: 'Coorientando', provisorio: false },
      { url: `/professores/coorientandos-provisorios/${email}`, tipo: 'Coorientando', provisorio: true },
    ];

    for (const t of tipos) {
      const response = await fetch(t.url);
      if (!response.ok) throw new Error(`Erro ao buscar ${t.tipo}${t.provisorio ? ' provisórios' : ''}: ${response.status}`);
      const alunos = await response.json();
      alunos.forEach(aluno => criarCard(aluno, t.tipo, t.provisorio));
    }
  } catch (err) {
    console.error(err);
  }

  const modalHTML = `
    <div class="modal fade" id="modalConfirmRemover" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja remover o aluno?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-danger" id="confirmRemove">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmRemover'));

  document.getElementById('confirmRemove').addEventListener('click', async () => {
    modalConfirm.hide();
    if (!alunoSelecionado || !colSelecionado) return;

    try {
      const urlOri = `/professores/remover-provisorio/${encodeURIComponent(email)}/${encodeURIComponent(alunoSelecionado)}`;
      const resOri = await fetch(urlOri, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!resOri.ok) {
        const text = await resOri.text();
        const erroData = text ? JSON.parse(text) : {};
        throw new Error(erroData.message || 'Erro ao remover aluno.');
      }

      colSelecionado.remove();
      alunoSelecionado = null;
      colSelecionado = null;

    } catch (err) {
      console.error(err);
    }
  });

  const badgeMensagens = document.getElementById('badge-mensagens')

  async function atualizarBadgeMensagens() {
    try {
      const res = await fetch(`/notificacoes/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error(`Falha ao carregar notificações. Status: ${res.status}`);

      const dados = await res.json();
      const mensagens = Array.isArray(dados) ? dados : [dados];
      const naoLidas = mensagens.filter(msg => !msg.lida).length;

      if (naoLidas > 0) {
        badgeMensagens.textContent = naoLidas;
        badgeMensagens.style.display = 'inline-block';
      } else {
        badgeMensagens.style.display = 'none';
      }
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
      badgeMensagens.style.display = 'none';
    }
  }

  await atualizarBadgeMensagens();

});
