package br.furb.orbe.aluno;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.orientacao.OrientacaoServico;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AlunoServico {

    private final AlunoRepositorio alunoRepositorio;
    private final OrientacaoServico orientacaoServico;

    public ResponseEntity<Iterable<AlunoModelo>> listarAlunos() {
        return new ResponseEntity<>(alunoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> cadastrarAluno(AlunoModelo alunoModelo) {
        return new ResponseEntity<>(alunoRepositorio.save(alunoModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<AlunoModelo> alterarAlunoTotal(String email, AlunoModelo alunoModelo) {
        Optional<AlunoModelo> optional = alunoRepositorio.findById(email);
        if (optional.isPresent()) {
            AlunoModelo existente = optional.get();
            alunoModelo.setEmail(email);

            if (alunoModelo.getSenha() != null) {
                existente.setSenhaEmTexto(alunoModelo.getSenha());
                alunoModelo.setSenha(existente.getSenha());
            }

            return new ResponseEntity<>(alunoRepositorio.save(alunoModelo), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<AlunoModelo> alterarAlunoParcial(String email, AlunoModelo alunoModelo) {
        Optional<AlunoModelo> optional = alunoRepositorio.findById(email);
        if (optional.isPresent()) {
            AlunoModelo existente = optional.get();

            if (alunoModelo.getNome() != null) existente.setNome(alunoModelo.getNome());
            if (alunoModelo.getTelefone() != null) existente.setTelefone(alunoModelo.getTelefone());
            if (alunoModelo.getOrientador() != null) existente.setOrientador(alunoModelo.getOrientador());
            if (alunoModelo.getCoorientador() != null) existente.setCoorientador(alunoModelo.getCoorientador());
            if (alunoModelo.getCurso() != null) existente.setCurso(alunoModelo.getCurso());
            if (alunoModelo.getCodigoVer() != null) existente.setCodigoVer(alunoModelo.getCodigoVer());
            if (alunoModelo.getSenha() != null) existente.setSenhaEmTexto(alunoModelo.getSenha());
            if (alunoModelo.getOrientadorProvisorio() != null) orientacaoServico.atribuirOrientadorProvisorio(email, alunoModelo.getOrientadorProvisorio());
            if (alunoModelo.getCoorientadorProvisorio() != null) orientacaoServico.atribuirCoorientadorProvisorio(email, alunoModelo.getCoorientadorProvisorio());

            return new ResponseEntity<>(alunoRepositorio.save(existente), HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerAluno(String email) {
        if (alunoRepositorio.existsById(email)) {
            alunoRepositorio.deleteById(email);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        alunoRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> buscarAluno(String email) {
        Optional<AlunoModelo> optional = alunoRepositorio.findById(email);
        return optional.map(aluno -> new ResponseEntity<>(aluno, HttpStatus.OK))
                       .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public void limparCodigoVer() {
        alunoRepositorio.limparCodigoVer(LocalDateTime.now().minusMinutes(10));
    }

    public ResponseEntity<AlunoModelo> removerProvisorio(String emailAluno, String emailProfessor) {
        return orientacaoServico.removerRelacaoProvisoria(emailAluno, emailProfessor);
    }
}
