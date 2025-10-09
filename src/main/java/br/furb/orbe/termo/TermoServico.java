package br.furb.orbe.termo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.banca.BancaServico;
import br.furb.orbe.notificacao.NotificacaoModelo;
import br.furb.orbe.notificacao.NotificacaoServico;
import br.furb.orbe.orientacao.OrientacaoServico;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TermoServico {

    private final OrientacaoServico orientacaoServico;  
    private final TermoRepositorio termoRepositorio;
    private final NotificacaoServico notificacaoServico;
    private final BancaServico bancaServico;

    public ResponseEntity<Iterable<TermoModelo>> listarTermos() {
        return new ResponseEntity<>(this.termoRepositorio.findAll(), HttpStatus.OK);
    }

    public ResponseEntity<TermoModelo> cadastrarTermo(TermoModelo termoModelo) {
        TermoModelo salvo = this.termoRepositorio.save(termoModelo);

        NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
        notificacaoAluno.setEmailDestinatario(termoModelo.getEmailAluno());
        notificacaoAluno.setTitulo("Termo de compromisso enviado");
        notificacaoAluno.setConteudo("Você enviou o termo de compromisso. Aguarde a resposta do seu orientador.");
        notificacaoServico.cadastrarMensagem(notificacaoAluno);

        NotificacaoModelo notificacaoOrientador = new NotificacaoModelo();
        notificacaoOrientador.setEmailDestinatario(termoModelo.getEmailOrientador());
        notificacaoOrientador.setTitulo("Termo de compromisso recebido");
        notificacaoOrientador.setConteudo(
                termoModelo.getNomeAluno() + " enviou o termo de compromisso e aguarda a sua resposta."
        );
        notificacaoServico.cadastrarMensagem(notificacaoOrientador);

        if (termoModelo.getEmailCoorientador() != null) {
            notificacaoOrientador.setEmailDestinatario(termoModelo.getEmailCoorientador());
            notificacaoServico.cadastrarMensagem(notificacaoOrientador);
        }

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

            String tituloAluno = "aprovado".equals(termoExistente.getStatusFinal()) ? "Termo aprovado 🎉" : "Termo devolvido 🙁";
            String conteudoAluno = "aprovado".equals(termoExistente.getStatusFinal()) ?
                    "O seu termo de compromisso foi aprovado." :
                    "O seu termo de compromisso foi devolvido. Verifique a seção \"comentário\" na página do termo ou converse com o seu orientador.";

            NotificacaoModelo notificacaoAluno = new NotificacaoModelo();
            notificacaoAluno.setEmailDestinatario(termoExistente.getEmailAluno());
            notificacaoAluno.setTitulo(tituloAluno);
            notificacaoAluno.setConteudo(conteudoAluno);
            notificacaoServico.cadastrarMensagem(notificacaoAluno);

            List<String> emailsProfessores = new ArrayList<>();
            if (termoExistente.getEmailOrientador() != null) {
                emailsProfessores.add(termoExistente.getEmailOrientador());
            }
            if (termoExistente.getEmailCoorientador() != null) {
                emailsProfessores.add(termoExistente.getEmailCoorientador());
            }

            for (String email : emailsProfessores) {
                NotificacaoModelo notificacaoProf = new NotificacaoModelo();
                notificacaoProf.setEmailDestinatario(email);
                notificacaoProf.setTitulo("aprovado".equals(termoExistente.getStatusFinal()) ? "Termo aprovado" : "Termo devolvido");
                notificacaoProf.setConteudo("O termo de compromisso do aluno " + termoExistente.getNomeAluno() + (" foi aprovado".equals(termoExistente.getStatusFinal()) ? "aprovado." : "devolvido."));
                notificacaoServico.cadastrarMensagem(notificacaoProf);
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
        TermoModelo termoModelo = this.termoRepositorio.findByEmailAluno(email);

        return new ResponseEntity<>(termoModelo, HttpStatus.OK);
    }

    public ResponseEntity<List<TermoModelo>> buscarPorEmailProfessor(String email) {
        List<TermoModelo> termoModelos = this.termoRepositorio.findByEmailOrientador(email);
        termoModelos.addAll(this.termoRepositorio.findByEmailCoorientador(email));

        return new ResponseEntity<>(termoModelos, HttpStatus.OK);
    }

}
