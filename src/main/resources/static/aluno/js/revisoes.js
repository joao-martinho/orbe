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

	async function carregarEntregas() {
		if (!email) return;

		try {
			const resp = await fetch(`/revisoes/aluno/${email}`);
			if (!resp.ok) throw new Error('Erro ao buscar revisões.');
			const data = await resp.json();

			tabela.innerHTML = '';

			data.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

			const professoresPromises = data.map(entrega =>
				fetch(`/professores/${entrega.emailAutor}`)
					.then(r => {
						if (!r.ok) throw new Error(`Erro ao buscar professor ${entrega.emailAutor}`);
						return r.json();
					})
					.then(professor => professor.nome)
					.catch(() => entrega.emailAutor)
			);

			const nomesProfessores = await Promise.all(professoresPromises);

			data.forEach((entrega, idx) => {
				const fileira = tabela.insertRow();
				fileira.innerHTML = `
					<td>${entrega.titulo}</td>
					<td>${nomesProfessores[idx]}</td>
					<td>${formatarData(entrega.criadoEm)}</td>
					<td><a href="/revisoes/${entrega.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
				`;
			});
		} catch (erro) {
			console.error('Erro ao carregar revisões: ', erro);
		}
	}

	carregarEntregas();
});
