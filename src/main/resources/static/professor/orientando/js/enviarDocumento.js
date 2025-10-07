document.addEventListener('DOMContentLoaded', function () {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  const mensagem = document.getElementById('mensagem');
  const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];
  const formularioEntrega = document.getElementById('formularioEntrega');

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
      .catch(erro => {
        console.error('Erro ao carregar entregas: ', erro);
      });
  }

  carregarEntregas();

  formularioEntrega.addEventListener('submit', function (e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const arquivo = document.getElementById('arquivo').files[0];

    if (!titulo || !arquivo) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const arquivoBase64 = reader.result.split(',')[1];

      const dados = {
        titulo: titulo,
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
          carregarEntregas();
          formularioEntrega.reset();
        })
        .catch(err => {
          console.error(err);
        });
    };

    reader.readAsDataURL(arquivo);
  });
});
