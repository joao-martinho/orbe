document.addEventListener('DOMContentLoaded', async () => {
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

  async function buscarNomeProfessor(email) {
    if (!email) return '—';
    try {
      const res = await fetch(`/professores/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Erro ao buscar professor.');
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

      if (!entregasFiltradas.length) {
        tabelaBody.innerHTML = '';
        return;
      }

      entregasFiltradas.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

      tabelaBody.innerHTML = '';
      for (const entrega of entregasFiltradas) {
        const dataFormatada = formatDataHoraBR(new Date(entrega.criadoEm));
        const nomeProfessor = await buscarNomeProfessor(entrega.emailAutor);

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${entrega.titulo}</td>
          <td>${nomeProfessor}</td>
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
    }
  }

  await carregarEntregas();
});
