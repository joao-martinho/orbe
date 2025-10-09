document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'aluno') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const selectOrientador = document.getElementById('orientador');
  const selectCoorientador = document.getElementById('coorientador');
  const checkCoorientador = document.getElementById('checkCoorientador');
  const coorientadorContainer = document.getElementById('coorientadorContainer');

  const form = document.getElementById('formOrientador');
  const mensagem = document.getElementById('mensagem');
  const visualizacao = document.getElementById('visualizacao');
  const viewOrientador = document.getElementById('viewOrientador');
  const viewCoorientador = document.getElementById('viewCoorientador');
  const viewCoorientadorWrapper = document.getElementById('viewCoorientadorWrapper');
  const btnRemover = document.getElementById('btnRemoverOrientador');

  let orientadorEmail = null;
  let coorientadorEmail = null;
  const alunoEmail = localStorage.getItem('email');
  if (!alunoEmail) {
    mensagem.innerHTML = '<div class="alert alert-danger">Usuário não autenticado. Faça login novamente.</div>';
    return;
  }

  coorientadorContainer.style.maxHeight = '0';
  coorientadorContainer.style.overflow = 'hidden';
  coorientadorContainer.style.transition = 'max-height 0.5s ease, opacity 0.5s ease';
  coorientadorContainer.style.opacity = '0';

  checkCoorientador.addEventListener('change', () => {
    if (checkCoorientador.checked) {
      coorientadorContainer.style.display = 'block';
      requestAnimationFrame(() => {
        coorientadorContainer.style.maxHeight = coorientadorContainer.scrollHeight + 'px';
        coorientadorContainer.style.opacity = '1';
      });
    } else {
      coorientadorContainer.style.maxHeight = '0';
      coorientadorContainer.style.opacity = '0';
      setTimeout(() => {
        if (!checkCoorientador.checked) {
          coorientadorContainer.style.display = 'none';
          selectCoorientador.value = '';
        }
      }, 500);
    }
  });

  fetch('/professores')
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar lista de professores.');
      return response.json();
    })
    .then(professores => {
      professores.forEach(prof => {
        const option1 = document.createElement('option');
        option1.value = prof.email;
        option1.textContent = prof.nome;
        selectOrientador.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = prof.email;
        option2.textContent = prof.nome;
        selectCoorientador.appendChild(option2);
      });
      return fetch(`/alunos/${encodeURIComponent(alunoEmail)}`);
    })
    .then(responseAluno => {
      if (!responseAluno.ok) throw new Error('Erro ao carregar dados do aluno.');
      return responseAluno.json();
    })
    .then(aluno => {
      if (aluno.orientador) {
        alert('Você não tem permissão para acessar esta página :(');
        localStorage.clear();
        window.location.href = '../login.html';
        return;
      }

      if (aluno.orientadorProvisorio) {
        orientadorEmail = aluno.orientadorProvisorio;
        visualizacao.style.display = 'block';
        const option = Array.from(selectOrientador.options).find(opt => opt.value === orientadorEmail);
        viewOrientador.textContent = option ? option.textContent : orientadorEmail;
        selectOrientador.value = orientadorEmail;

        selectOrientador.disabled = true;
        form.querySelector('button[type="submit"]').disabled = true;
        checkCoorientador.disabled = true;
        selectCoorientador.disabled = true;
      }
      if (aluno.coorientadorProvisorio) {
        coorientadorEmail = aluno.coorientadorProvisorio;
        const option = Array.from(selectCoorientador.options).find(opt => opt.value === coorientadorEmail);
        viewCoorientador.textContent = option ? option.textContent : coorientadorEmail;
        viewCoorientadorWrapper.style.display = 'block';
        selectCoorientador.value = coorientadorEmail;

        checkCoorientador.checked = true;
        coorientadorContainer.style.display = 'block';
        coorientadorContainer.style.maxHeight = coorientadorContainer.scrollHeight + 'px';
        coorientadorContainer.style.opacity = '1';
        checkCoorientador.disabled = true;
        selectCoorientador.disabled = true;
      }
    })
    .catch(err => {
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const orientadorEmailSelecionado = selectOrientador.value;
    const coorientadorEmailSelecionado = checkCoorientador.checked ? selectCoorientador.value : null;

    if (!orientadorEmailSelecionado) {
      mensagem.innerHTML = '<div class="alert alert-warning">Por favor, selecione um orientador.</div>';
      visualizacao.style.display = 'none';
      return;
    }

    if (coorientadorEmailSelecionado && coorientadorEmailSelecionado === orientadorEmailSelecionado) {
      mensagem.innerHTML = '<div class="alert alert-warning">O coorientador não pode ser o mesmo que o orientador.</div>';
      return;
    }

    mensagem.innerHTML = '';

    try {
      const response = await fetch(`/alunos/${encodeURIComponent(alunoEmail)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orientadorProvisorio: orientadorEmailSelecionado,
          coorientadorProvisorio: coorientadorEmailSelecionado
        })
      });

      if (!response.ok) {
        const erroData = await response.json();
        throw new Error(erroData.message || 'Erro ao salvar orientador.');
      }

      orientadorEmail = orientadorEmailSelecionado;
      coorientadorEmail = coorientadorEmailSelecionado;

      viewOrientador.textContent = selectOrientador.options[selectOrientador.selectedIndex].textContent;
      visualizacao.style.display = 'block';
      selectOrientador.value = orientadorEmailSelecionado;

      if (coorientadorEmail) {
        const option = Array.from(selectCoorientador.options).find(opt => opt.value === coorientadorEmail);
        viewCoorientador.textContent = option ? option.textContent : coorientadorEmail;
        viewCoorientadorWrapper.style.display = 'block';
        selectCoorientador.value = coorientadorEmail;
      } else {
        viewCoorientadorWrapper.style.display = 'none';
      }

      mensagem.innerHTML = '<div class="alert alert-success">Orientador salvo com sucesso.</div>';
      selectOrientador.disabled = true;
      form.querySelector('button[type="submit"]').disabled = true;
      checkCoorientador.disabled = true;
      selectCoorientador.disabled = true;

    } catch (error) {
      mensagem.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
      visualizacao.style.display = 'none';
    }
  });

  const modalHTML = `
    <div class="modal fade" id="modalConfirmRemover" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja remover o orientador provisório?
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

  btnRemover?.addEventListener('click', () => {
    if (!orientadorEmail) {
      mensagem.innerHTML = '<div class="alert alert-warning">Nenhum orientador para remover.</div>';
      return;
    }
    modalConfirm.show();
  });

  document.getElementById('confirmRemove').addEventListener('click', async () => {
    modalConfirm.hide();
    mensagem.innerHTML = '';

    try {
      const urlOri = `/alunos/remover-provisorio/${encodeURIComponent(alunoEmail)}/${encodeURIComponent(orientadorEmail)}`;
      const resOri = await fetch(urlOri, { method: 'PATCH' });

      if (!resOri.ok && resOri.status !== 403) {
        throw new Error('Erro ao remover orientador.');
      }

      if (coorientadorEmail) {
        const urlCoor = `/alunos/remover-provisorio/${encodeURIComponent(alunoEmail)}/${encodeURIComponent(coorientadorEmail)}`;
        const resCoor = await fetch(urlCoor, { method: 'PATCH' });

        if (!resCoor.ok && resCoor.status !== 403) {
          throw new Error('Erro ao remover coorientador.');
        }
      }

      mensagem.innerHTML = '<div class="alert alert-success">Orientadores removidos com sucesso.</div>';
      visualizacao.style.display = 'none';

      orientadorEmail = null;
      coorientadorEmail = null;

      selectOrientador.disabled = false;
      selectOrientador.value = "";
      selectCoorientador.disabled = false;
      selectCoorientador.value = "";
      checkCoorientador.disabled = false;
      checkCoorientador.checked = false;

      coorientadorContainer.style.maxHeight = '0';
      coorientadorContainer.style.opacity = '0';
      setTimeout(() => {
        if (!checkCoorientador.checked) coorientadorContainer.style.display = 'none';
      }, 500);

      viewCoorientadorWrapper.style.display = 'none';
      form.querySelector('button[type="submit"]').disabled = false;

    } catch (err) {
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  });

});
