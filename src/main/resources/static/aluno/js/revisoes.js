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

		
		
		carregarEntregas(aluno);
	}

	const tabela = document.getElementById('tabelaEntregas').getElementsByTagName('tbody')[0];

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
					fetch(`/revisoes/aluno/${encodeURIComponent(e)}`).then(r => {
						if (!r.ok) throw new Error('Erro ao buscar revisões.');
						return r.json();
					})
				)
			);

			const revisoes = resultados.flat();
			tabela.innerHTML = '';

			if (!revisoes.length) {
				const placeholder = tabela.insertRow();
				placeholder.innerHTML = `
					<td colspan="4" style="text-align:center; color:gray;">Você ainda não recebeu nenhuma revisão.</td>
				`;
				return;
			}

			revisoes.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

			const professoresPromises = revisoes.map(entrega =>
				fetch(`/professores/${entrega.emailAutor}`)
					.then(r => {
						if (!r.ok) throw new Error(`Erro ao buscar professor ${entrega.emailAutor}`);
						return r.json();
					})
					.then(professor => professor.nome)
					.catch(() => entrega.emailAutor)
			);

			const nomesProfessores = await Promise.all(professoresPromises);

			revisoes.forEach((entrega, idx) => {
				const fileira = tabela.insertRow();
				fileira.innerHTML = `
					<td>${entrega.titulo}</td>
					<td>${nomesProfessores[idx]}</td>
					<td>${formatarData(entrega.criadoEm)}</td>
					<td><a href="/revisoes/${entrega.id}/download" class="btn btn-sm btn-primary">Baixar</a></td>
				`;
			});
		} catch (erro) {
			console.error('Erro ao carregar revisões:', erro);
			tabela.innerHTML = '';
			const placeholder = tabela.insertRow();
			placeholder.innerHTML = `
				<td colspan="4" style="text-align:center; color:gray;">Você ainda não tem nenhuma revisão.</td>
			`;
		}
	}
});
