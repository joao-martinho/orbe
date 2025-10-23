document.addEventListener('DOMContentLoaded', function () {
  const tipo = localStorage.getItem('tipo');
	const email = localStorage.getItem('email');
	if (tipo !== 'professor' || !localStorage.getItem('orientando') || !email) {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../../login.html';
	}

  const btnSair = document.getElementById('btnSair');
  const mensagem = document.getElementById('mensagem');
  const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];
  const formularioEntrega = document.getElementById('formularioEntrega');

  const inputTitulo = document.getElementById('titulo');
  const inputArquivo = document.getElementById('arquivo');

  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login.html';
  });

  const emailOrientador = localStorage.getItem('email');
  const emailAluno = localStorage.getItem('orientando');

  function formatarData(isoString) {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function carregarEntregas() {
    if (!emailAluno) return;

    fetch(`/documentos/aluno/${emailAluno}`)
      .then(response => {
        if (!response.ok) throw new Error('Erro ao buscar entregas.');
        return response.json();
      })
      .then(data => {
        tabela.innerHTML = '';
        const entregasFiltradas = data.filter(entrega => entrega.profTcc1 === false);

        if (!entregasFiltradas.length) {
          tabela.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Você ainda não enviou nenhum documento.</td></tr>`;
          return;
        }

        entregasFiltradas
          .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
          .forEach(entrega => {
            const fileira = tabela.insertRow();
            fileira.innerHTML = `
              <td>${entrega.titulo}</td>
              <td>${formatarData(entrega.criadoEm)}</td>
              <td><a href="/documentos/${entrega.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
            `;
          });
      })
      .catch(erro => console.error('Erro ao carregar entregas: ', erro));
  }

  formularioEntrega.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

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

    formularioEntrega.classList.add('was-validated');
    if (!valido) return;

    const arquivo = inputArquivo.files[0];
    const reader = new FileReader();
    reader.onload = function () {
      const arquivoBase64 = reader.result.split(',')[1];

      const dados = {
        titulo: inputTitulo.value.trim(),
        emailAutor: emailOrientador,
        emailAluno: emailAluno,
        nomeArquivo: arquivo.name,
        arquivoBase64: arquivoBase64,
        profTcc1: false
      };

      fetch('/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao enviar entrega');
          return res.json();
        })
        .then(() => {
          mensagem.textContent = 'Documento enviado com sucesso.';
          mensagem.className = 'alert alert-success';
          formularioEntrega.reset();
          [inputTitulo, inputArquivo].forEach(c => c.classList.remove('is-valid'));
          carregarEntregas();
        })
        .catch(err => {
          console.error(err);
          mensagem.textContent = 'Erro ao enviar documento.';
          mensagem.className = 'alert alert-danger';
        });
    };

    reader.readAsDataURL(arquivo);
  });

  carregarEntregas();
});
