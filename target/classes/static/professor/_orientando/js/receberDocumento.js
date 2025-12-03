document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
	const emailProfessor = localStorage.getItem('email');
	if (tipo !== 'professor' || !emailProfessor) {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../../login.html';
	}

  const btnSair = document.getElementById('btnSair');
  const tabelaBody = document.querySelector('#tabelaEntregas tbody');

  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login.html';
  });

  const email = localStorage.getItem('orientando');
  if (!email) return;

  try {
    const res = await fetch(`/documentos/aluno/${email}`);
    if (!res.ok) throw new Error('Erro ao buscar documentos');

    let documentos = await res.json();
    const documentosFiltrados = documentos.filter(doc => doc.profTcc1 === true);

    tabelaBody.innerHTML = '';

    if (!documentosFiltrados.length) {
      const placeholder = document.createElement('tr');
      placeholder.innerHTML = `
        <td colspan="3" style="text-align:center; color:gray;">Você ainda não recebeu nenhum documento.</td>
      `;
      tabelaBody.appendChild(placeholder);
      return;
    }

    documentosFiltrados.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    documentosFiltrados.forEach(doc => {
      const tr = document.createElement('tr');

      const tdTitulo = document.createElement('td');
      tdTitulo.textContent = doc.titulo || 'Sem título';

      const tdData = document.createElement('td');
      if (doc.criadoEm) {
        const data = new Date(doc.criadoEm);
        tdData.textContent = data.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        tdData.textContent = 'N/A';
      }

      const tdAcoes = document.createElement('td');
      const btnDownload = document.createElement('button');
      btnDownload.className = 'btn btn-primary btn-sm';
      btnDownload.textContent = 'Baixar';
      btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = doc.linkDownload || '#';
        link.download = doc.nomeArquivo || 'documento';
        link.click();
      });

      tdAcoes.appendChild(btnDownload);
      tr.append(tdTitulo, tdData, tdAcoes);
      tabelaBody.appendChild(tr);
    });

  } catch (error) {
    console.log(error);
  }
});
