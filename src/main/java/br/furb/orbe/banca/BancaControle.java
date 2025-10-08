package br.furb.orbe.banca;

import org.springframework.http.ResponseEntity;
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
@RequestMapping("/bancas")
public class BancaControle {
    
    private final BancaServico BancaServico;

    @GetMapping
    public ResponseEntity<Iterable<BancaModelo>> listarBancas() {
        return this.BancaServico.listarBancas();
    }

    @PostMapping
    public ResponseEntity<BancaModelo> cadastrarBanca(@Valid @RequestBody BancaModelo bancaModelo) {
        return this.BancaServico.cadastrarBanca(bancaModelo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BancaModelo> buscarBanca(@PathVariable Long id) {
        return this.BancaServico.buscarBanca(id);
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<BancaModelo> buscarPorAluno(@PathVariable String email) {
        return this.BancaServico.buscarPorAluno(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BancaModelo> alterarBancaTotal(@Valid @PathVariable Long id, @RequestBody BancaModelo bancaModelo) {
        return this.BancaServico.alterarBancaTotal(id, bancaModelo);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BancaModelo> alterarBancaParcial(@PathVariable Long id, @RequestBody BancaModelo bancaModelo) {
        return this.BancaServico.alterarBancaParcial(id, bancaModelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerBanca(@PathVariable Long id) {
        return this.BancaServico.removerBanca(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        BancaServico.removerTodos();
    }

}
