document.addEventListener('DOMContentLoaded', () => {
  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  verificarAcesso();

  async function verificarAcesso() {
    const tipo = localStorage.getItem('tipo');
    const emailAluno = localStorage.getItem('email');

    if (tipo !== 'aluno' || !emailAluno) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return;
    }
  }

  const selectOrientador = document.getElementById('orientador');
  const selectCoorientador = document.getElementById('coorientador');
  const selectParceiro = document.getElementById('parceiro');
  const checkCoorientador = document.getElementById('checkCoorientador');
  const checkParceiro = document.getElementById('checkParceiro');
  const coorientadorContainer = document.getElementById('coorientadorContainer');
  const parceiroContainer = document.getElementById('parceiroContainer');
  const parceiroCheckContainer = document.getElementById('parceiroCheckContainer');

  const form = document.getElementById('formOrientador');
  const mensagem = document.getElementById('mensagem');
  const visualizacao = document.getElementById('visualizacao');
  const viewOrientador = document.getElementById('viewOrientador');
  const viewCoorientador = document.getElementById('viewCoorientador');
  const viewCoorientadorWrapper = document.getElementById('viewCoorientadorWrapper');
  const viewParceiro = document.getElementById('viewParceiro');
  const viewParceiroWrapper = document.getElementById('viewParceiroWrapper');
  const btnRemover = document.getElementById('btnRemoverOrientador');

  let orientadorEmail = null;
  let coorientadorEmail = null;
  let parceiroEmail = null;
  const alunoEmail = localStorage.getItem('email');
  if (!alunoEmail) {
    return;
  }

  coorientadorContainer.style.maxHeight = '0';
  coorientadorContainer.style.overflow = 'hidden';
  coorientadorContainer.style.transition = 'max-height 0.5s ease, opacity 0.5s ease';
  coorientadorContainer.style.opacity = '0';

  parceiroContainer.style.maxHeight = '0';
  parceiroContainer.style.overflow = 'hidden';
  parceiroContainer.style.transition = 'max-height 0.5s ease, opacity 0.5s ease';
  parceiroContainer.style.opacity = '0';

  checkCoorientador.addEventListener('change', () => {
    if (checkCoorientador.checked) {
      coorientadorContainer.style.display = 'block';
      selectCoorientador.required = true;
      requestAnimationFrame(() => {
        coorientadorContainer.style.maxHeight = coorientadorContainer.scrollHeight + 'px';
        coorientadorContainer.style.opacity = '1';
      });
    } else {
      coorientadorContainer.style.maxHeight = '0';
      coorientadorContainer.style.opacity = '0';
      selectCoorientador.required = false;
      setTimeout(() => {
        if (!checkCoorientador.checked) {
          coorientadorContainer.style.display = 'none';
          selectCoorientador.value = '';
        }
      }, 500);
    }
  });

  checkParceiro.addEventListener('change', () => {
    if (checkParceiro.checked) {
      parceiroContainer.style.display = 'block';
      selectParceiro.required = true;
      requestAnimationFrame(() => {
        parceiroContainer.style.maxHeight = parceiroContainer.scrollHeight + 'px';
        parceiroContainer.style.opacity = '1';
      });
    } else {
      parceiroContainer.style.maxHeight = '0';
      parceiroContainer.style.opacity = '0';
      selectParceiro.required = false;
      setTimeout(() => {
        if (!checkParceiro.checked) {
          parceiroContainer.style.display = 'none';
          selectParceiro.value = '';
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

      function atualizarListas() {
        const orientadorSelecionado = selectOrientador.value;
        const coorientadorSelecionado = selectCoorientador.value;

        Array.from(selectOrientador.options).forEach(opt => {
          opt.hidden = coorientadorSelecionado && opt.value === coorientadorSelecionado;
        });

        Array.from(selectCoorientador.options).forEach(opt => {
          opt.hidden = orientadorSelecionado && opt.value === orientadorSelecionado;
        });
      }

      selectOrientador.addEventListener('change', atualizarListas);
      selectCoorientador.addEventListener('change', atualizarListas);

      atualizarListas();

      return fetch(`/alunos/${encodeURIComponent(alunoEmail)}`);
    })
    .then(responseAluno => {
      if (!responseAluno.ok) throw new Error('Erro ao carregar dados do aluno.');
      return responseAluno.json();
    })
    .then(aluno => {
      if (aluno.curso === 'SIS') {
        parceiroCheckContainer.style.display = 'block';
        
        return fetch('/alunos')
          .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar lista de alunos.');
            return response.json();
          })
          .then(alunos => {
            const alunosSIS = alunos.filter(a => a.curso === 'SIS' && a.email !== alunoEmail);
            
            alunosSIS.forEach(alunoSIS => {
              const option = document.createElement('option');
              option.value = alunoSIS.email;
              option.textContent = alunoSIS.nome;
              selectParceiro.appendChild(option);
            });
            
            return aluno;
          });
      }
      
      return Promise.resolve(aluno);
    })
    .then(aluno => {
      btnRemover.disabled = aluno.orientador !== null;

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

      if (aluno.parceiro) {
        parceiroEmail = aluno.parceiro;
        const parceiroOption = Array.from(selectParceiro.options).find(opt => opt.value === aluno.parceiro);
        if (parceiroOption) {
          viewParceiro.textContent = parceiroOption.textContent;
          viewParceiroWrapper.style.display = 'block';
          selectParceiro.value = aluno.parceiro;

          checkParceiro.checked = true;
          parceiroContainer.style.display = 'block';
          parceiroContainer.style.maxHeight = parceiroContainer.scrollHeight + 'px';
          parceiroContainer.style.opacity = '1';
          checkParceiro.disabled = true;
          selectParceiro.disabled = true;
        }
      }
    })
    .catch(err => {
      console.log(err);
    });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const orientadorEmailSelecionado = selectOrientador.value;
    const coorientadorEmailSelecionado = checkCoorientador.checked ? selectCoorientador.value : null;
    const parceiroEmailSelecionado = checkParceiro.checked ? selectParceiro.value : null;

    if (!orientadorEmailSelecionado) {
      visualizacao.style.display = 'none';
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

      if (parceiroEmailSelecionado) {
        const parceiroResponse = await fetch(`/alunos/atribuir-parceiro/${encodeURIComponent(alunoEmail)}/${encodeURIComponent(parceiroEmailSelecionado)}`, {
          method: 'PATCH'
        });

        if (!parceiroResponse.ok) {
          throw new Error('Erro ao atribuir parceiro.');
        }

        const parceiroOrientadorResponse = await fetch(`/alunos/${encodeURIComponent(parceiroEmailSelecionado)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orientadorProvisorio: orientadorEmailSelecionado,
            coorientadorProvisorio: coorientadorEmailSelecionado
          })
        });

        if (!parceiroOrientadorResponse.ok) {
          throw new Error('Erro ao atribuir orientador ao parceiro.');
        }
      }

      orientadorEmail = orientadorEmailSelecionado;
      coorientadorEmail = coorientadorEmailSelecionado;
      parceiroEmail = parceiroEmailSelecionado;

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

      if (parceiroEmailSelecionado) {
        const parceiroOption = Array.from(selectParceiro.options).find(opt => opt.value === parceiroEmailSelecionado);
        viewParceiro.textContent = parceiroOption ? parceiroOption.textContent : parceiroEmailSelecionado;
        viewParceiroWrapper.style.display = 'block';
        selectParceiro.value = parceiroEmailSelecionado;
      } else {
        viewParceiroWrapper.style.display = 'none';
      }

      mensagem.innerHTML = '<div class="alert alert-success">Orientador atribuído com sucesso.</div>';
      selectOrientador.disabled = true;
      form.querySelector('button[type="submit"]').disabled = true;
      checkCoorientador.disabled = true;
      selectCoorientador.disabled = true;
      checkParceiro.disabled = true;
      selectParceiro.disabled = true;

    } catch (error) {
      console.log(error);
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
      return;
    }
    modalConfirm.show();
  });

  document.getElementById('confirmRemove').addEventListener('click', async () => {
    modalConfirm.hide();
    mensagem.innerHTML = '';

    try {
      const urlOri = `/alunos/remover-orientador/${encodeURIComponent(alunoEmail)}`;
      const resOri = await fetch(urlOri, { method: 'PATCH' });

      if (!resOri.ok && resOri.status !== 403) {
        throw new Error('Erro ao remover orientador.');
      }

      if (coorientadorEmail) {
        const urlCoor = `/alunos/remover-orientador/${encodeURIComponent(alunoEmail)}`;
        const resCoor = await fetch(urlCoor, { method: 'PATCH' });

        if (!resCoor.ok && resCoor.status !== 403) {
          throw new Error('Erro ao remover coorientador.');
        }
      }

      if (parceiroEmail) {
        const urlParceiroOri = `/alunos/remover-orientador/${encodeURIComponent(parceiroEmail)}`;
        const resParceiroOri = await fetch(urlParceiroOri, { method: 'PATCH' });

        if (!resParceiroOri.ok && resParceiroOri.status !== 403) {
          console.warn('Erro ao remover orientador do parceiro, mas continuando...');
        }
      }

      mensagem.innerHTML = '<div class="alert alert-success">Orientador removido com sucesso.</div>';
      visualizacao.style.display = 'none';

      orientadorEmail = null;
      coorientadorEmail = null;
      parceiroEmail = null;

      selectOrientador.disabled = false;
      selectOrientador.value = "";
      selectCoorientador.disabled = false;
      selectCoorientador.value = "";
      selectParceiro.disabled = false;
      selectParceiro.value = "";
      checkCoorientador.disabled = false;
      checkCoorientador.checked = false;
      checkParceiro.disabled = false;
      checkParceiro.checked = false;

      coorientadorContainer.style.maxHeight = '0';
      coorientadorContainer.style.opacity = '0';
      parceiroContainer.style.maxHeight = '0';
      parceiroContainer.style.opacity = '0';
      setTimeout(() => {
        if (!checkCoorientador.checked) coorientadorContainer.style.display = 'none';
        if (!checkParceiro.checked) parceiroContainer.style.display = 'none';
      }, 500);

      viewCoorientadorWrapper.style.display = 'none';
      viewParceiroWrapper.style.display = 'none';
      form.querySelector('button[type="submit"]').disabled = false;

    } catch (err) {
      console.log(err);
    }
  });
});
