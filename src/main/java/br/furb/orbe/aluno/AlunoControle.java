package br.furb.orbe.aluno;

import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/alunos")
public class AlunoControle {
    
    private final AlunoServico alunoServico;

    @GetMapping
    public ResponseEntity<Iterable<AlunoModelo>> listarAlunos() {
        return this.alunoServico.listarAlunos();
    }

    @PostMapping
    public ResponseEntity<AlunoModelo> cadastrarAluno(@Valid @RequestBody AlunoModelo alunoModelo) {
        return this.alunoServico.cadastrarAluno(alunoModelo);
    }

    @GetMapping("/{email}")
    public ResponseEntity<AlunoModelo> buscarAluno(@PathVariable String email) {
        return this.alunoServico.buscarAluno(email);
    }

    @PutMapping("/{email}")
    public ResponseEntity<AlunoModelo> alterarAlunoTotal(@Valid @PathVariable String email, @RequestBody AlunoModelo alunoModelo) {
        return this.alunoServico.alterarAlunoTotal(email, alunoModelo);
    }

    @PatchMapping("/{email}")
    public ResponseEntity<AlunoModelo> alterarAlunoParcial(@PathVariable String email, @RequestBody AlunoModelo alunoModelo) {
        return this.alunoServico.alterarAlunoParcial(email, alunoModelo);
    }

    @PatchMapping("/remover-orientador/{email}")
    public ResponseEntity<AlunoModelo> removerOrientadorProvisorio(@PathVariable String email) {
        return this.alunoServico.removerOrientadorProvisorio(email);
    }

    @PatchMapping("/atribuir-parceiro/{emailAluno}/{emailParceiro}")
    public ResponseEntity<AlunoModelo> atribuirParceiro(@PathVariable String emailAluno, @PathVariable String emailParceiro) {
        return this.alunoServico.atribuirParceiro(emailAluno, emailParceiro);
    }

    @PatchMapping("/remover-parceiro/{email}")
    public ResponseEntity<AlunoModelo> removerParceiro(@PathVariable String email) {
        return this.alunoServico.removerParceiro(email);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> removerAluno(@PathVariable String email) {
        return this.alunoServico.removerAluno(email);
    }

    @DeleteMapping
    public void deletarTodos() {
        alunoServico.removerTodos();
    }

    @Scheduled(fixedRate = 600_000)
    public void limparCodigoVer() {
        alunoServico.limparCodigoVer();
    }

}