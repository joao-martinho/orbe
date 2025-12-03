document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault();

    let email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email.includes('@')) {
        email = email + '@furb.br';
    }

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            throw new Error('Falha no login');
        }

        const data = await response.json();

        localStorage.clear();
        localStorage.setItem('email', email);

        if (data.tipo === "Aluno") {
            localStorage.setItem("tipo", "aluno");
            window.location.href = '../aluno/painel.html';
        } 
        else if (data.tipo === "Professor") {
            localStorage.setItem("tipo", "aluno");
            localStorage.setItem("tipo", "professor");

            if (Array.isArray(data.papeis)) {
                data.papeis.forEach(papel => {
                    localStorage.setItem(papel.toLowerCase(), "true");
                });
            }

            window.location.href = '../professor/painel.html';
        } 
        else if (data.tipo === "Admin") {
            localStorage.setItem("tipo", "admin");
            window.location.href = '../admin/painel.html';
        } 
        else {
            throw new Error('Tipo de usuário não reconhecido');
        }
    } catch (err) {
        mostrarMensagem("Houve um erro. Verifique as suas credenciais e tente novamente.", "danger");
        console.error(err);
    }
});


function mostrarMensagem(texto, tipo = 'danger') {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.innerHTML = `
        <div class="alert alert-${tipo}">
            ${texto}
        </div>
    `;
}
