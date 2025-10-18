document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
	const email = localStorage.getItem('email');
	if (tipo !== 'professor' || !localStorage.getItem('orientando') || !email) {
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

  const emailAluno = localStorage.getItem('orientando');
  const emailUsuario = localStorage.getItem('email');

  const elEmailAluno = document.getElementById('textEmailAluno');
  const elTelefoneAluno = document.getElementById('textTelefoneAluno');
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

  let termo = null;
  let acaoAtual = null;

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
    } catch (err) {
      console.error(err);
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
    if (elEmailAluno) elEmailAluno.textContent = t.emailAluno || '—';
    if (elTelefoneAluno) elTelefoneAluno.textContent = t.telefoneAluno || '—';
    if (elCurso) elCurso.textContent = t.cursoAluno || '—';
    if (elTitulo) elTitulo.textContent = t.titulo || '—';
    if (elResumo) elResumo.textContent = t.resumo || '—';
    if (elOrientador) elOrientador.textContent = await buscarNomeProfessor(t.emailOrientador);
    if (elCoorientador) elCoorientador.textContent = await buscarNomeProfessor(t.emailCoorientador);
    if (elPerfilCoorientador) elPerfilCoorientador.textContent = t.perfilCoorientador || '—';
    if (elData) elData.textContent = t.criadoEm ? formatarData(t.criadoEm) : '—';
    if (comentarioContainer) comentarioContainer.value = t.comentario || '';

    atualizarBadgeStatus(t.statusProfessorTcc1 || 'pendente');

    atualizarBotoes();
  }

  function atualizarBotoes() {
    if (!btnAprovar && !btnDevolver) return;

    const comentarioTextarea = comentarioContainer?.querySelector('textarea');
    if (!termo) {
      if (btnAprovar) btnAprovar.disabled = true;
      if (btnDevolver) btnDevolver.disabled = true;
      if (comentarioTextarea) comentarioTextarea.readOnly = true;
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

    if (btnAprovar) btnAprovar.disabled = finalizado;
    if (btnDevolver) btnDevolver.disabled = finalizado;
    if (comentarioTextarea) comentarioTextarea.readOnly = finalizado;
  }

  async function aprovar() {
    if (!termo) return;

    const comentario = comentarioContainer?.value.trim() || '';
    const statusOrientador = termo.statusOrientador?.toLowerCase();
    const statusCoorientador = termo.statusCoorientador?.toLowerCase();

    if (emailUsuario.toLowerCase() === (termo.emailOrientador || '').toLowerCase() && statusOrientador === 'pendente') {
      const payload = termo.emailCoorientador
        ? { statusOrientador: 'aprovado', comentario: comentario }
        : { statusOrientador: 'aprovado', statusCoorientador: 'aprovado', comentario: comentario };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
      return;
    }

    if (emailUsuario.toLowerCase() === (termo.emailCoorientador || '').toLowerCase() && statusOrientador === 'aprovado' && statusCoorientador === 'pendente') {
      await atualizarTermo(termo.id, { statusCoorientador: 'aprovado', comentario: comentario });
      await refreshTermo();
    }
  }

  async function devolver() {
    if (!termo) return;

    const comentario = comentarioContainer?.value.trim() || '';
    const statusOrientador = termo.statusOrientador?.toLowerCase();
    const statusCoorientador = termo.statusCoorientador?.toLowerCase();

    if (emailUsuario.toLowerCase() === (termo.emailOrientador || '').toLowerCase() && statusOrientador === 'pendente') {
      const payload = {
        statusOrientador: 'devolvido',
        statusCoorientador: 'devolvido',
        statusProfessorTcc1: 'devolvido',
        statusFinal: 'devolvido',
        comentario: comentario
      };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
      return;
    }

    if (emailUsuario.toLowerCase() === (termo.emailCoorientador || '').toLowerCase() && statusOrientador === 'aprovado' && statusCoorientador === 'pendente') {
      const payload = {
        statusCoorientador: 'devolvido',
        statusProfessorTcc1: 'devolvido',
        statusFinal: 'devolvido',
        comentario: comentario
      };
      await atualizarTermo(termo.id, payload);
      await refreshTermo();
    }
  }

  async function refreshTermo() {
    termo = await buscarTermo(emailAluno);
    if (termo) await povoarCampos(termo);
  }

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

  termo = await buscarTermo(emailAluno);
  if (termo) await povoarCampos(termo);
});
