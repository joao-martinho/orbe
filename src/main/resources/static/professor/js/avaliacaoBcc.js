document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  const emailProfessor = localStorage.getItem('email')
  if (tipo !== 'professor' || !emailProfessor) {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const btnUpload = document.getElementById('btnUpload');
  const formNotas = document.getElementById('formNotas');
  const btnSalvar = document.getElementById('btnSalvar');

  const campos = {
    aluno: document.getElementById('aluno'),
    curso: document.getElementById('curso'),
    titulo: document.getElementById('titulo'),
    orientador: document.getElementById('orientador'),
    coorientador: document.getElementById('coorientador'),
    dataEHora: document.getElementById('dataEHora'),
    nomeArquivoPreProjeto: document.getElementById('nomeArquivoPreProjeto'),
    nomeArquivoProjeto: document.getElementById('nomeArquivoProjeto'),
    nomeArquivoParecerAvaliador: document.getElementById('nomeArquivoParecerAvaliador'),
    nomeArquivoParecerProfTcc1: document.getElementById('nomeArquivoParecerProfTcc1'),
    notaAvaliadorPreProjeto: document.getElementById('nota1'),
    notaProfTcc1PreProjeto: document.getElementById('nota2'),
    notaDefesaQualificacao: document.getElementById('nota3'),
    notaAvaliadorProjeto: document.getElementById('nota4'),
    notaProfTcc1Projeto: document.getElementById('nota5'),
    mediaFinal: document.getElementById('mediaFinal'),
    textStatus: document.getElementById('textStatus')
  };

  let banca = null;
  let papelUsuario = null;
  const alunosCache = {};
  const professoresCache = {};

  async function fetchBanca() {
    const orientandoEmail = localStorage.getItem('avaliando');
    if (!orientandoEmail) return;

    try {
      const res = await fetch(`/bancas`);
      if (!res.ok) throw new Error("Erro ao buscar bancas.");
      const bancas = await res.json();
      
      banca = bancas.find(b => b.emailAluno1 === orientandoEmail || b.emailAluno2 === orientandoEmail);
      if (!banca) {
        console.warn("Banca não encontrada para o aluno:", orientandoEmail);
        return;
      }

      definirPapelUsuario();
      await preencherCampos();
      ajustarInterfacePorPapel();
    } catch (err) {
      console.error(err);
    }
  }

  function definirPapelUsuario() {
    const emailAtual = localStorage.getItem('email');
    if (emailAtual === banca.emailProfTcc1) papelUsuario = 'prof_tcc1_bcc';
    else if (emailAtual === banca.emailAvaliador) papelUsuario = 'avaliador';
    else if (emailAtual === banca.emailOrientador) papelUsuario = 'orientador';
    else {
      alert('Você não tem permissão para acessar esta página :(');
      window.location.href = '../login.html';
    }
  }

  function ajustarInterfacePorPapel() {
    const preProjeto = document.getElementById('preProjeto');
    const projeto = document.getElementById('projeto');
    const parecerAvaliador = document.getElementById('parecerAvaliador');
    const parecerProf = document.getElementById('parecerProfessor');

    const {
      notaAvaliadorPreProjeto, notaAvaliadorProjeto, 
      notaProfTcc1PreProjeto, notaProfTcc1Projeto, notaDefesaQualificacao
    } = campos;

    const todosCampos = [
      preProjeto, projeto, parecerAvaliador, parecerProf,
      notaAvaliadorPreProjeto, notaAvaliadorProjeto,
      notaProfTcc1PreProjeto, notaProfTcc1Projeto,
      notaDefesaQualificacao
    ];

    todosCampos.forEach(el => {
      el.disabled = true;
      el.classList.add('disabled-field');
    });

    preProjeto.title = "Envio desabilitado";
    projeto.title = "Envio desabilitado";

    if (papelUsuario === 'avaliador') {
      notaAvaliadorPreProjeto.disabled = false;
      notaAvaliadorProjeto.disabled = false;
      parecerAvaliador.disabled = false;

      [notaAvaliadorPreProjeto, notaAvaliadorProjeto, parecerAvaliador]
        .forEach(el => el.classList.remove('disabled-field'));

    } else if (papelUsuario === 'prof_tcc1_bcc') {
      notaProfTcc1PreProjeto.disabled = false;
      notaProfTcc1Projeto.disabled = false;
      parecerProf.disabled = false;

      [notaProfTcc1PreProjeto, notaProfTcc1Projeto, parecerProf]
        .forEach(el => el.classList.remove('disabled-field'));

    } else if (papelUsuario === 'orientador') {
      notaDefesaQualificacao.disabled = false;
      notaDefesaQualificacao.classList.remove('disabled-field');

    } else {
      todosCampos.forEach(el => {
        el.disabled = true;
        el.classList.add('disabled-field');
      });
      preProjeto.title = "Envio desabilitado";
      projeto.title = "Envio desabilitado";
    }
  }

  function formatStatusBadge(status) {
    if (!status) return "—";
    const s = status.toLowerCase();
    let badgeClass = "bg-secondary";
    if (s === "aprovado") badgeClass = "bg-success";
    else if (s === "reprovado") badgeClass = "bg-danger";
    else if (s === "pendente") badgeClass = "bg-warning text-dark";
    const capitalized = s.charAt(0).toUpperCase() + s.slice(1);
    return `<span class="badge ${badgeClass}">${capitalized}</span>`;
  }

  async function preencherCampos() {
    campos.aluno.textContent = await getNomeAluno(banca.emailAluno1) || "—";
    campos.curso.textContent = banca.curso || "—";
    campos.titulo.textContent = banca.titulo || "—";
    campos.orientador.textContent = await getNomeProfessor(banca.emailOrientador) || "—";
    campos.coorientador.textContent = await getNomeProfessor(banca.emailCoorientador) || "—";

    if (banca.data) {
      const dataHora = new Date(`${banca.data}T${banca.hora || '00:00'}`);
      campos.dataEHora.textContent = dataHora.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    } else campos.dataEHora.textContent = "—";

    campos.nomeArquivoPreProjeto.textContent = banca.nomeArquivoPreProjeto || "—";
    campos.nomeArquivoProjeto.textContent = banca.nomeArquivoProjeto || "—";
    campos.nomeArquivoParecerAvaliador.textContent = banca.nomeArquivoParecerAvaliador || "—";
    campos.nomeArquivoParecerProfTcc1.textContent = banca.nomeArquivoParecerProfTcc1 || "—";

    campos.notaAvaliadorPreProjeto.value = banca.notaAvaliadorPreProjeto ?? '';
    campos.notaProfTcc1PreProjeto.value = banca.notaProfTcc1PreProjeto ?? '';
    campos.notaDefesaQualificacao.value = banca.notaDefesaQualificacao ?? '';
    campos.notaAvaliadorProjeto.value = banca.notaAvaliadorProjeto ?? '';
    campos.notaProfTcc1Projeto.value = banca.notaProfTcc1Projeto ?? '';

    campos.mediaFinal.textContent = banca.mediaFinal ? banca.mediaFinal.toFixed(1) : "—";
    campos.textStatus.innerHTML = formatStatusBadge(banca.status || "pendente");

    btnSalvar.disabled = banca.status && banca.status.toLowerCase() !== "pendente";
  }

  function calcularMedia() {
    const n1 = parseFloat(campos.notaProfTcc1PreProjeto.value) || 0;
    const n2 = parseFloat(campos.notaAvaliadorPreProjeto.value) || 0;
    const n3 = parseFloat(campos.notaDefesaQualificacao.value) || 0;
    const n4 = parseFloat(campos.notaProfTcc1Projeto.value) || 0;
    const n5 = parseFloat(campos.notaAvaliadorProjeto.value) || 0;
    if ([n1, n2, n3, n4, n5].some(v => v === 0)) return null;
    return (n1 * 0.1) + (n2 * 0.2) + (n3 * 0.1) + (n4 * 0.2) + (n5 * 0.4);
  }

  async function salvarNotas() {
    const media = calcularMedia();
    let status = "pendente";
    if (media !== null) status = media < 6 ? "reprovado" : "aprovado";

    const payload = {};

    if (papelUsuario === 'avaliador') {
      payload.notaAvaliadorPreProjeto = parseFloat(campos.notaAvaliadorPreProjeto.value) || null;
      payload.notaAvaliadorProjeto = parseFloat(campos.notaAvaliadorProjeto.value) || null;
    } else if (papelUsuario === 'prof_tcc1_bcc') {
      payload.notaProfTcc1PreProjeto = parseFloat(campos.notaProfTcc1PreProjeto.value) || null;
      payload.notaProfTcc1Projeto = parseFloat(campos.notaProfTcc1Projeto.value) || null;
    } else if (papelUsuario === 'orientador') {
      payload.notaDefesaQualificacao = parseFloat(campos.notaDefesaQualificacao.value) || null;
    }

    payload.mediaFinal = media;
    payload.status = status;

    try {
      const res = await fetch(`/bancas/${banca.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Erro ao atualizar notas");
      banca = await res.json();
      await preencherCampos();
    } catch (err) {
      console.error(err);
    }
  }

  async function uploadArquivos() {
    const preProjeto = document.getElementById('preProjeto').files[0];
    const projeto = document.getElementById('projeto').files[0];
    const parecerAvaliador = document.getElementById('parecerAvaliador').files[0];
    const parecerProf = document.getElementById('parecerProfessor').files[0];

    const formData = new FormData();

    if (papelUsuario === 'avaliador') {
      if (parecerAvaliador) formData.append("arquivoParecerAvaliador", parecerAvaliador);
    } else if (papelUsuario === 'prof_tcc1_bcc') {
      if (preProjeto) formData.append("arquivoPreProjeto", preProjeto);
      if (projeto) formData.append("arquivoProjeto", projeto);
      if (parecerProf) formData.append("arquivoParecerProfTcc1", parecerProf);
    }

    if ([...formData.keys()].length > 0) {
      try {
        const res = await fetch(`/bancas/${banca.id}`, { method: 'PATCH', body: formData });
        if (!res.ok) throw new Error("Erro ao enviar arquivos");
        banca = await res.json();
        await preencherCampos();
      } catch (err) {
        console.error(err);
      }
    }
  }

  function downloadArquivo(base64, nome, event) {
    event?.preventDefault();
    if (!base64) return;
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${base64}`;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.getElementById('btnDownloadPreProjeto').onclick = e => downloadArquivo(banca.arquivoPreProjeto, banca.nomeArquivoPreProjeto, e);
  document.getElementById('btnDownloadProjeto').onclick = e => downloadArquivo(banca.arquivoProjeto, banca.nomeArquivoProjeto, e);
  document.getElementById('btnDownloadParecerAvaliador').onclick = e => downloadArquivo(banca.arquivoParecerAvaliador, banca.nomeArquivoParecerAvaliador, e);
  document.getElementById('btnDownloadParecerProfTcc1').onclick = e => downloadArquivo(banca.arquivoParecerProfTcc1, banca.nomeArquivoParecerProfTcc1, e);

  formNotas.onsubmit = e => { e.preventDefault(); salvarNotas(); };
  btnUpload.onclick = uploadArquivos;

  async function getNomeAluno(email) {
    if (!email) return '—';
    if (alunosCache[email]) return alunosCache[email];
    try {
      const res = await fetch(`/alunos/${email}`);
      const data = await res.json();
      alunosCache[email] = data.nome;
      return data.nome;
    } catch { return email; }
  }

  async function getNomeProfessor(email) {
    if (!email) return '—';
    if (professoresCache[email]) return professoresCache[email];
    try {
      const res = await fetch(`/professores/${email}`);
      const data = await res.json();
      professoresCache[email] = data.nome;
      return data.nome;
    } catch { return email; }
  }

  fetchBanca();
});
