document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email');
  if (tipo !== 'professor' || !emailProfessor) {
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

  const secaoFuncoes = document.getElementById('secao-funcoes-professor');
  const secaoAlunos = document.getElementById('secao-alunos');
  const secaoBancas = document.getElementById('secao-bancas');

  if (!secaoFuncoes || !secaoAlunos || !secaoBancas) {
    console.error('Uma ou mais seções esperadas não foram encontradas!');
    return;
  }

  const emailsProcessados = new Set();
  const parceirosProcesados = new Set();
  let alunoSelecionado = null;
  let colSelecionado = null;

  function criarCardPlaceholder(secao, tipo) {
    const col = document.createElement('div');
    col.className = 'col';
    col.style.display = 'block';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm text-muted';

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column justify-content-between';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent =
      tipo === 'aluno'
        ? 'Nenhum orientando'
        : tipo === 'banca'
        ? 'Nenhuma banca'
        : 'Nenhuma função';

    const text = document.createElement('p');
    text.className = 'card-text';
    text.textContent =
      tipo === 'aluno'
        ? 'Você ainda não tem nenhum orientando.'
        : tipo === 'banca'
        ? 'Você não faz parte de nenhuma banca de avaliação.'
        : 'Não há nenhum papel especial atribuído a você.';

    const button = document.createElement('button');
    button.className = 'btn btn-secondary mt-3';
    button.textContent = 'Indisponível';
    button.disabled = true;

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(button);

    card.appendChild(body);
    col.appendChild(card);
    secao.appendChild(col);
  }

  secaoFuncoes.querySelectorAll('.col[data-role]').forEach((col) => {
    const role = col.dataset.role;
    if (localStorage.getItem(role) === 'true') {
      col.style.display = 'block';
    } else {
      col.style.display = 'none';
    }

    let label = null;
    if (role === 'prof_tcc1') label = 'Professor de TCC I';
    if (role === 'prof_tcc2') label = 'Professor de TCC II';
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

  if (
    !secaoFuncoes.querySelector('.col') ||
    Array.from(secaoFuncoes.querySelectorAll('.col')).every(
      (col) => col.style.display === 'none'
    )
  ) {
    criarCardPlaceholder(secaoFuncoes, 'funcoes');
  }

  function criarCardAluno(aluno, tipoOrientacao = 'Orientando', isProvisorio = false) {
    if (emailsProcessados.has(aluno.email)) return;
    emailsProcessados.add(aluno.email);

    if (aluno.parceiro && aluno.curso === 'SIS' && !parceirosProcesados.has(aluno.email)) {
      criarCardParceiros(aluno, tipoOrientacao, isProvisorio);
      return;
    }

    if (parceirosProcesados.has(aluno.email)) return;

    criarCardIndividual(aluno, tipoOrientacao, isProvisorio);
  }

  async function criarCardParceiros(aluno, tipoOrientacao = 'Orientando', isProvisorio = false) {
    parceirosProcesados.add(aluno.email);
    parceirosProcesados.add(aluno.parceiro);

    let parceiro = null;
    try {
      const response = await fetch(`/alunos/${encodeURIComponent(aluno.parceiro)}`);
      if (response.ok) {
        parceiro = await response.json();
        emailsProcessados.add(parceiro.email);
      }
    } catch (err) {
      console.warn('Não foi possível buscar dados do parceiro:', err);
    }

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

    card.appendChild(badgeContainer);

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column justify-content-between';

    const title = document.createElement('h5');
    title.className = 'card-title';
    const nome1 = aluno.nome.trim().split(/\s+/)[0];
    const nome2 = parceiro ? parceiro.nome.trim().split(/\s+/)[0] : 'Parceiro';
    title.textContent = `${nome1} e ${nome2}`;

    const text = document.createElement('p');
    text.className = 'card-text text-muted';
    const nomeCompleto2 = parceiro ? parceiro.nome : aluno.parceiro;
    text.textContent = `Acompanhe o progresso de ${aluno.nome} e ${nomeCompleto2}.`;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'd-flex gap-2 mt-3';

    if (isProvisorio || tipoOrientacao.includes('provisório')) {
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn btn-danger flex-fill';
      btnRemover.textContent = 'Remover';
      btnRemover.addEventListener('click', (e) => {
        e.stopPropagation();
        alunoSelecionado = aluno.email;
        colSelecionado = col;
        modalConfirm.show();
      });
      buttonContainer.appendChild(btnRemover);
    }

    const link = document.createElement('a');
    link.href = '_orientando/painel.html';
    link.className = 'btn btn-primary flex-fill';
    link.textContent = 'Acessar';
    link.addEventListener('click', () => {
      localStorage.setItem('orientando', aluno.email);
      localStorage.setItem('parceiro', aluno.parceiro);
      if (tipoOrientacao.includes('Coorientando')) {
        localStorage.setItem('isCoorientando', 'true');
      } else {
        localStorage.removeItem('isCoorientando');
      }
    });
    buttonContainer.appendChild(link);

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(buttonContainer);
    card.appendChild(body);
    col.appendChild(card);
    secaoAlunos.appendChild(col);
  }

  function criarCardIndividual(aluno, tipoOrientacao = 'Orientando', isProvisorio = false) {
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

    if (badgeContainer.childElementCount > 0) card.appendChild(badgeContainer);

    const body = document.createElement('div');
    body.className = 'card-body d-flex flex-column justify-content-between';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = aluno.nome.trim().split(/\s+/)[0];

    const text = document.createElement('p');
    text.className = 'card-text text-muted';
    text.textContent = 'Acompanhe o progresso de ' + aluno.nome + '.';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'd-flex gap-2 mt-3';

    if (isProvisorio || tipoOrientacao.includes('provisório')) {
      const btnRemover = document.createElement('button');
      btnRemover.className = 'btn btn-danger flex-fill';
      btnRemover.textContent = 'Remover';
      btnRemover.addEventListener('click', (e) => {
        e.stopPropagation();
        alunoSelecionado = aluno.email;
        colSelecionado = col;
        modalConfirm.show();
      });
      buttonContainer.appendChild(btnRemover);
    }

    const link = document.createElement('a');
    link.href = '_orientando/painel.html';
    link.className = 'btn btn-primary flex-fill';
    link.textContent = 'Acessar';
    buttonContainer.appendChild(link);

    body.appendChild(title);
    body.appendChild(text);
    body.appendChild(buttonContainer);
    card.appendChild(body);
    col.appendChild(card);
    secaoAlunos.appendChild(col);

    card.addEventListener('click', () => {
      localStorage.setItem('orientando', aluno.email);
      if (tipoOrientacao.includes('Coorientando')) {
        localStorage.setItem('isCoorientando', 'true');
      } else {
        localStorage.removeItem('isCoorientando');
      }
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
      alunos.forEach((aluno) => criarCardAluno(aluno, t.tipo, t.provisorio));
    }

    if (!secaoAlunos.querySelector('.col')) criarCardPlaceholder(secaoAlunos, 'aluno');
  } catch (err) {
    console.error(err);
    criarCardPlaceholder(secaoAlunos, 'aluno');
  }

  const modalHTML = `
    <div class="modal fade" id="modalConfirmRemover" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">Tem certeza de que deseja remover o aluno?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-danger" id="confirmRemove">Sim</button>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmRemover'));

  document.getElementById('confirmRemove').addEventListener('click', async () => {
    modalConfirm.hide();
    if (!alunoSelecionado || !colSelecionado) return;
    const emailParceiro = alunoSelecionado.parceiro;

    try {
      const urlOri = `/professores/remover-orientando/${encodeURIComponent(alunoSelecionado)}`;
      const resOri = await fetch(urlOri, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!resOri.ok) {
        const text = await resOri.text();
        const erroData = text ? JSON.parse(text) : {};
        throw new Error(erroData.message || 'Erro ao remover aluno.');
      }
      colSelecionado.remove();
      alunoSelecionado = null;
      colSelecionado = null;
      if (!secaoAlunos.querySelector('.col')) criarCardPlaceholder(secaoAlunos, 'aluno');
    } catch (err) {
      console.error(err);
    }
  });

  async function carregarBancas(email) {
    try {
      const response = await fetch('/bancas');
      if (!response.ok) throw new Error('Erro ao carregar bancas');

      const bancas = await response.json();
      const bancasDoUsuario = bancas.filter(
        (banca) =>
          banca.emailAvaliador === email ||
          banca.emailProfTcc1 === email ||
          banca.emailOrientador === email
      );

      for (const banca of bancasDoUsuario) {
        if (banca.emailAluno2) {
          let nome1 = banca.emailAluno1;
          let nome2 = banca.emailAluno2;

          try {
            const [r1, r2] = await Promise.all([
              fetch(`/alunos/${encodeURIComponent(banca.emailAluno1)}`),
              fetch(`/alunos/${encodeURIComponent(banca.emailAluno2)}`),
            ]);
            if (r1.ok) nome1 = (await r1.json()).nome || nome1;
            if (r2.ok) nome2 = (await r2.json()).nome || nome2;
          } catch (err) {
            console.warn('Erro ao buscar nomes dos alunos da dupla:', err);
          }

          const col = document.createElement('div');
          col.className = 'col';
          col.style.display = 'block';

          const card = document.createElement('div');
          card.className = 'card h-100 shadow-sm position-relative';

          const body = document.createElement('div');
          body.className = 'card-body d-flex flex-column justify-content-between';

          const title = document.createElement('h5');
          title.className = 'card-title';
          title.textContent = 'Banca de avaliação';

          const text = document.createElement('p');
          text.className = 'card-text text-muted';
          text.textContent = `Acesse informações sobre a banca dos alunos ${nome1} e ${nome2}.`;

          const link = document.createElement('a');
          link.href = banca.curso === 'BCC' ? './avaliacao-bcc.html' : './avaliacao-sis.html';
          link.className = 'btn btn-primary mt-3';
          link.textContent = 'Acessar';
          link.addEventListener('click', () => {
            localStorage.setItem('avaliando', banca.emailAluno1);
            localStorage.setItem('avaliandoParceiro', banca.emailAluno2);
          });

          body.appendChild(title);
          body.appendChild(text);
          body.appendChild(link);
          card.appendChild(body);
          col.appendChild(card);
          secaoBancas.appendChild(col);
        } else {
          let nome = banca.emailAluno1;
          try {
            const res = await fetch(`/alunos/${encodeURIComponent(banca.emailAluno1)}`);
            if (res.ok) nome = (await res.json()).nome || nome;
          } catch (err) {
            console.warn('Erro ao buscar nome do aluno:', err);
          }

          const col = document.createElement('div');
          col.className = 'col';
          col.style.display = 'block';

          const card = document.createElement('div');
          card.className = 'card h-100 shadow-sm position-relative';

          const body = document.createElement('div');
          body.className = 'card-body d-flex flex-column justify-content-between';

          const title = document.createElement('h5');
          title.className = 'card-title';
          title.textContent = 'Banca de avaliação';

          const text = document.createElement('p');
          text.className = 'card-text text-muted';
          text.textContent = `Acesse informações sobre a banca do aluno ${nome}.`;

          const link = document.createElement('a');
          link.href = banca.curso === 'BCC' ? './avaliacao-bcc.html' : './avaliacao-sis.html';
          link.className = 'btn btn-primary mt-3';
          link.textContent = 'Acessar';
          link.addEventListener('click', () => {
            localStorage.setItem('avaliando', banca.emailAluno1);
            localStorage.removeItem('avaliandoParceiro');
          });

          body.appendChild(title);
          body.appendChild(text);
          body.appendChild(link);
          card.appendChild(body);
          col.appendChild(card);
          secaoBancas.appendChild(col);
        }
      }

      if (!secaoBancas.querySelector('.col')) criarCardPlaceholder(secaoBancas, 'banca');
    } catch (err) {
      console.error('Erro ao carregar bancas:', err);
      criarCardPlaceholder(secaoBancas, 'banca');
    }
  }

  carregarBancas(email);
});
