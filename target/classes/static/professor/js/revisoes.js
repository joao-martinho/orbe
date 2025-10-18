document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email')
  if (tipo !== 'professor' || !emailProfessor || localStorage.getItem('prof_tcc1') !== 'true') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');
  const formulario = document.getElementById('formularioEntrega');
  const selectAluno = document.getElementById('orientador');
  const mensagem = document.getElementById('mensagem');

  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
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

  async function carregarAlunos() {
    try {
      const res = await fetch('/alunos');
      if (!res.ok) throw new Error('Erro ao carregar alunos.');
      const alunos = await res.json();
      selectAluno.innerHTML = '<option value="">Escolha o aluno</option>';
      for (const aluno of alunos) {
        const option = document.createElement('option');
        option.value = aluno.email;
        option.textContent = await buscarNomeAluno(aluno.email);
        selectAluno.appendChild(option);
      }
    } catch (err) {
      console.error(err);
      mensagem.textContent = err.message;
      mensagem.className = 'text-center text-danger mb-3';
    }
  }

  function formatarData(isoString) {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  async function carregarEntregas() {
    try {
      const emailAutor = emailProfessor;
      const res = await fetch(`/documentos/${emailAutor}`);
      if (!res.ok) throw new Error('Erro ao carregar documentos');
      const documentos = await res.json();

      tabelaBody.innerHTML = '';
      const documentosFiltrados = documentos
        .filter(doc => doc.profTcc1 === true)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

      if (!documentosFiltrados.length) {
        tabelaBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Você ainda não enviou nenhuma revisão.</td></tr>`;
        return;
      }

      for (const doc of documentosFiltrados) {
        const tr = document.createElement('tr');
        const dataFormatada = formatarData(doc.criadoEm);
        const nomeAluno = await buscarNomeAluno(doc.emailAluno);
        tr.innerHTML = `
          <td>${doc.titulo}</td>
          <td>${nomeAluno}</td>
          <td>${dataFormatada}</td>
          <td><a href="/documentos/${doc.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
        `;
        tabelaBody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
      tabelaBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Você ainda não enviou nenhuma revisão.</td></tr>`;
      mensagem.textContent = err.message;
      mensagem.className = 'text-center text-danger mb-3';
    }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });
  }

  formulario.addEventListener('submit', async e => {
    e.preventDefault();
    e.stopPropagation();

    mensagem.textContent = '';
    mensagem.className = '';

    const campos = [document.getElementById('titulo'), document.getElementById('orientador'), document.getElementById('arquivo')];
    let valido = true;

    campos.forEach(campo => {
      if ((campo.type === 'file' && campo.files.length === 0) || !campo.value.trim()) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        valido = false;
      } else {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
      }
    });

    formulario.classList.add('was-validated');
    if (!valido) return;

    try {
      const arquivoInput = document.getElementById('arquivo');
      const file = arquivoInput.files[0];
      const base64 = await toBase64(file);

      const documento = {
        titulo: document.getElementById('titulo').value,
        emailAutor,
        emailAluno: selectAluno.value,
        nomeArquivo: file.name,
        arquivoBase64: base64,
        profTcc1: true
      };

      const resp = await fetch('/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documento)
      });

      if (!resp.ok) throw new Error('Erro ao enviar documento.');

      mensagem.textContent = 'Revisão enviada com sucesso!';
      mensagem.className = 'text-center text-success mb-3';

      formulario.reset();
      campos.forEach(c => c.classList.remove('is-valid'));
      await carregarEntregas();
    } catch (err) {
      console.error(err);
      mensagem.textContent = err.message;
      mensagem.className = 'text-center text-danger mb-3';
    }
  });

  await carregarAlunos();
  await carregarEntregas();
});
