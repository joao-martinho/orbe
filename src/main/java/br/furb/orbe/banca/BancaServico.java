package br.furb.orbe.banca;

import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import br.furb.orbe.notificacao.NotificacaoModelo;
import br.furb.orbe.notificacao.NotificacaoServico;
import br.furb.orbe.termo.TermoModelo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BancaServico {

    private final BancaRepositorio bancaRepositorio;
    private final NotificacaoServico notificacaoServico;
    private final AlunoRepositorio alunoRepositorio;

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
            if (bancaModelo.getEmailAluno() != null) existente.setEmailAluno(bancaModelo.getEmailAluno());
            if (bancaModelo.getEmailOrientador() != null) existente.setEmailOrientador(bancaModelo.getEmailOrientador());
            if (bancaModelo.getEmailCoorientador() != null) existente.setEmailCoorientador(bancaModelo.getEmailCoorientador());
            if (bancaModelo.getCurso() != null) existente.setCurso(bancaModelo.getCurso());
            if (bancaModelo.getTitulo() != null) existente.setTitulo(bancaModelo.getTitulo());
            if (bancaModelo.getResumo() != null) existente.setResumo(bancaModelo.getResumo());
            if (bancaModelo.getEmailProfessor1() != null) existente.setEmailProfessor1(bancaModelo.getEmailProfessor1());
            if (bancaModelo.getEmailProfessor2() != null) existente.setEmailProfessor2(bancaModelo.getEmailProfessor2());
            if (bancaModelo.getEmailProfessor3() != null) existente.setEmailProfessor3(bancaModelo.getEmailProfessor3());
            if (bancaModelo.getNota1() != null) existente.setNota1(bancaModelo.getNota1());
            if (bancaModelo.getNota2() != null) existente.setNota2(bancaModelo.getNota2());
            if (bancaModelo.getNota3() != null) existente.setNota3(bancaModelo.getNota3());
            if (bancaModelo.getMediaFinal() != null) existente.setMediaFinal(bancaModelo.getMediaFinal());

            boolean dataMarcadaAgora = bancaModelo.getData() != null && !bancaModelo.getData().equals(existente.getData());
            if (bancaModelo.getData() != null) existente.setData(bancaModelo.getData());
            if (bancaModelo.getHora() != null) existente.setHora(bancaModelo.getHora());

            existente.setMarcada(bancaModelo.isMarcada());

            BancaModelo salvo = bancaRepositorio.save(existente);

            if (dataMarcadaAgora && salvo.isMarcada()) {
                Set<String> emails = new HashSet<>();
                emails.add(salvo.getEmailAluno());
                emails.add(salvo.getEmailOrientador());
                if (salvo.getEmailCoorientador() != null) emails.add(salvo.getEmailCoorientador());
                if (salvo.getEmailProfessor1() != null) emails.add(salvo.getEmailProfessor1());
                if (salvo.getEmailProfessor2() != null) emails.add(salvo.getEmailProfessor2());
                if (salvo.getEmailProfessor3() != null) emails.add(salvo.getEmailProfessor3());

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                AlunoModelo alunoModelo = alunoRepositorio.findByEmail(bancaModelo.getEmailAluno());

                for (String email : emails) {
                    
                    NotificacaoModelo notificacao = new NotificacaoModelo();
                    notificacao.setEmailDestinatario(email);
                    notificacao.setTitulo("Apresentação marcada");
                    notificacao.setConteudo("A apresentação do trabalho \"" + salvo.getTitulo() +
                        "\", do aluno ou aluna " + alunoModelo.getNome() + ", foi marcada para " + 
                        salvo.getData().format(formatter) + " às " + salvo.getHora() + ".");
                    notificacaoServico.cadastrarMensagem(notificacao);
                }
            }

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

        bancaModelo.setEmailAluno(termoModelo.getEmailAluno());
        bancaModelo.setEmailOrientador(termoModelo.getEmailOrientador());
        bancaModelo.setEmailCoorientador(termoModelo.getEmailCoorientador());
        bancaModelo.setCurso(termoModelo.getCursoAluno());
        bancaModelo.setTitulo(termoModelo.getTitulo());
        bancaModelo.setResumo(termoModelo.getResumo());

        bancaRepositorio.save(bancaModelo);
    }

    public ResponseEntity<BancaModelo> buscarPorAluno(String email) {
        Optional<BancaModelo> optional = bancaRepositorio.findByEmailAluno(email);
        return optional.map(Banca -> new ResponseEntity<>(Banca, HttpStatus.OK))
                       .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

}
