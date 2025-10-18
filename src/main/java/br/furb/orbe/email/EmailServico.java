package br.furb.orbe.email;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import br.furb.orbe.professor.ProfessorModelo;
import br.furb.orbe.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServico {
    
    @Autowired
    private final JavaMailSender javaMailSender;
    private final AlunoRepositorio alunoRepositorio;
    private final ProfessorRepositorio professorRepositorio;

    public ResponseEntity<?> enviarCodigoVer(Map<String, String> payload) {
        String destinatario = payload.get("destinatario");
        String tipo = payload.get("tipo");
        Instant instant = Instant.parse(payload.get("criadoEm"));
        LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
        
        if (tipo.equals("Aluno")) {
            AlunoModelo alunoModelo = alunoRepositorio.findByEmail(destinatario);
            if (alunoModelo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
            }

            Integer codigoVer = ThreadLocalRandom.current().nextInt(1000, 10000);

            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setTo(destinatario);
            mensagem.setSubject("Seu código de verificação do Orbe");
            mensagem.setText("Use o código " + codigoVer + " para autenticar-se no Orbe.");
            javaMailSender.send(mensagem);

            alunoModelo.setCodigoVer(codigoVer.toString());
            alunoModelo.setCriadoEm(localDateTime);
            alunoRepositorio.save(alunoModelo);
        }
        else if (tipo.equals("Professor")) {
            ProfessorModelo professorModelo = professorRepositorio.findByEmail(destinatario);
            if (professorModelo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
            }

            Integer codigoVer = ThreadLocalRandom.current().nextInt(1000, 10000);

            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setTo(destinatario);
            mensagem.setSubject("Seu código de verificação do Orbe");
            mensagem.setText("Use o código " + codigoVer + " para autenticar-se no Orbe.");
            javaMailSender.send(mensagem);

            professorModelo.setCodigoVer(codigoVer.toString());
            professorModelo.setCriadoEm(localDateTime);
            professorRepositorio.save(professorModelo);
        }
        
        return ResponseEntity.ok("Código de verificação enviado.");
    }

    public ResponseEntity<String> verificarCodigo(Map<String, String> payload) {
        String email = payload.get("email");
        String tipo = payload.get("tipo");
        String codigoDigitado = payload.get("codigoDigitado");

        if (tipo.equals("Aluno")) {
            AlunoModelo alunoModelo = alunoRepositorio.findByEmail(email);
            if (alunoModelo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
            }

            String codigoVer = alunoModelo.getCodigoVer();
            if (codigoVer == null || !codigoVer.equals(codigoDigitado)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido!");
            }

            LocalDateTime criadoEm = alunoModelo.getCriadoEm();
            if (criadoEm == null || criadoEm.isBefore(LocalDateTime.now().minusMinutes(10))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código expirado!");
            }
        }
        else if (tipo.equals("Professor")) {
            ProfessorModelo professorModelo = professorRepositorio.findByEmail(email);
            if (professorModelo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email não encontrado.");
            }

            String codigoVer = professorModelo.getCodigoVer();
            if (codigoVer == null || !codigoVer.equals(codigoDigitado)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código inválido!");
            }

            LocalDateTime criadoEm = professorModelo.getCriadoEm();
            if (criadoEm == null || criadoEm.isBefore(LocalDateTime.now().minusMinutes(10))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Código expirado!");
            }
        }

        return ResponseEntity.ok("Código verificado com sucesso.");
    }

}
