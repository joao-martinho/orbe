document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor' || !localStorage.getItem('orientando')) {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login.html';
  });

  const emailProfessor = localStorage.getItem('email');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');
  const mensagem = document.getElementById('mensagem');
  const form = document.getElementById('formularioEntrega');

  async function carregarAlunos() {
    try {
      const resp = await fetch('/alunos');
      if (!resp.ok) throw new Error('Erro ao carregar alunos.');
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.classList.add('text-danger');
    }
  }

  async function carregarEntregas() {
    try {
      const emailAluno = localStorage.getItem('orientando');
      const resp = await fetch(`/revisoes/aluno/${emailAluno}`);
      if (!resp.ok) throw new Error('Erro ao carregar revisões.');
      const revisoes = await resp.json();

      tabelaBody.innerHTML = '';

      if (!revisoes.length) {
        const placeholder = tabelaBody.insertRow();
        placeholder.innerHTML = `
          <td colspan="3" style="text-align:center; color:gray;">Você ainda não enviou nenhuma revisão.</td>
        `;
        return;
      }

      revisoes
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .forEach(async revisao => {
          const alunoResp = await fetch(`/alunos/${revisao.emailAluno}`);
          if (!alunoResp.ok) throw new Error('Erro ao carregar aluno.');

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${revisao.titulo}</td>
            <td>${formatarData(revisao.criadoEm)}</td>
            <td>
              <a href="/revisoes/${revisao.id}/download" class="btn btn-sm btn-primary">Baixar</a>
            </td>
          `;
          tabelaBody.appendChild(tr);
        });
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.classList.add('text-danger');
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    mensagem.textContent = '';

    try {
      const emailAluno = localStorage.getItem('orientando');
      const titulo = document.getElementById('titulo').value;
      const arquivo = document.getElementById('arquivo').files[0];

      if (!emailAluno) throw new Error('Selecione um aluno.');
      if (!arquivo) throw new Error('Selecione um arquivo.');

      const base64 = await toBase64(arquivo);

      const payload = {
        titulo: titulo,
        emailAutor: emailProfessor,
        nomeArquivo: arquivo.name,
        arquivoBase64: base64,
        emailAluno: emailAluno
      };

      const resp = await fetch(`/revisoes/professor/${emailProfessor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Erro ao enviar revisão.');
      form.reset();
      carregarEntregas();
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.classList.add('text-danger');
    }
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result.split(',')[1];
        resolve(result);
      };
      reader.onerror = reject;
    });
  }

  function formatarData(isoString) {
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano}, ${horas}:${minutos}`;
  }

  carregarAlunos();
  carregarEntregas();
});
