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
            if (alunoModelo.getParceiro() != null) atribuirParceiro(email, alunoModelo.getParceiro());

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

    public ResponseEntity<AlunoModelo> removerOrientadorProvisorio(String emailAluno) {
        return orientacaoServico.removerRelacaoProvisoria(emailAluno);
    }

    public ResponseEntity<AlunoModelo> atribuirParceiro(String emailAluno, String emailParceiro) {
        Optional<AlunoModelo> optionalAluno = alunoRepositorio.findById(emailAluno);
        Optional<AlunoModelo> optionalParceiro = alunoRepositorio.findById(emailParceiro);

        if (!optionalAluno.isPresent() || !optionalParceiro.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        AlunoModelo aluno = optionalAluno.get();
        AlunoModelo parceiro = optionalParceiro.get();

        if (!"SIS".equals(parceiro.getCurso())) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        aluno.setParceiro(parceiro.getEmail());
        parceiro.setParceiro(aluno.getEmail());

        alunoRepositorio.save(aluno);
        alunoRepositorio.save(parceiro);

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> removerParceiro(String emailAluno) {
        Optional<AlunoModelo> optionalAluno = alunoRepositorio.findById(emailAluno);
        
        if (!optionalAluno.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        AlunoModelo aluno = optionalAluno.get();
        String emailParceiro = aluno.getParceiro();
        
        if (emailParceiro != null) {
            Optional<AlunoModelo> optionalParceiro = alunoRepositorio.findById(emailParceiro);
            if (optionalParceiro.isPresent()) {
                AlunoModelo parceiro = optionalParceiro.get();
                parceiro.setParceiro(null);
                alunoRepositorio.save(parceiro);
            }
        }
        
        aluno.setParceiro(null);
        alunoRepositorio.save(aluno);
        
        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }
}
