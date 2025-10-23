document.addEventListener('DOMContentLoaded', function () {
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

    if (!aluno.orientador) {
      alert('Você não tem permissão para acessar esta página.');
      window.location.href = '../login.html';
      return;
    }

    // guarda o aluno carregado pra uso posterior
    carregarEntregas(aluno);
  }

  const tabela = document.querySelector('#tabelaEntregas tbody');
  const formularioEntrega = document.getElementById('formularioEntrega');
  const email = localStorage.getItem('email');

  function aplicarValidacaoVisual(form) {
    form.classList.add('was-validated');
    const campos = form.querySelectorAll('input, select, textarea');
    campos.forEach(campo => {
      if (!campo.checkValidity()) campo.classList.add('is-invalid');
      else campo.classList.remove('is-invalid');
    });
  }

  function validarFormulario(form) {
    aplicarValidacaoVisual(form);
    return form.checkValidity();
  }

  function formatarData(isoString) {
    const data = new Date(isoString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano}, ${horas}:${minutos}`;
  }

  async function carregarEntregas(aluno) {
    if (!aluno?.email) return;

    const emailsParaBuscar = [aluno.email];
    if (aluno.parceiro) emailsParaBuscar.push(aluno.parceiro);

    try {
      const resultados = await Promise.all(
        emailsParaBuscar.map(e =>
          fetch(`/entregas/aluno/${encodeURIComponent(e)}`).then(r => {
            if (!r.ok) throw new Error('Erro ao buscar entregas.');
            return r.json();
          })
        )
      );

      const entregas = resultados.flat();
      tabela.innerHTML = '';

      if (!entregas.length) {
        const placeholder = tabela.insertRow();
        placeholder.innerHTML = `
          <td colspan="3" style="text-align:center; color:gray;">
            Nenhuma entrega encontrada.
          </td>`;
        return;
      }

      entregas
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
        .forEach(entrega => {
          const fileira = tabela.insertRow();
          fileira.innerHTML = `
            <td>${entrega.titulo}</td>
            <td>${formatarData(entrega.criadoEm)}</td>
            <td><a href="/entregas/${entrega.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
          `;
        });
    } catch (erro) {
      console.error('Erro ao carregar entregas:', erro);
      tabela.innerHTML = '';
      const placeholder = tabela.insertRow();
      placeholder.innerHTML = `
        <td colspan="3" style="text-align:center; color:gray;">
          Erro ao carregar entregas.
        </td>`;
    }
  }

  formularioEntrega.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validarFormulario(formularioEntrega)) return;

    const form = e.target;
    const titulo = form.querySelector('#titulo').value.trim();
    const arquivo = form.querySelector('#arquivo').files[0];

    if (!arquivo) {
      aplicarValidacaoVisual(formularioEntrega);
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const arquivoBase64 = reader.result.split(',')[1];
      const dados = {
        titulo: titulo,
        emailAutor: email,
        nomeArquivo: arquivo.name,
        arquivoBase64: arquivoBase64
      };

      fetch(`/entregas/aluno/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao enviar entrega');
          return res.json();
        })
        .then(() => {
          // recarrega com base no aluno atual
          verificarAcesso();
          form.reset();
          form.classList.remove('was-validated');
        })
        .catch(err => console.error(err));
    };

    reader.readAsDataURL(arquivo);
  });
});
