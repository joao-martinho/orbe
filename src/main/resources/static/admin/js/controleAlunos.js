document.addEventListener('DOMContentLoaded', function () {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'admin') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const tabela = document.querySelector('#tabelaAlunos tbody');
  const modalAlunoEl = document.getElementById('modalAluno');
  const formularioEdicao = document.getElementById('formularioEdicaoAluno');
  const formularioCadastro = document.getElementById('formularioAlunos');
  const modalAluno = new bootstrap.Modal(modalAlunoEl);

  let emailParaDeletar = null;

  const modalHTML = `
    <div class="modal fade" id="modalConfirmDelete" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja excluir este aluno?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-danger" id="confirmDelete">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modalConfirmEl = document.getElementById('modalConfirmDelete');
  const modalConfirm = new bootstrap.Modal(modalConfirmEl);

  function aplicarValidacaoVisual(form) {
    form.classList.add('was-validated');
    const campos = form.querySelectorAll('input, select');
    campos.forEach(campo => {
      if (!campo.checkValidity()) campo.classList.add('is-invalid');
      else campo.classList.remove('is-invalid');
    });
  }

  function validarFormulario(form) {
    aplicarValidacaoVisual(form);
    return form.checkValidity();
  }

  function carregarAlunos() {
    fetch('http://localhost:8080/alunos')
      .then(r => r.json())
      .then(data => {
        tabela.innerHTML = '';
        data.forEach(aluno => {
          const row = tabela.insertRow();
          row.innerHTML = `
            <td>${aluno.email}</td>
            <td>${aluno.nome}</td>
            <td>${aluno.curso}</td>
            <td>
              <button class="btn btn-warning btn-editar" data-email="${aluno.email}">Editar</button>
              <button class="btn btn-danger btn-deletar" data-email="${aluno.email}">Excluir</button>
            </td>
          `;
        });
      })
      .catch(console.error);
  }

  carregarAlunos();

  formularioCadastro.addEventListener('submit', e => {
    e.preventDefault();
    if (!validarFormulario(formularioCadastro)) return;
    const dados = {
      nome: formularioCadastro.querySelector('#nome').value.trim(),
      email: formularioCadastro.querySelector('#email').value.trim(),
      curso: formularioCadastro.querySelector('input[name="curso"]:checked')?.value
    };
    fetch('http://localhost:8080/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(r => {
        if (!r.ok) throw new Error('Erro ao cadastrar');
        return r.json();
      })
      .then(() => {
        carregarAlunos();
        formularioCadastro.reset();
        formularioCadastro.classList.remove('was-validated');
        formularioCadastro.querySelectorAll('input').forEach(i => i.classList.remove('is-invalid'));
      })
      .catch(console.error);
  });

  formularioEdicao.addEventListener('submit', e => {
    e.preventDefault();
    if (!validarFormulario(formularioEdicao)) return;
    const email = formularioEdicao.querySelector('#editarEmail').value;
    const dados = {
      nome: formularioEdicao.querySelector('#editarNome').value.trim(),
      curso: formularioEdicao.querySelector('input[name="curso"]:checked')?.value
    };
    fetch(`http://localhost:8080/alunos/${email}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(r => {
        if (!r.ok) throw new Error('Erro ao atualizar');
        return r.json();
      })
      .then(() => {
        modalAluno.hide();
        carregarAlunos();
      })
      .catch(console.error);
  });

  document.addEventListener('click', e => {
    const btnEditar = e.target.closest('.btn-editar');
    const btnDeletar = e.target.closest('.btn-deletar');
    if (btnEditar) {
      const tr = btnEditar.closest('tr');
      const email = tr.cells[0].textContent;
      const nome = tr.cells[1].textContent;
      const curso = tr.cells[2].textContent;
      formularioEdicao.querySelector('#editarEmail').value = email;
      formularioEdicao.querySelector('#editarNome').value = nome;
      formularioEdicao.querySelector(`input[name="curso"][value="${curso}"]`).checked = true;
      formularioEdicao.classList.remove('was-validated');
      formularioEdicao.querySelectorAll('input').forEach(i => i.classList.remove('is-invalid'));
      modalAluno.show();
    }
    if (btnDeletar) {
      emailParaDeletar = btnDeletar.dataset.email;
      modalConfirm.show();
    }
  });

  modalConfirmEl.addEventListener('shown.bs.modal', () => {
    const btnConfirm = document.getElementById('confirmDelete');
    btnConfirm.onclick = function () {
      if (!emailParaDeletar) return;
      fetch(`http://localhost:8080/alunos/${emailParaDeletar}`, { method: 'DELETE' })
        .then(() => {
          carregarAlunos();
          emailParaDeletar = null;
          modalConfirm.hide();
        })
        .catch(console.error);
    };
  });
});
