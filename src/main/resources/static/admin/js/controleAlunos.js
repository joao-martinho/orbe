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
    fetch('/alunos')
      .then(response => response.json())
      .then(data => {
        tabela.innerHTML = '';
        data.forEach(aluno => {
          const fileira = tabela.insertRow();
          fileira.innerHTML = `
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
      .catch(erro => console.error('Erro ao carregar dados: ', erro));
  }

  carregarAlunos();

  formularioCadastro.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validarFormulario(formularioCadastro)) return;

    const dados = {
      nome: formularioCadastro.querySelector('#nome').value.trim(),
      email: formularioCadastro.querySelector('#email').value.trim(),
      curso: formularioCadastro.querySelector('input[name="curso"]:checked')?.value
    };

    fetch('/alunos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao cadastrar');
        return res.json();
      })
      .then(() => {
        carregarAlunos();
        formularioCadastro.reset();
        formularioCadastro.classList.remove('was-validated');
        formularioCadastro.querySelectorAll('input').forEach(input => input.classList.remove('is-invalid'));
      })
      .catch(err => console.error(err));
  });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-editar')) {
      const fileira = e.target.closest('tr');
      const email = fileira.cells[0].textContent;
      const nome = fileira.cells[1].textContent;
      const curso = fileira.cells[2].textContent;

      formularioEdicao.querySelector('#editarEmail').value = email;
      formularioEdicao.querySelector('#editarNome').value = nome;
      formularioEdicao.querySelector(`input[name="editarCurso"][value="${curso}"]`).checked = true;

      formularioEdicao.classList.remove('was-validated');
      formularioEdicao.querySelectorAll('input').forEach(input => input.classList.remove('is-invalid'));
      modalAluno.show();
    }

    if (e.target.classList.contains('btn-deletar')) {
      emailParaDeletar = e.target.dataset.email;
      modalConfirm.show();
    }
  });

  modalConfirmEl.addEventListener('shown.bs.modal', () => {
    const btnConfirmDelete = document.getElementById('confirmDelete');
    btnConfirmDelete.onclick = function () {
      if (!emailParaDeletar) return;
      fetch(`/alunos/${emailParaDeletar}`, { method: 'DELETE' })
        .then(() => {
          carregarAlunos();
          emailParaDeletar = null;
          modalConfirm.hide();
        })
        .catch(err => console.error(err));
    };
  });
});
