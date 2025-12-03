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

  const tabela = document.querySelector('#tabelaProfessores tbody');
  const modalProfessorEl = document.getElementById('modalProfessor');
  const formularioEdicao = document.getElementById('formularioEdicaoProfessor');
  const formularioCadastro = document.getElementById('formularioProfessores');
  const modalProfessor = new bootstrap.Modal(modalProfessorEl);

  let emailParaDeletar = null;

  const modalHTML = `
    <div class="modal fade" id="modalConfirmDeleteProfessor" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja excluir este professor?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteProfessor">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalConfirmEl = document.getElementById('modalConfirmDeleteProfessor');
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

  function carregarProfessores() {
    fetch('/professores')
      .then(response => response.json())
      .then(data => {
        tabela.innerHTML = '';
        data.forEach(professor => {
          const fileira = tabela.insertRow();
          fileira.innerHTML = `
            <td>${professor.email}</td>
            <td>${professor.nome}</td>
            <td>
              <button class="btn btn-warning btn-editar" data-email="${professor.email}">Editar</button>
              <button class="btn btn-danger btn-deletar" data-email="${professor.email}">Excluir</button>
            </td>
          `;
        });
      })
      .catch(erro => console.error('Erro ao carregar dados: ', erro));
  }

  carregarProfessores();

  formularioCadastro.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validarFormulario(formularioCadastro)) return;

    const dados = {
      nome: formularioCadastro.querySelector('#nome').value.trim(),
      email: formularioCadastro.querySelector('#email').value.trim()
    };

    fetch('/professores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao cadastrar');
        return res.json();
      })
      .then(() => {
        carregarProfessores();
        formularioCadastro.reset();
        formularioCadastro.classList.remove('was-validated');
      })
      .catch(err => console.error(err));
  });

  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-editar')) {
      const fileira = e.target.closest('tr');
      const email = fileira.cells[0].textContent;
      const nome = fileira.cells[1].textContent;

      formularioEdicao.querySelector('#editarEmail').value = email;
      formularioEdicao.querySelector('#editarNome').value = nome;

      formularioEdicao.classList.remove('was-validated');
      formularioEdicao.querySelectorAll('input').forEach(i => i.classList.remove('is-invalid'));
      modalProfessor.show();
    }

    if (e.target.classList.contains('btn-deletar')) {
      emailParaDeletar = e.target.dataset.email;
      modalConfirm.show();
    }
  });

  modalConfirmEl.addEventListener('shown.bs.modal', () => {
    const btnConfirmDelete = document.getElementById('confirmDeleteProfessor');
    btnConfirmDelete.onclick = function () {
      if (!emailParaDeletar) return;
      fetch(`/professores/${emailParaDeletar}`, { method: 'DELETE' })
        .then(() => {
          carregarProfessores();
          emailParaDeletar = null;
          modalConfirm.hide();
        })
        .catch(err => console.error(err));
    };
  });

  formularioEdicao.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validarFormulario(formularioEdicao)) return;

    const email = formularioEdicao.querySelector('#editarEmail').value;
    const dados = { nome: formularioEdicao.querySelector('#editarNome').value.trim() };

    fetch(`/professores/${email}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao salvar');
        return res.json();
      })
      .then(() => {
        carregarProfessores();
        formularioEdicao.reset();
        formularioEdicao.classList.remove('was-validated');
        formularioEdicao.querySelectorAll('input').forEach(i => i.classList.remove('is-invalid'));
        modalProfessor.hide();
      })
      .catch(err => console.error(err));
  });

  modalProfessorEl.addEventListener('hidden.bs.modal', () => {
    formularioEdicao.reset();
    formularioEdicao.classList.remove('was-validated');
    formularioEdicao.querySelectorAll('input').forEach(i => i.classList.remove('is-invalid'));
  });
});
