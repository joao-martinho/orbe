document.addEventListener('DOMContentLoaded', function () {
	const tipo = localStorage.getItem('tipo');
	if (tipo !== 'aluno') {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../login.html';
	}

	const btnSair = document.getElementById('btnSair');
	btnSair.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../login.html';
	});

	const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];
	const formularioEntrega = document.getElementById('formularioEntrega');
	const email = localStorage.getItem('email');

	function formatarData(isoString) {
		const data = new Date(isoString);
		const dia = String(data.getDate()).padStart(2, '0');
		const mes = String(data.getMonth() + 1).padStart(2, '0'); 
		const ano = data.getFullYear();
		const horas = String(data.getHours()).padStart(2, '0');
		const minutos = String(data.getMinutes()).padStart(2, '0');
		return `${dia}/${mes}/${ano}, ${horas}:${minutos}`;
	}

	function carregarEntregas() {
		if (!email) return;

		fetch(`/entregas/aluno/${email}`)
			.then(response => {
				if (!response.ok) throw new Error('Erro ao buscar entregas.');
				return response.json();
			})
			.then(data => {
				tabela.innerHTML = '';

				data
					.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
					.forEach(entrega => {
						const fileira = tabela.insertRow();
						fileira.innerHTML = `
							<td>${entrega.titulo}</td>
							<td>${formatarData(entrega.criadoEm)}</td>
							<td><a href="/entregas/${entrega.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
						`;
					});
			})
			.catch(erro => console.error('Erro ao carregar entregas: ', erro));
	}

	carregarEntregas();

	formularioEntrega.addEventListener('submit', function(e) {
		e.preventDefault();

		const form = e.target;
		const titulo = form.querySelector('#titulo').value;
		const arquivo = form.querySelector('#arquivo').files[0];

		if (!arquivo) return;

		const reader = new FileReader();
		reader.onload = function() {
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
				carregarEntregas();
				form.reset();
			})
			.catch(err => console.error(err));
		};

		reader.readAsDataURL(arquivo);
	});
});
