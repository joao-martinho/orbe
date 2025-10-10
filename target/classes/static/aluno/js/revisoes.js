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
	}

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

			if (!data.length) {
				const placeholder = tabela.insertRow();
				placeholder.innerHTML = `
					<td colspan="4" style="text-align:center; color:gray;">Você ainda não recebeu nenhuma revisão.</td>
				`;
				return;
			}

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
			tabela.innerHTML = '';
			const placeholder = tabela.insertRow();
			placeholder.innerHTML = `
				<td colspan="4" style="text-align:center; color:gray;">Você ainda não tem nenhuma revisão.</td>
			`;
		}
	}

	carregarEntregas();
});
