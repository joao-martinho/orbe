package br.furb.orbe.admin;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServico {
    private final AdminRepositorio adminRepositorio;

    public ResponseEntity<Iterable<AdminModelo>> listarAdmins() {
        return new ResponseEntity<>(adminRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<AdminModelo> cadastrarAdmin(AdminModelo adminModelo) {
        return new ResponseEntity<>(adminRepositorio.save(adminModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<AdminModelo> alterarAdminTotal(String email, AdminModelo adminModelo) {
        Optional<AdminModelo> optional = adminRepositorio.findById(email);

        if (optional.isPresent()) {
            AdminModelo existente = optional.get();
            adminModelo.setEmail(email);

            if (adminModelo.getSenha() != null) {
                existente.setSenhaEmTexto(adminModelo.getSenha());
                adminModelo.setSenha(existente.getSenha());
            }

            return new ResponseEntity<>(adminRepositorio.save(adminModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<AdminModelo> alterarAdminParcial(String email, AdminModelo adminModelo) {
        Optional<AdminModelo> optional = adminRepositorio.findById(email);

        if (optional.isPresent()) {
            AdminModelo existente = optional.get();

            if (adminModelo.getSenha() != null) {
                existente.setSenhaEmTexto(adminModelo.getSenha());
            }

            return new ResponseEntity<>(adminRepositorio.save(existente), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerAdmin(String email) {
        if (adminRepositorio.existsById(email)) {
            adminRepositorio.deleteById(email);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<AdminModelo> buscarAdmin(String email) {
        Optional<AdminModelo> optional = adminRepositorio.findById(email);
        return optional.map(admin -> new ResponseEntity<>(admin, HttpStatus.OK))
                       .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

}
