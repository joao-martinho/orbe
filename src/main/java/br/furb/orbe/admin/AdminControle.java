package br.furb.orbe.admin;

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
@RequestMapping("/admin")
public class AdminControle {
    
    private final AdminServico adminServico;

    @PostMapping
    public ResponseEntity<AdminModelo> cadastrarAdmin(@Valid @RequestBody AdminModelo adminModelo) {
        return this.adminServico.cadastrarAdmin(adminModelo);
    }

    @GetMapping
    public ResponseEntity<AdminModelo> buscarAdmin(@PathVariable String email) {
        return this.adminServico.buscarAdmin(email);
    }

    @PutMapping
    public ResponseEntity<AdminModelo> alterarAdminTotal(@Valid @PathVariable String email, @RequestBody AdminModelo adminModelo) {
        return this.adminServico.alterarAdminTotal(email, adminModelo);
    }

    @PatchMapping
    public ResponseEntity<AdminModelo> alterarAdminParcial(@PathVariable String email, @RequestBody AdminModelo adminModelo) {
        return this.adminServico.alterarAdminParcial(email, adminModelo);
    }

    @DeleteMapping
    public ResponseEntity<Void> removerAdmin(@PathVariable String email) {
        return this.adminServico.removerAdmin(email);
    }

}
