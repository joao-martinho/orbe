package br.furb.orbe.termo;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/termos")
public class TermoControle {
    
    private final TermoServico termoServico;

    @GetMapping
    public ResponseEntity<Iterable<TermoModelo>> listarTermos() {
        return this.termoServico.listarTermos();
    }

    @PostMapping
    public ResponseEntity<TermoModelo> cadastrarTermo(@Valid @RequestBody TermoModelo TermoModelo) {
        return this.termoServico.cadastrarTermo(TermoModelo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TermoModelo> buscarTermo(@PathVariable Long id) {
        return this.termoServico.buscarTermo(id);
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<TermoModelo> buscarPorEmailAluno(@PathVariable String email) {
        return this.termoServico.buscarPorEmailAluno(email);
    }

    @GetMapping("/professor/{email}")
    public ResponseEntity<List<TermoModelo>> buscarPorEmailProfessor(@PathVariable String email) {
        return this.termoServico.buscarPorEmailProfessor(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TermoModelo> alterarTermoTotal(@Valid @PathVariable Long id, @RequestBody TermoModelo TermoModelo) {
        return this.termoServico.alterarTermoTotal(id, TermoModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TermoModelo> alterarTermoParcial(@PathVariable Long id, @RequestBody TermoModelo TermoModelo) {
        return this.termoServico.alterarTermoParcial(id, TermoModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerTermo(@PathVariable Long id) {
        return this.termoServico.removerTermo(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        termoServico.removerTodos();
    }

}
