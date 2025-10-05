document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');
  const mensagem = document.getElementById('mensagem');
  const formulario = document.getElementById('formularioEntrega');
  const selectAluno = document.getElementById('orientador');

  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  async function carregarAlunos() {
    try {
      const response = await fetch('/alunos');
      if (!response.ok) throw new Error('Erro ao carregar alunos');
      const alunos = await response.json();
      alunos.forEach(aluno => {
        const option = document.createElement('option');
        option.value = aluno.email;
        option.textContent = aluno.email;
        selectAluno.appendChild(option);
      });
    } catch (error) {
      console.error(error);
      mensagem.innerHTML = `<div class="alert alert-danger">Não foi possível carregar a lista de alunos.</div>`;
    }
  }

  async function carregarEntregas() {
    try {
      const emailAutor = localStorage.getItem('email');
      const response = await fetch(`/documentos/${emailAutor}`);
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      const documentos = await response.json();
      tabelaBody.innerHTML = '';
      documentos.forEach(doc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${doc.titulo}</td>
          <td>${new Date(doc.criadoEm).toLocaleString()}</td>
          <td>
            <a href="/download/${doc.id}" class="btn btn-sm btn-primary">Baixar</a>
          </td>
        `;
        tabelaBody.appendChild(tr);
      });
    } catch (error) {
      console.error(error);
      mensagem.innerHTML = `<div class="alert alert-warning">Não foi possível carregar as entregas.</div>`;
    }
  }

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const arquivoInput = document.getElementById('arquivo');
    const file = arquivoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];

      const documento = {
        titulo: document.getElementById('titulo').value,
        emailAutor: localStorage.getItem('email'),
        emailAluno: selectAluno.value,
        nomeArquivo: file.name,
        arquivoBase64: base64
      };

      try {
        const response = await fetch('/documentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(documento)
        });
        if (!response.ok) throw new Error('Erro ao enviar documento');
        mensagem.innerHTML = `<div class="alert alert-success">Documento enviado com sucesso!</div>`;
        formulario.reset();
        await carregarEntregas();
      } catch (error) {
        console.error(error);
        mensagem.innerHTML = `<div class="alert alert-danger">Falha ao enviar o documento.</div>`;
      }
    };

    reader.readAsDataURL(file);
  });

  carregarAlunos();
  carregarEntregas();
});
