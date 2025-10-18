document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email')
  if (tipo !== 'professor' || !emailProfessor || localStorage.getItem('prof_tcc1') !== 'true') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');

  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  function formatDataHoraBR(date) {
    if (!date) return 'Data indisponível';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

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

  async function carregarEntregas() {
    try {
      const resEntregas = await fetch('/documentos');
      if (!resEntregas.ok) throw new Error('Erro ao buscar entregas');
      const entregasTotais = await resEntregas.json();

      const entregasFiltradas = entregasTotais.filter(entrega => entrega.profTcc1 === false);

      tabelaBody.innerHTML = '';

      if (!entregasFiltradas.length) {
        const placeholder = tabelaBody.insertRow();
        placeholder.innerHTML = `
          <td colspan="4" style="text-align:center; color:gray;">Você ainda não recebeu nenhum projeto.</td>
        `;
        return;
      }

      entregasFiltradas.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

      for (const entrega of entregasFiltradas) {
        const dataFormatada = formatDataHoraBR(new Date(entrega.criadoEm));
        const nomeAluno = await buscarNomeAluno(entrega.emailAluno);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${entrega.titulo}</td>
          <td>${nomeAluno}</td>
          <td>${dataFormatada}</td>
          <td>
            <a href="${entrega.linkDownload}" class="btn btn-primary btn-sm" download>Baixar</a>
          </td>
        `;
        tabelaBody.appendChild(tr);
      }

    } catch (error) {
      console.error(error);
      tabelaBody.innerHTML = '';
      const placeholder = tabelaBody.insertRow();
      placeholder.innerHTML = `
        <td colspan="4" style="text-align:center; color:gray;">Você ainda não recebeu nenhum projeto.</td>
      `;
    }
  }

  await carregarEntregas();
});
