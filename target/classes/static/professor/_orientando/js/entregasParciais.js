document.addEventListener('DOMContentLoaded', function () {
	const tipo = localStorage.getItem('tipo');
	const email = localStorage.getItem('email');
	if (tipo !== 'professor' || !localStorage.getItem('orientando') || !email) {
		alert('Você não tem permissão para acessar esta página :(');
		window.location.href = '../../login.html';
	}

	const btnSair = document.getElementById('btnSair');
	btnSair.addEventListener('click', () => {
		localStorage.clear();
		window.location.href = '../../login.html';
	});

	const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];

	function formatarData(isoString) {
		const data = new Date(isoString);
		return data.toLocaleDateString('pt-BR');
	}

	async function carregarEntregas() {
		if (!email) return;

		try {
			const emailAluno = localStorage.getItem('orientando');
			const response = await fetch(`/entregas/aluno/${encodeURIComponent(emailAluno)}`);
			if (!response.ok) throw new Error('Erro ao buscar entregas.');
			const data = await response.json();

			tabela.innerHTML = '';

			if (data.length === 0) {
				const placeholder = tabela.insertRow();
				placeholder.innerHTML = `
					<td colspan="3" style="text-align:center; color:gray;">Você ainda não recebeu nenhuma entrega parcial.</td>
				`;
				return;
			}

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
		} catch (erro) {
			console.error('Erro ao carregar entregas: ', erro);
		}
	}

	carregarEntregas();
});
