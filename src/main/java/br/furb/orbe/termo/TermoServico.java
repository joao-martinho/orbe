package br.furb.orbe.termo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.banca.BancaServico;
import br.furb.orbe.orientacao.OrientacaoServico;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TermoServico {

    private final OrientacaoServico orientacaoServico;  
    private final TermoRepositorio termoRepositorio;
    private final BancaServico bancaServico;

    public ResponseEntity<Iterable<TermoModelo>> listarTermos() {
        return new ResponseEntity<>(this.termoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> cadastrarTermo(TermoModelo termoModelo) {
        TermoModelo salvo = this.termoRepositorio.save(termoModelo);
        return new ResponseEntity<>(salvo, HttpStatus.CREATED);
    }

    public ResponseEntity<TermoModelo> alterarTermoTotal(Long id, TermoModelo TermoModelo) {
        Optional<TermoModelo> optional = this.termoRepositorio.findById(id);
        
        if (optional.isPresent()) {
            TermoModelo.setId(id);
            return new ResponseEntity<>(this.termoRepositorio.save(TermoModelo), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<TermoModelo> alterarTermoParcial(Long id, TermoModelo termoModelo) {
        Optional<TermoModelo> optional = termoRepositorio.findById(id);

        if (!optional.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        TermoModelo termoExistente = optional.get();

        if (termoModelo.getId() != null) termoExistente.setId(termoModelo.getId());
        if (termoModelo.getTitulo() != null) termoExistente.setTitulo(termoModelo.getTitulo());
        if (termoModelo.getEmailAluno() != null) termoExistente.setEmailAluno(termoModelo.getEmailAluno());
        if (termoModelo.getNomeAluno() != null) termoExistente.setNomeAluno(termoModelo.getNomeAluno());
        if (termoModelo.getTelefoneAluno() != null) termoExistente.setTelefoneAluno(termoModelo.getTelefoneAluno());
        if (termoModelo.getCursoAluno() != null) termoExistente.setCursoAluno(termoModelo.getCursoAluno());
        if (termoModelo.getEmailOrientador() != null) termoExistente.setEmailOrientador(termoModelo.getEmailOrientador());
        if (termoModelo.getEmailCoorientador() != null) termoExistente.setEmailCoorientador(termoModelo.getEmailCoorientador());
        if (termoModelo.getEmailParceiro() != null) termoExistente.setEmailParceiro(termoModelo.getEmailParceiro());
        if (termoModelo.getNomeParceiro() != null) termoExistente.setNomeParceiro(termoModelo.getNomeParceiro());
        if (termoModelo.getPerfilCoorientador() != null) termoExistente.setPerfilCoorientador(termoModelo.getPerfilCoorientador());
        if (termoModelo.getAno() != null) termoExistente.setAno(termoModelo.getAno());
        if (termoModelo.getSemestre() != null) termoExistente.setSemestre(termoModelo.getSemestre());
        if (termoModelo.getResumo() != null) termoExistente.setResumo(termoModelo.getResumo());
        if (termoModelo.getCriadoEm() != null) termoExistente.setCriadoEm(termoModelo.getCriadoEm());
        if (termoModelo.getStatusOrientador() != null) termoExistente.setStatusOrientador(termoModelo.getStatusOrientador());
        if (termoModelo.getStatusCoorientador() != null) termoExistente.setStatusCoorientador(termoModelo.getStatusCoorientador());
        if (termoModelo.getStatusProfessorTcc1() != null) termoExistente.setStatusProfessorTcc1(termoModelo.getStatusProfessorTcc1());
        if (termoModelo.getStatusFinal() != null) termoExistente.setStatusFinal(termoModelo.getStatusFinal());
        if (termoModelo.getComentario() != null) termoExistente.setComentario(termoModelo.getComentario());

        if ("devolvido".equals(termoExistente.getStatusOrientador()) ||
            "devolvido".equals(termoExistente.getStatusCoorientador()) ||
            "devolvido".equals(termoExistente.getStatusProfessorTcc1())) {
            termoExistente.setStatusFinal("devolvido");
        } else if ("aprovado".equals(termoExistente.getStatusProfessorTcc1())) {
            termoExistente.setStatusFinal("aprovado");
        } else {
            termoExistente.setStatusFinal("pendente");
        }

        TermoModelo salvo = termoRepositorio.save(termoExistente);

        if ("aprovado".equals(termoExistente.getStatusFinal()) || "devolvido".equals(termoExistente.getStatusFinal())) {
            orientacaoServico.aprovarTermo(termoExistente);
            if ("aprovado".equals(termoExistente.getStatusFinal())) {
                bancaServico.criarAPartirDoTermo(salvo);
            }

            List<String> emailsProfessores = new ArrayList<>();
            if (termoExistente.getEmailOrientador() != null) {
                emailsProfessores.add(termoExistente.getEmailOrientador());
            }
            if (termoExistente.getEmailCoorientador() != null) {
                emailsProfessores.add(termoExistente.getEmailCoorientador());
            }
        }

        return new ResponseEntity<>(salvo, HttpStatus.OK);
    }

    public ResponseEntity<Void> removerTermo(Long id) {
        boolean existeid = this.termoRepositorio.existsById(id);

        if (existeid) {
            this.termoRepositorio.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<TermoModelo> buscarTermo(Long id) {
        boolean existeId = this.termoRepositorio.existsById(id);

        if (existeId) {
            Optional<TermoModelo> optional = this.termoRepositorio.findById(id);

            TermoModelo TermoModelo = optional.get();

            return new ResponseEntity<>(TermoModelo, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public ResponseEntity<Void> removerTodos() {
        this.termoRepositorio.truncateTable();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> buscarPorEmailAluno(String email) {
        TermoModelo termoModelo = this.termoRepositorio.findByEmailAlunoOrEmailParceiro(email);

        return new ResponseEntity<>(termoModelo, HttpStatus.OK);
    }

    public ResponseEntity<List<TermoModelo>> buscarPorEmailProfessor(String email) {
        List<TermoModelo> termoModelos = this.termoRepositorio.findByEmailOrientador(email);
        termoModelos.addAll(this.termoRepositorio.findByEmailCoorientador(email));

        return new ResponseEntity<>(termoModelos, HttpStatus.OK);
    }

}
