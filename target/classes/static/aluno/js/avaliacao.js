document.addEventListener('DOMContentLoaded', async () => {
  const btnSair = document.getElementById('btnSair');
  const btnUpload = document.getElementById('btnUpload');
  const formNotas = document.getElementById('formNotas');
  const btnSalvar = document.getElementById('btnSalvar');

  const campos = {
    aluno: document.getElementById('aluno'),
    titulo: document.getElementById('titulo'),
    orientador: document.getElementById('orientador'),
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

  const inputPreProjeto = document.getElementById('preProjeto');
  const inputProjeto = document.getElementById('projeto');
  const parecerAvaliador = document.getElementById('parecerAvaliador');
  const parecerProf = document.getElementById('parecerProfessor');

  let banca = null;
  const alunosCache = {};
  const professoresCache = {};

  btnSair?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  formNotas.onsubmit = e => e.preventDefault();

  async function verificarAcesso() {
    const tipo = localStorage.getItem('tipo');
    const emailAluno = localStorage.getItem('email');
    if (tipo !== 'aluno' || !emailAluno) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return false;
    }

    const res = await fetch(`/alunos/${encodeURIComponent(emailAluno)}`);
    if (!res.ok) {
      alert('Erro ao carregar dados do aluno.');
      window.location.href = '../login.html';
      return false;
    }

    const aluno = await res.json();
    if (!aluno.orientador) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return false;
    }

    return true;
  }

  async function fetchBanca() {
    const orientandoEmail = localStorage.getItem('email');
    if (!orientandoEmail) return;

    try {
      const res = await fetch(`/bancas`);
      if (!res.ok) throw new Error("Erro ao buscar bancas.");
      const bancas = await res.json();
      banca = bancas.find(b => b.emailAluno === orientandoEmail);
      if (!banca) return;

      await preencherCampos();
      desabilitarEdicao();
      desabilitarUploadsRestritos();
      configurarDownloads();
    } catch (err) {
      console.error(err);
    }
  }

  async function preencherCampos() {
    campos.aluno.textContent = await getNomeAluno(banca.emailAluno) || "—";
    campos.titulo.textContent = banca.titulo || "—";
    campos.orientador.textContent = await getNomeProfessor(banca.emailOrientador) || "—";

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
  }

  function desabilitarEdicao() {
    const notas = [
      campos.notaAvaliadorPreProjeto,
      campos.notaProfTcc1PreProjeto,
      campos.notaDefesaQualificacao,
      campos.notaAvaliadorProjeto,
      campos.notaProfTcc1Projeto
    ];
    notas.forEach(n => {
      n.disabled = true;
      n.title = "Somente leitura";
      n.classList.add('disabled-field');
    });
    btnSalvar.disabled = true;
    btnSalvar.title = "Somente disponível para avaliadores";
  }

  function desabilitarUploadsRestritos() {
    [parecerAvaliador, parecerProf].forEach(el => {
      if (el) {
        el.disabled = true;
        el.title = "Você não pode enviar este arquivo";
        el.classList.add('disabled-field');
      }
    });
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

  function configurarDownloads() {
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

    document.getElementById('btnDownloadPreProjeto').onclick = (e) =>
      downloadArquivo(banca.arquivoPreProjeto, banca.nomeArquivoPreProjeto, e);
    document.getElementById('btnDownloadProjeto').onclick = (e) =>
      downloadArquivo(banca.arquivoProjeto, banca.nomeArquivoProjeto, e);
    document.getElementById('btnDownloadParecerAvaliador').onclick = (e) =>
      downloadArquivo(banca.arquivoParecerAvaliador, banca.nomeArquivoParecerAvaliador, e);
    document.getElementById('btnDownloadParecerProfTcc1').onclick = (e) =>
      downloadArquivo(banca.arquivoParecerProfTcc1, banca.nomeArquivoParecerProfTcc1, e);
  }

  btnUpload?.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!inputPreProjeto.files.length && !inputProjeto.files.length) {
      return;
    }

    const formData = new FormData();
    if (inputPreProjeto.files.length) formData.append('arquivoPreProjeto', inputPreProjeto.files[0]);
    if (inputProjeto.files.length) formData.append('arquivoProjeto', inputProjeto.files[0]);

    try {
      const res = await fetch(`/bancas/${banca.id}`, {
        method: 'PATCH',
        body: formData
      });

      if (!res.ok) throw new Error('Erro ao enviar arquivos');

      const data = await res.json();

      if (data.nomeArquivoPreProjeto) campos.nomeArquivoPreProjeto.textContent = data.nomeArquivoPreProjeto;
      if (data.nomeArquivoProjeto) campos.nomeArquivoProjeto.textContent = data.nomeArquivoProjeto;

    } catch (err) {
      console.error(err);
    }
  });

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

  if (await verificarAcesso()) fetchBanca();
});
