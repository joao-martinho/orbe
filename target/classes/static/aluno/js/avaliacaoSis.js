document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo')
  const email = localStorage.getItem('email');
  if (tipo !== 'aluno' || !email) {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }

  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../login.html';
  });

  const btnUpload = document.getElementById('btnUpload');
  const btnSalvar = document.getElementById('btnSalvar');

  const campos = {
    aluno1: document.getElementById('aluno1'),
    aluno2: document.getElementById('aluno2'),
    curso: document.getElementById('curso'),
    titulo: document.getElementById('titulo'),
    tipo: document.getElementById('tipo'),
    orientador: document.getElementById('orientador'),
    coorientador: document.getElementById('coorientador'),
    dataEHora: document.getElementById('dataEHora'),
    nomeArquivoPreProjeto: document.getElementById('nomeArquivoPreProjeto'),
    nomeArquivoProjeto: document.getElementById('nomeArquivoProjeto'),
    nomeArquivoParecerAvaliador: document.getElementById('nomeArquivoParecerAvaliador'),
    nomeArquivoParecerProfTcc1: document.getElementById('nomeArquivoParecerProfTcc1'),
    notaAvaliadorPreProjeto: document.getElementById('nota1'),
    notaProfTcc1PreProjeto: document.getElementById('nota2'),
    notaAvaliadorProjeto: document.getElementById('nota4'),
    notaProfTcc1Projeto: document.getElementById('nota5'),
    mediaFinal: document.getElementById('mediaFinal'),
    textStatus: document.getElementById('textStatus')
  };

  let banca = null;
  const alunosCache = {};
  const professoresCache = {};

  async function fetchBanca() {
    const orientandoEmail = localStorage.getItem('email');
    if (!orientandoEmail) return;

    try {
      const res = await fetch(`/bancas`);
      if (!res.ok) throw new Error("Erro ao buscar bancas.");
      const bancas = await res.json();

      banca = bancas.find(b => b.emailAluno1 === orientandoEmail);
      if (!banca) return;

      await preencherCampos();
      ajustarInterface();
    } catch (err) {
      console.error(err);
    }
  }

  function ajustarInterface() {
    const preProjeto = document.getElementById('preProjeto');
    const projeto = document.getElementById('projeto');
    const parecerAvaliador = document.getElementById('parecerAvaliador');
    const parecerProf = document.getElementById('parecerProfessor');

    preProjeto.disabled = false;
    projeto.disabled = false;

    parecerAvaliador.disabled = true;
    parecerProf.disabled = true;
    [parecerAvaliador, parecerProf].forEach(el => el.classList.add('disabled-field'));

    Object.values(campos).forEach(campo => {
      if (campo?.id?.startsWith('nota')) {
        campo.disabled = true;
        campo.classList.add('disabled-field');
      }
    });

    btnSalvar.disabled = true;
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
    let tipo;
    if (banca.tipo === 'inovacao') {
      tipo = "Inovação";
    }
    else {
      tipo = "Aplicado"
    }

    campos.aluno1.textContent = await getNomeAluno(banca.emailAluno1) || "—";
    campos.aluno2.textContent = await getNomeAluno(banca.emailAluno2) || "—";
    campos.curso.textContent = banca.curso || "—";
    campos.titulo.textContent = banca.titulo || "—";
    campos.tipo.textContent = tipo || "—";
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
    campos.notaAvaliadorProjeto.value = banca.notaAvaliadorProjeto ?? '';
    campos.notaProfTcc1Projeto.value = banca.notaProfTcc1Projeto ?? '';

    campos.mediaFinal.textContent = banca.mediaFinal ? banca.mediaFinal.toFixed(1) : "—";
    campos.textStatus.innerHTML = formatStatusBadge(banca.status || "pendente");
  }

  async function uploadArquivos() {
    const preProjeto = document.getElementById('preProjeto').files[0];
    const projeto = document.getElementById('projeto').files[0];

    const formData = new FormData();
    if (preProjeto) formData.append("arquivoPreProjeto", preProjeto);
    if (projeto) formData.append("arquivoProjeto", projeto);

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

  document.getElementById('btnDownloadPreProjeto').onclick = e => downloadArquivo(banca?.arquivoPreProjeto, banca?.nomeArquivoPreProjeto, e);
  document.getElementById('btnDownloadProjeto').onclick = e => downloadArquivo(banca?.arquivoProjeto, banca?.nomeArquivoProjeto, e);
  document.getElementById('btnDownloadParecerAvaliador').onclick = e => downloadArquivo(banca?.arquivoParecerAvaliador, banca?.nomeArquivoParecerAvaliador, e);
  document.getElementById('btnDownloadParecerProfTcc1').onclick = e => downloadArquivo(banca?.arquivoParecerProfTcc1, banca?.nomeArquivoParecerProfTcc1, e);

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
