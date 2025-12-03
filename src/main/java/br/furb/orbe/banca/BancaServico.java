package br.furb.orbe.banca;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.professor.PapelProfessor;
import br.furb.orbe.professor.ProfessorModelo;
import br.furb.orbe.professor.ProfessorRepositorio;
import br.furb.orbe.termo.TermoModelo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BancaServico {

    private final BancaRepositorio bancaRepositorio;
    private final ProfessorRepositorio professorRepositorio;

    public ResponseEntity<Iterable<BancaModelo>> listarBancas() {
        return new ResponseEntity<>(bancaRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<BancaModelo> cadastrarBanca(BancaModelo bancaModelo) {
        return new ResponseEntity<>(bancaRepositorio.save(bancaModelo), HttpStatus.CREATED);
    }

    public ResponseEntity<BancaModelo> alterarBancaTotal(Long id, BancaModelo bancaModelo) {
        Optional<BancaModelo> optional = bancaRepositorio.findById(id);

        if (optional.isPresent()) {
            bancaModelo.setId(id);
            return new ResponseEntity<>(bancaRepositorio.save(bancaModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<BancaModelo> alterarBancaParcial(Long id, BancaModelo bancaModelo) {
        Optional<BancaModelo> optional = bancaRepositorio.findById(id);

        if (optional.isPresent()) {
            BancaModelo existente = optional.get();

            if (bancaModelo.getId() != null) existente.setId(bancaModelo.getId());
            if (bancaModelo.getEmailAluno1() != null) existente.setEmailAluno1(bancaModelo.getEmailAluno1());
            if (bancaModelo.getEmailAluno1() != null) existente.setEmailAluno2(bancaModelo.getEmailAluno2());
            if (bancaModelo.getEmailOrientador() != null) existente.setEmailOrientador(bancaModelo.getEmailOrientador());
            if (bancaModelo.getEmailCoorientador() != null) existente.setEmailCoorientador(bancaModelo.getEmailCoorientador());
            if (bancaModelo.getTipo() != null) existente.setTipo(bancaModelo.getTipo());
            if (bancaModelo.getCurso() != null) existente.setCurso(bancaModelo.getCurso());
            if (bancaModelo.getTitulo() != null) existente.setTitulo(bancaModelo.getTitulo());
            if (bancaModelo.getResumo() != null) existente.setResumo(bancaModelo.getResumo());
            if (bancaModelo.getEmailAvaliador() != null) existente.setEmailAvaliador(bancaModelo.getEmailAvaliador());
            if (bancaModelo.getData() != null) existente.setData(bancaModelo.getData());
            if (bancaModelo.getHora() != null) existente.setHora(bancaModelo.getHora());
            if (bancaModelo.getNotaAvaliadorPreProjeto() != null) existente.setNotaAvaliadorPreProjeto(bancaModelo.getNotaAvaliadorPreProjeto());
            if (bancaModelo.getNotaProfTcc1PreProjeto() != null) existente.setNotaProfTcc1PreProjeto(bancaModelo.getNotaProfTcc1PreProjeto());
            if (bancaModelo.getNotaDefesaQualificacao() != null) existente.setNotaDefesaQualificacao(bancaModelo.getNotaDefesaQualificacao());
            if (bancaModelo.getNotaAvaliadorProjeto() != null) existente.setNotaAvaliadorProjeto(bancaModelo.getNotaAvaliadorProjeto());
            if (bancaModelo.getNotaProfTcc1Projeto() != null) existente.setNotaProfTcc1Projeto(bancaModelo.getNotaProfTcc1Projeto());
            if (bancaModelo.getMediaFinal() != null) existente.setMediaFinal(bancaModelo.getMediaFinal());
            if (bancaModelo.getStatus() != null) existente.setStatus(bancaModelo.getStatus());
            if (bancaModelo.isMarcada()) existente.setMarcada(bancaModelo.isMarcada());
            if (bancaModelo.getNomeArquivoPreProjeto() != null) existente.setNomeArquivoPreProjeto(bancaModelo.getNomeArquivoPreProjeto());
            if (bancaModelo.getArquivoPreProjeto() != null) existente.setArquivoPreProjeto(bancaModelo.getArquivoPreProjeto());
            if (bancaModelo.getNomeArquivoProjeto() != null) existente.setNomeArquivoProjeto(bancaModelo.getNomeArquivoProjeto());
            if (bancaModelo.getArquivoProjeto() != null) existente.setArquivoProjeto(bancaModelo.getArquivoProjeto());
            if (bancaModelo.getNomeArquivoParecerAvaliador() != null) existente.setNomeArquivoParecerAvaliador(bancaModelo.getNomeArquivoParecerAvaliador());
            if (bancaModelo.getArquivoParecerAvaliador() != null) existente.setArquivoParecerAvaliador(bancaModelo.getArquivoParecerAvaliador());
            if (bancaModelo.getNomeArquivoParecerProfTcc1() != null) existente.setNomeArquivoParecerProfTcc1(bancaModelo.getNomeArquivoParecerProfTcc1());
            if (bancaModelo.getArquivoParecerProfTcc1() != null) existente.setArquivoParecerProfTcc1(bancaModelo.getArquivoParecerProfTcc1());

            BancaModelo salvo = bancaRepositorio.save(existente);

            return new ResponseEntity<>(salvo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerBanca(Long id) {
        if (bancaRepositorio.existsById(id)) {
            bancaRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        bancaRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<BancaModelo> buscarBanca(Long id) {
        Optional<BancaModelo> optional = bancaRepositorio.findById(id);
        return optional.map(Banca -> new ResponseEntity<>(Banca, HttpStatus.OK))
                       .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public void criarAPartirDoTermo(TermoModelo termoModelo) {
        BancaModelo bancaModelo = new BancaModelo();

        bancaModelo.setEmailAluno1(termoModelo.getEmailAluno());
        if (termoModelo.getEmailParceiro() != null) { bancaModelo.setEmailAluno2(termoModelo.getEmailParceiro()); }
        bancaModelo.setEmailOrientador(termoModelo.getEmailOrientador());
        if (termoModelo.getEmailCoorientador() != null) { bancaModelo.setEmailCoorientador(termoModelo.getEmailCoorientador()); }
        bancaModelo.setTipo(termoModelo.getTipo());
        bancaModelo.setCurso(termoModelo.getCursoAluno());
        bancaModelo.setTitulo(termoModelo.getTitulo());
        bancaModelo.setResumo(termoModelo.getResumo());
        bancaModelo.setStatus("pendente");

        List<ProfessorModelo> professores = professorRepositorio.findAll();
        for (ProfessorModelo p : professores) {
            if ("BCC".equals(termoModelo.getCursoAluno())) {
                if (p.getPapeis().stream()
                        .anyMatch(papel -> papel.name().equals("PROF_TCC1_BCC"))) {
                    bancaModelo.setEmailProfTcc1(p.getEmail());
                    break;
                }
            } else if ("SIS".equals(termoModelo.getCursoAluno())) {
                if (p.getPapeis().stream()
                        .anyMatch(papel -> papel.name().equals("PROF_TCC1_SIS"))) {
                    bancaModelo.setEmailProfTcc1(p.getEmail());
                    break;
                }
            }
        }

        bancaRepositorio.save(bancaModelo);
    }

    public ResponseEntity<BancaModelo> buscarPorAluno(String email) {
        Optional<BancaModelo> optional = bancaRepositorio.findByEmailAluno1(email);
        return optional.map(Banca -> new ResponseEntity<>(Banca, HttpStatus.OK))
                       .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

}
