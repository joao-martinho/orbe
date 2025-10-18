package br.furb.orbe.auth;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.admin.AdminModelo;
import br.furb.orbe.admin.AdminRepositorio;
import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import br.furb.orbe.credenciais.CredenciaisDTO;
import br.furb.orbe.professor.PapelProfessor;
import br.furb.orbe.professor.ProfessorModelo;
import br.furb.orbe.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServico {

    private final AlunoRepositorio alunoRepositorio;
    private final ProfessorRepositorio professorRepositorio;
    private final AdminRepositorio adminRepositorio;

    public ResponseEntity<Map<String, Object>> login(CredenciaisDTO credenciais) {

        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(credenciais.getEmail());
        if (alunoModelo != null && alunoModelo.conferirSenha(credenciais.getSenha())) {
            Map<String, Object> response = new HashMap<>();
            response.put("tipo", "Aluno");
            response.put("email", alunoModelo.getEmail());
            return ResponseEntity.ok(response);
        }

        ProfessorModelo professorModelo = professorRepositorio.findByEmail(credenciais.getEmail());
        if (professorModelo != null && professorModelo.conferirSenha(credenciais.getSenha())) {
            Map<String, Object> response = new HashMap<>();
            response.put("tipo", "Professor");
            response.put("email", professorModelo.getEmail());

            Set<PapelProfessor> papeis = professorModelo.getPapeis();
            response.put("papeis", papeis);

            return ResponseEntity.ok(response);
        }

        AdminModelo adminModelo = adminRepositorio.findByEmail(credenciais.getEmail());
        if (adminModelo != null && adminModelo.conferirSenha(credenciais.getSenha())) {
            Map<String, Object> response = new HashMap<>();
            response.put("tipo", "Admin");
            response.put("email", adminModelo.getEmail());
            return ResponseEntity.ok(response);
        }

        Map<String, Object> erro = new HashMap<>();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro);
    }
}
