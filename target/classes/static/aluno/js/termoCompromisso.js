document.addEventListener('DOMContentLoaded', () => {
  const btnSair = document.getElementById('btnSair');
  btnSair?.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '../login.html';
  });
  
  verificarAcesso();

  async function verificarAcesso() {
    const tipo = localStorage.getItem('tipo');
    const emailAluno = localStorage.getItem('email');

    if (tipo !== 'aluno' || !emailAluno) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return;
    }

    const res = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
    if (!res.ok) {
      alert('Erro ao carregar dados do aluno.');
      window.location.href = '../login.html';
      return;
    }

    const aluno = await res.json();

    if (!aluno.orientadorProvisorio) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return;
    }

  }

  const btnFinalizar = document.querySelector('button[type="submit"]');
  const visualizacaoTermo = document.getElementById('visualizacaoTermo');
  const mensagem = document.getElementById('mensagem');

  const campos = {
    titulo: document.getElementById('titulo'),
    ano: document.getElementById('ano'),
    semestre: document.getElementById('semestre'),
    resumo: document.getElementById('resumo'),
    perfil: document.getElementById('perfil')
  };

  const perfilContainer = document.getElementById('perfilContainer');

  const termoInfo = {
    termoAluno: document.getElementById('termoAluno'),
    termoTitulo: document.getElementById('termoTitulo'),
    termoOrientador: document.getElementById('termoOrientador'),
    termoCoorientadorContainer: document.getElementById('termoCoorientadorContainer'),
    termoCoorientador: document.getElementById('termoCoorientador'),
    termoParceiroContainer: document.getElementById('termoParceiroContainer'),
    termoParceiro: document.getElementById('termoParceiro'),
    termoPerfilCoorientadorContainer: document.getElementById('termoPerfilCoorientadorContainer'),
    termoPerfilCoorientador: document.getElementById('termoPerfilCoorientador'),
    termoAnoSemestre: document.getElementById('termoAnoSemestre'),
    termoResumo: document.getElementById('termoResumo'),
    termoStatus: document.getElementById('termoStatus')
  };

  function setCamposReadonly(readonly) {
    campos.titulo.readOnly = readonly;
    campos.ano.disabled = readonly;
    campos.semestre.disabled = readonly;
    campos.resumo.readOnly = readonly;
    campos.perfil.readOnly = readonly;
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

  async function atualizarVisualizacaoTermo(termo) {
    termoInfo.termoAluno.textContent = await buscarNomeAluno(termo.emailAluno);
    termoInfo.termoTitulo.textContent = termo.titulo;
    termoInfo.termoOrientador.textContent = await buscarNomeProfessor(termo.emailOrientador);

    if (termo.emailCoorientador) {
      termoInfo.termoCoorientadorContainer.style.display = 'block';
      termoInfo.termoCoorientador.textContent = await buscarNomeProfessor(termo.emailCoorientador);
    } else {
      termoInfo.termoCoorientadorContainer.style.display = 'none';
    }

    if (termo.nomeParceiro) {
      termoInfo.termoParceiroContainer.style.display = 'block';
      termoInfo.termoParceiro.textContent = termo.nomeParceiro;
    } else {
      termoInfo.termoParceiroContainer.style.display = 'none';
    }

    termoInfo.termoAnoSemestre.textContent = `${termo.ano}/${termo.semestre}`;
    termoInfo.termoResumo.textContent = termo.resumo;

    let status = 'pendente';
    if (
      termo.statusOrientador === 'devolvido' ||
      termo.statusCoorientador === 'devolvido' ||
      termo.statusProfessorTcc1 === 'devolvido'
    ) {
      status = 'devolvido';
    } else if (termo.statusFinal) {
      status = termo.statusFinal;
    }

    termoInfo.termoStatus.textContent = `Situação: ${status}`;
    termoInfo.termoStatus.className = 'alert text-center';

    if (status === 'aprovado') {
      termoInfo.termoStatus.classList.add('alert-success');
      setCamposReadonly(true);
      btnFinalizar.disabled = true;
    } else if (status === 'pendente') {
      termoInfo.termoStatus.classList.add('alert-warning');
      setCamposReadonly(true);
      btnFinalizar.disabled = true;
    } else if (status === 'devolvido') {
      termoInfo.termoStatus.classList.add('alert-danger');
      setCamposReadonly(false);
      btnFinalizar.disabled = false;
    } else {
      termoInfo.termoStatus.classList.add('alert-secondary');
      setCamposReadonly(false);
      btnFinalizar.disabled = false;
    }

    const comentarioContainer = document.getElementById('comentarioProfessorContainer');
    const comentarioSpan = document.getElementById('comentarioProfessor');
    if (termo.comentario && termo.comentario.trim() !== '') {
      comentarioSpan.textContent = termo.comentario;
      comentarioContainer.classList.remove('d-none');
    } else {
      comentarioContainer.classList.add('d-none');
    }

    visualizacaoTermo.classList.remove('d-none');
  }

  async function carregarTermo() {
    const emailAluno = localStorage.getItem('email');

    try {
      const resAluno = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
      const aluno = await resAluno.json();

      if (aluno.coorientadorProvisorio) {
        perfilContainer.style.display = 'block';
      } else {
        perfilContainer.style.display = 'none';
      }

      const resTermo = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
      if (resTermo.ok) {
        const termo = await resTermo.json();
        if (termo && termo.titulo) {
          campos.titulo.value = termo.titulo;
          campos.ano.value = termo.ano;
          campos.semestre.value = termo.semestre;
          campos.resumo.value = termo.resumo;

          if (aluno.coorientadorProvisorio) {
            perfilContainer.style.display = 'block';
            campos.perfil.value = termo.perfilCoorientador || '';
          } else {
            perfilContainer.style.display = 'none';
          }

          await atualizarVisualizacaoTermo(termo);
        } else {
          visualizacaoTermo.classList.add('d-none');
        }
      } else if (resTermo.status === 404) {
        visualizacaoTermo.classList.add('d-none');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function enviarTermo() {
    const emailAluno = localStorage.getItem('email');

    try {
      const resAluno = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
      const aluno = await resAluno.json();

      const data = new Date();
      const offset = 3 * 60;
      const dataUTC3 = new Date(data.getTime() - offset * 60 * 1000).toISOString();

      let parceiroData = null;
      if (aluno.parceiro) {
        try {
          const resParceiro = await fetch(`/alunos/${encodeURIComponent(aluno.parceiro)}`);
          if (resParceiro.ok) {
            parceiroData = await resParceiro.json();
          }
        } catch (error) {
          console.log('Erro ao buscar dados do parceiro:', error);
        }
      }

      const termo = {
        titulo: campos.titulo.value.trim(),
        emailAluno: aluno.email,
        nomeAluno: aluno.nome,
        telefoneAluno: aluno.telefone,
        cursoAluno: aluno.curso,
        emailParceiro: parceiroData ? parceiroData.email : null,
        nomeParceiro: parceiroData ? parceiroData.nome : null,
        ano: campos.ano.value,
        semestre: campos.semestre.value,
        resumo: campos.resumo.value.trim(),
        emailOrientador: aluno.orientadorProvisorio || null,
        emailCoorientador: aluno.coorientadorProvisorio || null,
        perfilCoorientador: aluno.coorientadorProvisorio ? campos.perfil.value.trim() : null,
        statusOrientador: "pendente",
        statusCoorientador: "pendente",
        statusProfessorTcc1: "pendente",
        statusFinal: "pendente",
        criadoEm: dataUTC3,
      };

      let metodo = 'POST';
      let url = '/termos';

      const resTermoExistente = await fetch(`/termos/aluno/${encodeURIComponent(emailAluno)}`);
      if (resTermoExistente.ok) {
        let termoExistente = null;
        const text = await resTermoExistente.text();
        if (text) termoExistente = JSON.parse(text);

        if (termoExistente && termoExistente.id) {
          metodo = 'PATCH';
          url = `/termos/${encodeURIComponent(termoExistente.id)}`;
        }
      }

      const resPost = await fetch(url, {
        method: metodo,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(termo),
      });

      let termoSalvo = null;
      const resText = await resPost.text();
      if (resText) termoSalvo = JSON.parse(resText);

      mensagem.innerHTML = parceiroData ? 
        `<div class="alert alert-success">Termo de compromisso enviado com sucesso.</div>` :
        `<div class="alert alert-success">Termo de compromisso enviado com sucesso.</div>`;
      if (termoSalvo) atualizarVisualizacaoTermo(termoSalvo);

    } catch (error) {
      console.log(error)
    }
  }

  const modalHTML = `
    <div class="modal fade" id="modalConfirmEnviar" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmação</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div class="modal-body">
            Tem certeza de que deseja enviar o termo de compromisso?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Não</button>
            <button type="button" class="btn btn-success" id="confirmEnviar">Sim</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmEnviar'));

  btnFinalizar.addEventListener('click', e => {
    e.preventDefault();
    modalConfirm.show();
  });

  document.getElementById('confirmEnviar').addEventListener('click', async () => {
    modalConfirm.hide();
    await enviarTermo();
  });

  carregarTermo();
});
