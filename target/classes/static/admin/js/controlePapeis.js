document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'admin') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
    return;
  }

  const btnSair = document.getElementById('btnSair');
	btnSair.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../login.html';
	});

  const profTcc1Bcc = document.getElementById('profTcc1Bcc');
  const profTcc2Bcc = document.getElementById('profTcc2Bcc');
  const profTcc1Sis = document.getElementById('profTcc1Sis');
  const profTcc2Sis = document.getElementById('profTcc2Sis');
  const coordBcc = document.getElementById('coordBcc');
  const coordSis = document.getElementById('coordSis');
  const form = document.getElementById('formCoordenadores');
  const mensagem = document.getElementById('mensagem');
  
  const viewTcc1Bcc = document.getElementById('viewTcc1Bcc');
  const viewTcc2Bcc = document.getElementById('viewTcc2Bcc');
  const viewTcc1Sis = document.getElementById('viewTcc1Sis');
  const viewTcc2Sis = document.getElementById('viewTcc2Sis');
  const viewBcc = document.getElementById('viewBcc');
  const viewSis = document.getElementById('viewSis');

  let professores = [];
  let atuais = { tcc1Bcc: null, tcc2Bcc: null, tcc1Sis: null, tcc2Sis: null, bcc: null, sis: null };

  try {
    const resp = await fetch('/professores');
    professores = await resp.json();

    function preencherSelect(select, lista) {
      select.innerHTML = ''; 
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecione o professor';
      placeholder.selected = true;
      placeholder.disabled = true;
      select.appendChild(placeholder);

      lista.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.email;
        opt.textContent = p.nome;
        select.appendChild(opt);
      });
    }

    preencherSelect(profTcc1Bcc, professores);
    preencherSelect(profTcc2Bcc, professores);
    preencherSelect(profTcc1Sis, professores);
    preencherSelect(profTcc2Sis, professores);
    preencherSelect(coordBcc, professores);
    preencherSelect(coordSis, professores);

    professores.forEach(p => {
      if (p.papeis?.includes("PROF_TCC1_BCC")) {
        profTcc1Bcc.value = p.email;
        atuais.tcc1Bcc = p.email;
        viewTcc1Bcc.textContent = p.nome;
      }
      if (p.papeis?.includes("PROF_TCC2_BCC")) {
        profTcc2Bcc.value = p.email;
        atuais.tcc2Bcc = p.email;
        viewTcc2Bcc.textContent = p.nome;
      }
      if (p.papeis?.includes("PROF_TCC1_SIS")) {
        profTcc1Sis.value = p.email;
        atuais.tcc1Sis = p.email;
        viewTcc1Sis.textContent = p.nome;
      }
      if (p.papeis?.includes("PROF_TCC2_SIS")) {
        profTcc2Sis.value = p.email;
        atuais.tcc2Sis = p.email;
        viewTcc2Sis.textContent = p.nome;
      }
      if (p.papeis?.includes("COORD_BCC")) {
        coordBcc.value = p.email;
        atuais.bcc = p.email;
        viewBcc.textContent = p.nome;
      }
      if (p.papeis?.includes("COORD_SIS")) {
        coordSis.value = p.email;
        atuais.sis = p.email;
        viewSis.textContent = p.nome;
      }
    });

  } catch (e) {
    mensagem.innerHTML = '<div class="alert alert-danger">Erro ao carregar professores.</div>';
  }

  async function atualizarPapel(papel, antigo, novo) {
    if (antigo && antigo !== novo) {
      await fetch(`/professores/${papel}/remover/${antigo}`, { method: 'PATCH' });
    }
    if (novo && antigo !== novo) {
      await fetch(`/professores/${papel}/adicionar/${novo}`, { method: 'PATCH' });
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const tcc1Bcc = profTcc1Bcc.value;
    const tcc2Bcc = profTcc2Bcc.value;
    const tcc1Sis = profTcc1Sis.value;
    const tcc2Sis = profTcc2Sis.value;
    const bcc = coordBcc.value;
    const sis = coordSis.value;

    mensagem.innerHTML = '';
    
    try {
      await atualizarPapel("prof-tcc1-bcc", atuais.tcc1Bcc, tcc1Bcc);
      await atualizarPapel("prof-tcc2-bcc", atuais.tcc2Bcc, tcc2Bcc);
      await atualizarPapel("prof-tcc1-sis", atuais.tcc1Sis, tcc1Sis);
      await atualizarPapel("prof-tcc2-sis", atuais.tcc2Sis, tcc2Sis);
      await atualizarPapel("coord-bcc", atuais.bcc, bcc);
      await atualizarPapel("coord-sis", atuais.sis, sis);

      const nome = email => professores.find(p => p.email === email)?.nome || '';
      viewTcc1Bcc.textContent = nome(tcc1Bcc);
      viewTcc2Bcc.textContent = nome(tcc2Bcc);
      viewTcc1Sis.textContent = nome(tcc1Sis);
      viewTcc2Sis.textContent = nome(tcc2Sis);
      viewBcc.textContent = nome(bcc);
      viewSis.textContent = nome(sis);

      mensagem.innerHTML = '<div class="alert alert-success text-center">Papéis atualizados com sucesso!</div>';

      atuais = { tcc1Bcc, tcc2Bcc, tcc1Sis, tcc2Sis, bcc, sis };
    } catch (err) {
      mensagem.innerHTML = '<div class="alert alert-danger text-center">Erro ao atualizar papéis.</div>';
    }
  });
  
});
