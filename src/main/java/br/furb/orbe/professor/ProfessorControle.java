package br.furb.orbe.professor;

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

import br.furb.orbe.aluno.AlunoModelo;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/professores")
public class ProfessorControle {

    private final ProfessorServico professorServico;

    @GetMapping
    public ResponseEntity<Iterable<ProfessorModelo>> listarProfessores() {
        return this.professorServico.listarProfessores();
    }

    @GetMapping("/orientandos/{email}")
    public ResponseEntity<Iterable<AlunoModelo>> listarOrientandos(@PathVariable String email) {
        return this.professorServico.listarOrientandos(email);
    }

    @GetMapping("/orientandos-provisorios/{email}")
    public ResponseEntity<Iterable<AlunoModelo>> listarOrientandosProvisorios(@PathVariable String email) {
        return this.professorServico.listarOrientandosProvisorios(email);
    }

    @GetMapping("/coorientandos/{email}")
    public ResponseEntity<Iterable<AlunoModelo>> listarCoorientandos(@PathVariable String email) {
        return this.professorServico.listarCoorientandos(email);
    }

    @GetMapping("/coorientandos-provisorios/{email}")
    public ResponseEntity<Iterable<AlunoModelo>> listarCoorientandosProvisorios(@PathVariable String email) {
        return this.professorServico.listarCoorientandosProvisorios(email);
    }
    
    @PostMapping
    public ResponseEntity<ProfessorModelo> cadastrarProfessor(@Valid @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.cadastrarProfessor(professorModelo);
    }

    @GetMapping("/{email}")
    public ResponseEntity<ProfessorModelo> buscarProfessor(@PathVariable String email) {
        return this.professorServico.localizarProfessor(email);
    }

    @PutMapping("/{email}")
    public ResponseEntity<ProfessorModelo> alterarProfessorTotal(@Valid @PathVariable String email, @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.alterarProfessorTotal(email, professorModelo);
    }

    @PatchMapping("/remover-orientando/{emailAluno}")
    public ResponseEntity<AlunoModelo> removerOrientandoProvisorio(@PathVariable String emailAluno) {
        return this.professorServico.removerOrientandoProvisorio(emailAluno);
    }

    @PatchMapping("/{email}")
    public ResponseEntity<ProfessorModelo> alterarProfessorParcial(@PathVariable String email, @RequestBody ProfessorModelo professorModelo) {
        return this.professorServico.alterarProfessorParcial(email, professorModelo);
    }

    @PatchMapping("/prof-tcc1-bcc/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarProfTcc1Bcc(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.PROF_TCC1_BCC);
    }

    @PatchMapping("/prof-tcc1-bcc/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerProfTcc1Bcc(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.PROF_TCC1_BCC);
    }

    @PatchMapping("/prof-tcc2-bcc/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarProfTcc2Bcc(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.PROF_TCC2_BCC);
    }

    @PatchMapping("/prof-tcc2-bcc/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerProfTcc2Bcc(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.PROF_TCC2_BCC);
    }

    @PatchMapping("/prof-tcc1-sis/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarProfTcc1Sis(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.PROF_TCC1_SIS);
    }

    @PatchMapping("/prof-tcc1-sis/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerProfTcc1Sis(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.PROF_TCC1_SIS);
    }

    @PatchMapping("/prof-tcc2-sis/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarProfTcc2Sis(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.PROF_TCC2_SIS);
    }

    @PatchMapping("/prof-tcc2-sis/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerProfTcc2Sis(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.PROF_TCC2_SIS);
    }

    @PatchMapping("/coord-bcc/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarCoordBcc(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.COORD_BCC);
    }

    @PatchMapping("/coord-bcc/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerCoordBcc(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.COORD_BCC);
    }

    @PatchMapping("/coord-sis/adicionar/{email}")
    public ResponseEntity<ProfessorModelo> tornarCoordSis(@PathVariable String email) {
        return this.professorServico.adicionarPapel(email, PapelProfessor.COORD_SIS);
    }

    @PatchMapping("/coord-sis/remover/{email}")
    public ResponseEntity<ProfessorModelo> removerCoordenador(@PathVariable String email) {
        return this.professorServico.removerPapel(email, PapelProfessor.COORD_SIS);
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<Void> removerProfessor(@PathVariable String email) {
        return this.professorServico.removerProfessor(email);
    }

    @DeleteMapping
    public void deletarTodos() {
        professorServico.removerTodos();
    }

    @Scheduled(fixedRate = 600_000)
    public void limparCodigoVer() {
        professorServico.limparCodigoVer();
    }
}
