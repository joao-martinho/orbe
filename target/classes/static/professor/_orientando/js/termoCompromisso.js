document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const email = localStorage.getItem('email');
  if (tipo !== 'professor' || !email) {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      localStorage.removeItem('orientando');
      window.location.href = '../../login.html';
    });
  }

  const emailAluno1 = localStorage.getItem('orientando');
  const emailUsuario = localStorage.getItem('email');
  const elEmailAluno1 = document.getElementById('textEmailAluno1');
  const elEmailAluno2 = document.getElementById('textEmailAluno2');
  const emailAluno2Container = document.getElementById('emailAluno2Container');
  const elTelefoneAluno1 = document.getElementById('textTelefoneAluno1');
  const elTelefoneAluno2 = document.getElementById('textTelefoneAluno2');
  const telefoneAluno2Container = document.getElementById('telefoneAluno2Container');
  const elCurso = document.getElementById('textCurso');
  const elTitulo = document.getElementById('textTitulo');
  const elResumo = document.getElementById('textResumo');
  const elOrientador = document.getElementById('textOrientador');
  const elCoorientador = document.getElementById('textCoorientador');
  const elPerfilCoorientador = document.getElementById('textPerfilCoorientador');
  const elData = document.getElementById('textData');
  const elStatus = document.getElementById('textStatus');
  const comentarioContainer = document.getElementById('comentario');
  const btnAprovar = document.getElementById('btnAprovar');
  const btnDevolver = document.getElementById('btnDevolver');

  let termo = {};
  let acaoAtual = null;

  termo = new Proxy(termo, {
    set(target, prop, value) {
      target[prop] = value;
      if (['statusOrientador', 'statusCoorientador', 'statusProfessorTcc1'].includes(prop)) {
        atualizarBotoes();
      }
      return true;
    }
  });

  function formatarData(isoString) {
    const dt = new Date(isoString);
    return dt.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function atualizarBadgeStatus(status) {
    const s = (status || 'pendente').toLowerCase();
    let badgeClass = 'bg-secondary';
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

    if (elStatus) elStatus.innerHTML = `<span class="badge ${badgeClass}">${texto}</span>`;
  }

  async function buscarNomeProfessor(email) {
    if (!email) return '—';
    try {
      const res = await fetch(`/professores/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Erro ao buscar professor');
      const dados = await res.json();
      return dados.nome || '—';
    } catch {
      return '—';
    }
  }

  async function buscarTermo(email) {
    try {
      const res = await fetch(`/termos/aluno/${encodeURIComponent(email)}?t=${Date.now()}`);
      if (!res.ok) throw new Error('Erro ao buscar termo');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function atualizarTermo(id, dados) {
    try {
      const res = await fetch(`/termos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) throw new Error('Erro ao atualizar termo');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function povoarCampos(t) {
    if (!t) return;

    if (elEmailAluno1) elEmailAluno1.textContent = t.emailAluno || '—';
    if (elTelefoneAluno1) elTelefoneAluno1.textContent = t.telefoneAluno || '—';

    emailAluno2Container.style.display = 'block';
    telefoneAluno2Container.style.display = 'block';
    elEmailAluno2.textContent = t.emailParceiro || '—';

    try {
      if (t.emailParceiro) {
        const resParceiro = await fetch(`/alunos/${encodeURIComponent(t.emailParceiro)}`);
        if (resParceiro.ok) {
          const dadosParceiro = await resParceiro.json();
          elTelefoneAluno2.textContent = dadosParceiro.telefone || '—';
        } else {
          elTelefoneAluno2.textContent = '—';
        }
      } else {
        elTelefoneAluno2.textContent = '—';
      }
    } catch {
      elTelefoneAluno2.textContent = '—';
    }

    elCurso.textContent = t.cursoAluno || '—';
    elTitulo.textContent = t.titulo || '—';
    elResumo.textContent = t.resumo || '—';
    elOrientador.textContent = await buscarNomeProfessor(t.emailOrientador);
    elCoorientador.textContent = await buscarNomeProfessor(t.emailCoorientador);
    elPerfilCoorientador.textContent = t.perfilCoorientador || '—';
    elData.textContent = t.criadoEm ? formatarData(t.criadoEm) : '—';
    comentarioContainer.value = t.comentario || '';

    atualizarBadgeStatus(t.statusProfessorTcc1 || 'pendente');
    Object.assign(termo, t);
  }

  function atualizarBotoes() {
    if (!btnAprovar && !btnDevolver) return;

    const comentarioTextarea = comentarioContainer;
    if (!termo) {
      btnAprovar.disabled = true;
      btnDevolver.disabled = true;
      comentarioTextarea.readOnly = true;
      return;
    }

    let finalizado = false;
    const email = emailUsuario.toLowerCase();
    const statusOrientador = termo.statusOrientador?.toLowerCase() || '';
    const statusCoorientador = termo.statusCoorientador?.toLowerCase() || '';

    if (email === (termo.emailOrientador || '').toLowerCase()) {
      finalizado = statusOrientador !== 'pendente';
    } else if (email === (termo.emailCoorientador || '').toLowerCase()) {
      finalizado = statusOrientador !== 'aprovado' || statusCoorientador !== 'pendente';
    }

    btnAprovar.disabled = finalizado;
    btnDevolver.disabled = finalizado;
    comentarioTextarea.readOnly = finalizado;
  }

  async function aprovar() {
    if (!termo) return;
    const comentario = comentarioContainer.value.trim() || '';
    const { statusOrientador, statusCoorientador } = termo;

    if (emailUsuario.toLowerCase() === termo.emailOrientador?.toLowerCase() && statusOrientador === 'pendente') {
      const payload = termo.emailCoorientador
        ? { statusOrientador: 'aprovado', comentario }
        : { statusOrientador: 'aprovado', statusCoorientador: 'aprovado', comentario };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
    } else if (emailUsuario.toLowerCase() === termo.emailCoorientador?.toLowerCase() &&
               statusOrientador === 'aprovado' && statusCoorientador === 'pendente') {
      await atualizarTermo(termo.id, { statusCoorientador: 'aprovado', comentario });
      await refreshTermo();
    }
  }

  async function devolver() {
    if (!termo) return;
    const comentario = comentarioContainer.value.trim() || '';
    const { statusOrientador, statusCoorientador } = termo;

    if (emailUsuario.toLowerCase() === termo.emailOrientador?.toLowerCase() && statusOrientador === 'pendente') {
      const payload = {
        statusOrientador: 'devolvido',
        statusCoorientador: 'devolvido',
        statusProfessorTcc1: 'devolvido',
        statusFinal: 'devolvido',
        comentario,
      };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
    } else if (emailUsuario.toLowerCase() === termo.emailCoorientador?.toLowerCase() &&
               statusOrientador === 'aprovado' && statusCoorientador === 'pendente') {
      const payload = {
        statusCoorientador: 'devolvido',
        statusProfessorTcc1: 'devolvido',
        statusFinal: 'devolvido',
        comentario,
      };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
    }
  }

  async function refreshTermo() {
    const t = await buscarTermo(emailAluno1);
    if (t) await povoarCampos(t);
  }

  // Modal
  const modalHTML = `
    <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-primary" id="confirmModalSim">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalEl = document.getElementById('confirmModal');
  const modalInstance = new bootstrap.Modal(modalEl);

  function mostrarModalConfirmacao(acao) {
    acaoAtual = acao;
    const modalBody = modalEl.querySelector('.modal-body');
    modalBody.textContent = `Tem certeza de que deseja ${acao === 'aprovar' ? 'aprovar' : 'devolver'} este termo de compromisso?`;
    modalInstance.show();
  }

  const btnConfirmar = document.getElementById('confirmModalSim');
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
      modalInstance.hide();
      if (acaoAtual === 'aprovar') await aprovar();
      else if (acaoAtual === 'devolver') await devolver();
      acaoAtual = null;
    });
  }

  if (btnAprovar) btnAprovar.addEventListener('click', () => mostrarModalConfirmacao('aprovar'));
  if (btnDevolver) btnDevolver.addEventListener('click', () => mostrarModalConfirmacao('devolver'));

  const t = await buscarTermo(emailAluno1);
  if (t) await povoarCampos(t);
});
