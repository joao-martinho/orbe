package br.furb.orbe.orientacao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import br.furb.orbe.professor.ProfessorModelo;
import br.furb.orbe.professor.ProfessorRepositorio;
import br.furb.orbe.termo.TermoModelo;
import br.furb.orbe.termo.TermoRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrientacaoServico {

    private final ProfessorRepositorio professorRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final TermoRepositorio termoRepositorio;

    public ResponseEntity<AlunoModelo> removerRelacaoProvisoria(String emailAluno) {
        if (emailAluno == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String emailAlunoNorm = emailAluno.trim().toLowerCase();
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAlunoNorm);
        if (aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        if (aluno.getOrientadorProvisorio() != null) {
            ProfessorModelo orientador = professorRepositorio.findByEmail(aluno.getOrientadorProvisorio().trim().toLowerCase());
            if (orientador != null && orientador.getOrientandosProvisorios() != null) {
                orientador.getOrientandosProvisorios().remove(emailAlunoNorm);
                professorRepositorio.save(orientador);
            }
        }

        if (aluno.getCoorientadorProvisorio() != null) {
            ProfessorModelo coorientador = professorRepositorio.findByEmail(aluno.getCoorientadorProvisorio().trim().toLowerCase());
            if (coorientador != null && coorientador.getCoorientandosProvisorios() != null) {
                coorientador.getCoorientandosProvisorios().remove(emailAlunoNorm);
                professorRepositorio.save(coorientador);
            }
        }

        aluno.setOrientadorProvisorio(null);
        aluno.setCoorientadorProvisorio(null);
        aluno.setParceiro(null);
        alunoRepositorio.save(aluno);

        TermoModelo termoModelo = termoRepositorio.findByEmailAluno(emailAlunoNorm);
        if (termoModelo != null) {
            removerTermo(termoModelo.getId());
        }

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

    public ResponseEntity<AlunoModelo> atribuirOrientadorProvisorio(String emailAluno, String emailProfessor) {
        return atribuirProvisorio(emailAluno, emailProfessor, true);
    }

    public ResponseEntity<AlunoModelo> atribuirCoorientadorProvisorio(String emailAluno, String emailProfessor) {
        return atribuirProvisorio(emailAluno, emailProfessor, false);
    }

    private ResponseEntity<AlunoModelo> atribuirProvisorio(String emailAluno, String emailProfessor, boolean orientador) {
        ProfessorModelo professor = professorRepositorio.findByEmail(emailProfessor);
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAluno);

        if (professor == null || aluno == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        List<String> listaProvisorios = orientador ? professor.getOrientandosProvisorios() : professor.getCoorientandosProvisorios();
        if (listaProvisorios == null) listaProvisorios = new ArrayList<>();

        if (!listaProvisorios.contains(emailAluno)) {
            listaProvisorios.add(emailAluno);
            if (orientador) professor.setOrientandosProvisorios(listaProvisorios);
            else professor.setCoorientandosProvisorios(listaProvisorios);
            professorRepositorio.save(professor);
        }

        if (orientador) aluno.setOrientadorProvisorio(emailProfessor);
        else aluno.setCoorientadorProvisorio(emailProfessor);

        alunoRepositorio.save(aluno);

        return new ResponseEntity<>(aluno, HttpStatus.OK);
    }

    public void aprovarTermo(TermoModelo termoModelo) {
        AlunoModelo aluno = alunoRepositorio.findByEmail(termoModelo.getEmailAluno());
        AlunoModelo parceiro = alunoRepositorio.findByEmail(termoModelo.getEmailParceiro());
        boolean coorientadorExiste = termoModelo.getEmailCoorientador() != null;

        if ("devolvido".equals(termoModelo.getStatusOrientador()) ||
            "devolvido".equals(termoModelo.getStatusCoorientador()) ||
            "devolvido".equals(termoModelo.getStatusProfessorTcc1())) {
            termoModelo.setStatusFinal("devolvido");
        } else if ("aprovado".equals(termoModelo.getStatusProfessorTcc1())) {
            termoModelo.setStatusFinal("aprovado");
        } else if (coorientadorExiste && "aprovado".equals(termoModelo.getStatusCoorientador())) {
            termoModelo.setStatusFinal("pendente");
        } else if (!coorientadorExiste && "aprovado".equals(termoModelo.getStatusOrientador())) {
            termoModelo.setStatusFinal("pendente");
        } else {
            termoModelo.setStatusFinal("pendente");
        }

        if ("aprovado".equals(termoModelo.getStatusFinal())) {
            aluno.setOrientador(termoModelo.getEmailOrientador());
            parceiro.setOrientador(termoModelo.getEmailOrientador());
            if (coorientadorExiste) {
                aluno.setCoorientador(termoModelo.getEmailCoorientador());
                this.alterarAlunoParcial(aluno.getEmail(), aluno);
                parceiro.setCoorientador(termoModelo.getEmailCoorientador());
                this.alterarAlunoParcial(parceiro.getEmail(), parceiro);
            }

            ProfessorModelo orientador = professorRepositorio.findByEmail(termoModelo.getEmailOrientador());
            orientador.getOrientandos().add(aluno.getEmail());
            this.alterarProfessorParcial(orientador.getEmail(), orientador);

            if (coorientadorExiste) {
                ProfessorModelo coorientador = professorRepositorio.findByEmail(termoModelo.getEmailCoorientador());
                coorientador.getCoorientandos().add(aluno.getEmail());
                this.alterarProfessorParcial(coorientador.getEmail(), coorientador);
            }
        }
    }

    private ResponseEntity<Void> removerTermo(Long id) {
        if (termoRepositorio.existsById(id)) {
            termoRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    private ResponseEntity<ProfessorModelo> alterarProfessorParcial(String email, ProfessorModelo professorModelo) {
        Optional<ProfessorModelo> optional = professorRepositorio.findById(email);
        if (!optional.isPresent()) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        ProfessorModelo existente = optional.get();
        if (professorModelo.getNome() != null) existente.setNome(professorModelo.getNome());
        if (professorModelo.getTelefone() != null) existente.setTelefone(professorModelo.getTelefone());
        if (professorModelo.getOrientandos() != null) existente.setOrientandos(professorModelo.getOrientandos());
        if (professorModelo.getOrientandosProvisorios() != null) existente.setOrientandosProvisorios(professorModelo.getOrientandosProvisorios());
        if (professorModelo.getCoorientandos() != null) existente.setCoorientandos(professorModelo.getCoorientandos());
        if (professorModelo.getCodigoVer() != null) existente.setCodigoVer(professorModelo.getCodigoVer());
        if (professorModelo.getPapeis() != null && !professorModelo.getPapeis().isEmpty()) existente.setPapeis(professorModelo.getPapeis());

        return new ResponseEntity<>(professorRepositorio.save(existente), HttpStatus.OK);
    }

    private void alterarAlunoParcial(String email, AlunoModelo alunoModelo) {
        Optional<AlunoModelo> optional = alunoRepositorio.findById(email);
        if (!optional.isPresent()) return;

        AlunoModelo existente = optional.get();
        if (alunoModelo.getNome() != null) existente.setNome(alunoModelo.getNome());
        if (alunoModelo.getTelefone() != null) existente.setTelefone(alunoModelo.getTelefone());
        if (alunoModelo.getOrientador() != null) existente.setOrientador(alunoModelo.getOrientador());
        if (alunoModelo.getCoorientador() != null) existente.setCoorientador(alunoModelo.getCoorientador());
        if (alunoModelo.getCurso() != null) existente.setCurso(alunoModelo.getCurso());
        if (alunoModelo.getCodigoVer() != null) existente.setCodigoVer(alunoModelo.getCodigoVer());
        if (alunoModelo.getOrientadorProvisorio() != null) this.atribuirOrientadorProvisorio(email, alunoModelo.getOrientadorProvisorio());

        alunoRepositorio.save(existente);
    }
}
