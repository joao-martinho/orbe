document.addEventListener('DOMContentLoaded', async () => {
  const tipo = localStorage.getItem('tipo');
  if (tipo !== 'professor') {
    alert('Você não tem permissão para acessar esta página :(');
    window.location.href = '../login.html';
  }
  
  const email = localStorage.getItem('email')
  const tabelaBody = document.querySelector('#tabelaEntregas tbody')
  const comboOrientador = document.getElementById('orientador')
  const form = document.getElementById('formularioEntrega')
  const mensagem = document.getElementById('mensagem')
  const btnSair = document.getElementById('btnSair')

  btnSair.addEventListener('click', () => {
    localStorage.clear()
    window.location.href = '../../login.html'
  })

  async function carregarRevisoes() {
    try {
      const resp = await fetch(`/documentos/professor/${email}`)
      if (!resp.ok) throw new Error('Erro ao carregar revisões')
      const revisoes = await resp.json()
      tabelaBody.innerHTML = ''
      revisoes.forEach(r => {
        const tr = document.createElement('tr')
        const data = new Date(r.criadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        tr.innerHTML = `
          <td>${r.titulo}</td>
          <td>${data}</td>
          <td><a href="data:application/octet-stream;base64,${r.arquivoBase64}" download="${r.nomeArquivo}" class="btn btn-sm btn-success">Baixar</a></td>
        `
        tabelaBody.appendChild(tr)
      })
    } catch (err) {
      console.error(err)
    }
  }

  async function carregarProfessores() {
    try {
      const resp = await fetch('/professores')
      if (!resp.ok) throw new Error('Erro ao carregar professores')
      const professores = await resp.json()
      professores.forEach(p => {
        const opt = document.createElement('option')
        opt.value = p.email
        opt.textContent = p.email
        comboOrientador.appendChild(opt)
      })
    } catch (err) {
      console.error(err)
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault()
    mensagem.innerHTML = ''
    try {
      const titulo = document.getElementById('titulo').value
      const arquivoInput = document.getElementById('arquivo').files[0]
      const orientadorEmail = comboOrientador.value
      if (!arquivoInput) throw new Error('Selecione um arquivo')

      const arquivoBase64 = await toBase64(arquivoInput)

      const revisao = {
        titulo: titulo,
        emailAutor: email,
        emailReceptor: orientadorEmail,
        nomeArquivo: arquivoInput.name,
        arquivoBase64: arquivoBase64
      }

      const resp = await fetch(`/professor/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revisao)
      })

      if (!resp.ok) throw new Error('Erro ao enviar revisão.')

      mensagem.innerHTML = `<div class="alert alert-success">Revisão enviada com sucesso!</div>`
      form.reset()
      await carregarRevisoes()
    } catch (err) {
      console.error(err)
      mensagem.innerHTML = `<div class="alert alert-danger">${err.message}</div>`
    }
  })

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
    })
  }

  carregarProfessores()
  carregarRevisoes()
})
