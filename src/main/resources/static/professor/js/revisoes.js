document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');
  const formulario = document.getElementById('formularioEntrega');
  const selectAluno = document.getElementById('orientador');

  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  async function carregarAlunos() {
    try {
      const response = await fetch('/alunos');
      if (!response.ok) throw new Error('Erro ao carregar alunos.');

      const alunos = await response.json();

      for (const aluno of alunos) {
        const option = document.createElement('option');
        option.value = aluno.email;
        option.textContent = await buscarNomeAluno(aluno.email);
        selectAluno.appendChild(option);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarEntregas() {
    try {
      const emailAutor = localStorage.getItem('email');
      const response = await fetch(`/documentos/${emailAutor}`);
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      const documentos = await response.json();

      tabelaBody.innerHTML = '';

      const documentosFiltrados = documentos
        .filter(doc => doc.profTcc1 === true)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

      for (const doc of documentosFiltrados) {
        const tr = document.createElement('tr');

        const dataFormatada = new Date(doc.criadoEm).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const nomeAluno = await buscarNomeAluno(doc.emailAluno);

        tr.innerHTML = `
          <td>${doc.titulo}</td>
          <td>${nomeAluno}</td>
          <td>${dataFormatada}</td>
          <td>
            <a href="/download/${doc.id}" class="btn btn-sm btn-primary">Baixar</a>
          </td>
        `;
        tabelaBody.appendChild(tr);
      }
    } catch (error) {
      console.error(error);
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
        arquivoBase64: base64,
        profTcc1: true,
      };

      try {
        const response = await fetch('/documentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(documento)
        });
        if (!response.ok) throw new Error('Erro ao enviar documento.');
        formulario.reset();
        await carregarEntregas();
      } catch (error) {
        console.error(error);
      }
    };

    reader.readAsDataURL(file);
  });

  async function buscarNomeAluno(email) {
    if (!email) return '—';
    try {
      const res = await fetch(`/alunos/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Erro ao buscar aluno.');
      const dados = await res.json();
      return dados.nome || '—';
    } catch (err) {
      console.error(err);
      return '—';
    }
  }

  carregarAlunos();
  carregarEntregas();
});
