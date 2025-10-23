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
        if (emailAluno == null) return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

        String emailAlunoNorm = emailAluno.trim().toLowerCase();
        AlunoModelo aluno = alunoRepositorio.findByEmail(emailAlunoNorm);
        AlunoModelo parceiro = null;
        String emailParceiroNorm = null;

        if (aluno.getParceiro() != null) {
            parceiro = alunoRepositorio.findByEmail(aluno.getParceiro());
            if (parceiro != null) emailParceiroNorm = parceiro.getEmail().trim().toLowerCase();
        }

        if (aluno.getOrientadorProvisorio() != null) {
            ProfessorModelo orientador = professorRepositorio.findByEmail(aluno.getOrientadorProvisorio().trim().toLowerCase());
            if (orientador != null && orientador.getOrientandosProvisorios() != null) {
                orientador.getOrientandosProvisorios().remove(emailAlunoNorm);
                if (emailParceiroNorm != null) orientador.getOrientandosProvisorios().remove(emailParceiroNorm);
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
        if (termoModelo != null) removerTermo(termoModelo.getId());

        if (parceiro != null) {
            parceiro.setOrientadorProvisorio(null);
            parceiro.setCoorientadorProvisorio(null);
            parceiro.setParceiro(null);
            alunoRepositorio.save(parceiro);
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

        if (professor == null || aluno == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

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
        AlunoModelo parceiro = termoModelo.getEmailParceiro() != null ? alunoRepositorio.findByEmail(termoModelo.getEmailParceiro()) : null;
        boolean coorientadorExiste = termoModelo.getEmailCoorientador() != null;

        // Definir status final
        if ("devolvido".equals(termoModelo.getStatusOrientador()) ||
            "devolvido".equals(termoModelo.getStatusCoorientador()) ||
            "devolvido".equals(termoModelo.getStatusProfessorTcc1())) {
            termoModelo.setStatusFinal("devolvido");
        } else if ("aprovado".equals(termoModelo.getStatusProfessorTcc1())) {
            termoModelo.setStatusFinal("aprovado");
        } else {
            termoModelo.setStatusFinal("pendente");
        }

        if ("aprovado".equals(termoModelo.getStatusFinal())) {
            if (aluno != null) aluno.setOrientador(termoModelo.getEmailOrientador());
            if (parceiro != null) parceiro.setOrientador(termoModelo.getEmailOrientador());

            if (coorientadorExiste) {
                if (aluno != null) {
                    aluno.setCoorientador(termoModelo.getEmailCoorientador());
                    this.alterarAlunoParcial(aluno.getEmail(), aluno);
                }
                if (parceiro != null) {
                    parceiro.setCoorientador(termoModelo.getEmailCoorientador());
                    this.alterarAlunoParcial(parceiro.getEmail(), parceiro);
                }
            } else {
                if (aluno != null) this.alterarAlunoParcial(aluno.getEmail(), aluno);
                if (parceiro != null) this.alterarAlunoParcial(parceiro.getEmail(), parceiro);
            }

            // Atualiza orientador
            if (aluno != null) {
                ProfessorModelo orientador = professorRepositorio.findByEmail(termoModelo.getEmailOrientador());
                if (orientador != null) {
                    orientador.getOrientandos().add(aluno.getEmail());
                    this.alterarProfessorParcial(orientador.getEmail(), orientador);
                }
            }

            // Atualiza coorientador
            if (coorientadorExiste && aluno != null) {
                ProfessorModelo coorientador = professorRepositorio.findByEmail(termoModelo.getEmailCoorientador());
                if (coorientador != null) {
                    coorientador.getCoorientandos().add(aluno.getEmail());
                    this.alterarProfessorParcial(coorientador.getEmail(), coorientador);
                }
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
