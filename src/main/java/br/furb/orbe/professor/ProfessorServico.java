package br.furb.orbe.professor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import br.furb.orbe.orientacao.OrientacaoServico;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfessorServico {

    private final ProfessorRepositorio professorRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final OrientacaoServico orientacaoServico;

    public ResponseEntity<Iterable<ProfessorModelo>> listarProfessores() {
        return new ResponseEntity<>(professorRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<ProfessorModelo> cadastrarProfessor(ProfessorModelo professorModelo) {
        if (professorModelo.getPapeis() == null || professorModelo.getPapeis().isEmpty()) {
            professorModelo.setPapeis(new HashSet<>());
        }
        return new ResponseEntity<>(professorRepositorio.save(professorModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<ProfessorModelo> alterarProfessorTotal(String email, ProfessorModelo professorModelo) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        if (optional.isPresent()) {
            ProfessorModelo existente = optional.get();
            professorModelo.setEmail(email);

            if (professorModelo.getSenha() != null) {
                existente.setSenhaEmTexto(professorModelo.getSenha());
            }

            if (professorModelo.getPapeis() == null || professorModelo.getPapeis().isEmpty()) {
                professorModelo.setPapeis(existente.getPapeis());
            }

            return new ResponseEntity<>(professorRepositorio.save(professorModelo), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<ProfessorModelo> alterarProfessorParcial(String email, ProfessorModelo professorModelo) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        if (optional.isPresent()) {
            ProfessorModelo existente = optional.get();

            if (professorModelo.getNome() != null) existente.setNome(professorModelo.getNome());
            if (professorModelo.getTelefone() != null) existente.setTelefone(professorModelo.getTelefone());
            if (professorModelo.getOrientandos() != null) existente.setOrientandos(professorModelo.getOrientandos());
            if (professorModelo.getOrientandosProvisorios() != null) existente.setOrientandosProvisorios(professorModelo.getOrientandosProvisorios());
            if (professorModelo.getCoorientandos() != null) existente.setCoorientandos(professorModelo.getCoorientandos());
            if (professorModelo.getSenha() != null) existente.setSenhaEmTexto(professorModelo.getSenha());
            if (professorModelo.getCodigoVer() != null) existente.setCodigoVer(professorModelo.getCodigoVer());
            if (professorModelo.getPapeis() != null && !professorModelo.getPapeis().isEmpty()) existente.setPapeis(professorModelo.getPapeis());

            return new ResponseEntity<>(professorRepositorio.save(existente), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerProfessor(String email) {
        if (professorRepositorio.existsById(email)) {
            professorRepositorio.deleteById(email);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        professorRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<ProfessorModelo> localizarProfessor(String email) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        return optional.map(professor -> new ResponseEntity<>(professor, HttpStatus.OK))
                       .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<ProfessorModelo> adicionarPapel(String email, PapelProfessor papel) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        if (optional.isPresent()) {
            ProfessorModelo professor = optional.get();

            if (professor.getPapeis() == null) {
                professor.setPapeis(new HashSet<>());
            }

            if (papel == PapelProfessor.COORD_BCC && professor.getPapeis().contains(PapelProfessor.COORD_SIS)) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }
            if (papel == PapelProfessor.COORD_SIS && professor.getPapeis().contains(PapelProfessor.COORD_BCC)) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            professor.getPapeis().add(papel);
            return new ResponseEntity<>(professorRepositorio.save(professor), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<ProfessorModelo> removerPapel(String email, PapelProfessor papel) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        if (optional.isPresent()) {
            ProfessorModelo professor = optional.get();
            if (professor.getPapeis() != null) {
                professor.getPapeis().remove(papel);
            }
            return new ResponseEntity<>(professorRepositorio.save(professor), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public void limparCodigoVer() {
        professorRepositorio.limparCodigoVer(LocalDateTime.now().minusMinutes(10));
    }

    public ResponseEntity<Iterable<AlunoModelo>> listarOrientandos(String email) {
        ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);
        List<String> emailOrientandos = professorModelo.getOrientandos();
        List<AlunoModelo> orientandos = new ArrayList<>();

        if (emailOrientandos == null) {
            return new ResponseEntity<>(orientandos, HttpStatus.OK);
        }

        for (String e : emailOrientandos) {
            AlunoModelo alunoModelo = alunoRepositorio.findByEmail(e);
            if (alunoModelo != null) {
                orientandos.add(alunoModelo);
            }
        }
        return new ResponseEntity<>(orientandos, HttpStatus.OK);
    }

    public ResponseEntity<Iterable<AlunoModelo>> listarOrientandosProvisorios(String email) {
        ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);
        List<String> emailOrientandosProvisorios = professorModelo.getOrientandosProvisorios();
        List<AlunoModelo> orientandosProvisorios = new ArrayList<>();

        if (emailOrientandosProvisorios == null) {
            return new ResponseEntity<>(orientandosProvisorios, HttpStatus.OK);
        }
        
        for (String e : emailOrientandosProvisorios) {
            AlunoModelo alunoModelo = alunoRepositorio.findByEmail(e);
            if (alunoModelo != null) {
                orientandosProvisorios.add(alunoModelo);
            }
        }
        return new ResponseEntity<>(orientandosProvisorios, HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> removerOrientandoProvisorio(String emailAluno) {
        return orientacaoServico.removerRelacaoProvisoria(emailAluno);
    }

    public ResponseEntity<Iterable<AlunoModelo>> listarCoorientandos(String email) {
        ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);
        List<String> emailCoorientandos = professorModelo.getCoorientandos();
        List<AlunoModelo> coorientandos = new ArrayList<>();

        if (emailCoorientandos == null) {
            return new ResponseEntity<>(coorientandos, HttpStatus.OK);
        }
        
        for (String e : emailCoorientandos) {
            AlunoModelo alunoModelo = alunoRepositorio.findByEmail(e);
            if (alunoModelo != null) {
                coorientandos.add(alunoModelo);
            }
        }
        return new ResponseEntity<>(coorientandos, HttpStatus.OK);
    }

    public ResponseEntity<Iterable<AlunoModelo>> listarCoorientandosProvisorios(String email) {
       ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);
        List<String> emailCoorientandosProvisorios = professorModelo.getCoorientandosProvisorios();
        List<AlunoModelo> coorientandosProvisorios = new ArrayList<>();

        if (emailCoorientandosProvisorios == null) {
            return new ResponseEntity<>(coorientandosProvisorios, HttpStatus.OK);
        }
        
        for (String e : emailCoorientandosProvisorios) {
            AlunoModelo alunoModelo = alunoRepositorio.findByEmail(e);
            if (alunoModelo != null) {
                coorientandosProvisorios.add(alunoModelo);
            }
        }
        return new ResponseEntity<>(coorientandosProvisorios, HttpStatus.OK);
    }
}
