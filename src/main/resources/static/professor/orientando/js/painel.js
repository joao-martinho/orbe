document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor' || !localStorage.getItem('orientando')) {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../../login.html';
  });

  const h1 = document.getElementById('titulo-aluno');
  h1.style.display = 'none';

  const emailAluno = localStorage.getItem('orientando');

  try {
    if (emailAluno) {
      try {
        const response = await fetch(`/alunos/${emailAluno}`);
        if (response.ok) {
          const aluno = await response.json();
          h1.textContent = `Orientando: ${aluno.nome || emailAluno}`;
        } else {
          h1.textContent = `Orientando: ${emailAluno}`;
        }
      } catch {
        h1.textContent = `Orientando: ${emailAluno}`;
      }
    } else {
      h1.textContent = 'Orientando: (não definido)';
    }
  } catch (err) {
    console.error('Erro ao interpretar orientando:', err);
    h1.textContent = 'Orientando: (não definido)';
  }

  h1.style.display = 'block';

  const isCoorientando = localStorage.getItem('isCoorientando') === 'true';
  if (isCoorientando) {
    const cardEnvio = document.querySelector('[data-role="envio-documentos"]');
    const cardRecebimento = document.querySelector('[data-role="recebimento-documentos"]');

    if (cardEnvio) cardEnvio.style.display = 'none';
    if (cardRecebimento) cardRecebimento.style.display = 'none';
  }

  const papeisAtivos = [];
  ['coordTcc1', 'coordBcc', 'coordSis'].forEach(papel => {
    if (localStorage.getItem(papel) === 'true') {
      papeisAtivos.push(papel);
    }
  });

  document.querySelectorAll('.col').forEach(card => {
    const roles = card.getAttribute('data-role');
    const livre = card.getAttribute('data-livre') === 'true';

    if (isCoorientando && (roles === 'envio-documentos' || roles === 'recebimento-documentos')) {
      card.style.display = 'none';
      return;
    }

    if (livre) {
      card.style.display = 'block';
      return;
    }

    if (roles) {
      const lista = roles.split(',').map(r => r.trim());
      const autorizado = lista.some(r => papeisAtivos.includes(r));
      if (autorizado) {
        card.style.display = 'block';
      }
    }
  });

});
