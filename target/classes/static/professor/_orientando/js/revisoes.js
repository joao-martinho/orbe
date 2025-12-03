document.addEventListener('DOMContentLoaded', () => {
  const tipo = localStorage.getItem('tipo');
	const email = localStorage.getItem('email');
	if (tipo !== 'professor' || !email) {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../../login.html';
	}

  const btnSair = document.getElementById('btnSair');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');
  const mensagem = document.getElementById('mensagem');
  const form = document.getElementById('formularioEntrega');

  const inputTitulo = document.getElementById('titulo');
  const inputArquivo = document.getElementById('arquivo');

  const emailProfessor = localStorage.getItem('email');
  const emailAluno = localStorage.getItem('orientando');

  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login.html';
  });

  function formatarData(isoString) {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async function carregarEntregas() {
    try {
      const resp = await fetch(`/revisoes/aluno/${emailAluno}`);
      if (!resp.ok) throw new Error('Erro ao carregar revisões.');
      const revisoes = await resp.json();

      tabelaBody.innerHTML = '';

      if (!revisoes.length) {
        tabelaBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Você ainda não enviou nenhuma revisão.</td></tr>`;
        return;
      }

      revisoes
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .forEach(revisao => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${revisao.titulo}</td>
            <td>${formatarData(revisao.criadoEm)}</td>
            <td><a href="/revisoes/${revisao.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
          `;
          tabelaBody.appendChild(tr);
        });
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.className = 'alert alert-danger';
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

  form.addEventListener('submit', async e => {
    e.preventDefault();
    mensagem.textContent = '';
    mensagem.className = '';

    let valido = true;

    [inputTitulo, inputArquivo].forEach(campo => {
      if ((campo.type === 'file' && campo.files.length === 0) || (campo.type !== 'file' && !campo.value.trim())) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        valido = false;
      } else {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
      }
    });

    if (!valido) return;

    try {
      const titulo = inputTitulo.value.trim();
      const arquivo = inputArquivo.files[0];
      const base64 = await toBase64(arquivo);

      const payload = {
        titulo,
        emailAutor: emailProfessor,
        emailAluno,
        nomeArquivo: arquivo.name,
        arquivoBase64: base64
      };

      const resp = await fetch(`/revisoes/professor/${emailProfessor}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error('Erro ao enviar revisão.');

      mensagem.textContent = 'Revisão enviada com sucesso!';
      mensagem.className = 'alert alert-success';

      form.reset();
      [inputTitulo, inputArquivo].forEach(c => c.classList.remove('is-valid'));
      carregarEntregas();
    } catch (e) {
      mensagem.textContent = e.message;
      mensagem.className = 'alert alert-danger';
    }
  });

  carregarEntregas();
});
