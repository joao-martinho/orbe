package br.furb.orbe.email;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/emails")
public class EmailControle {
    
    private final EmailServico emailServico;

    @PostMapping("/codigo-ver")
    public ResponseEntity<?> enviarCodigoVer(@RequestBody Map<String, String> payload) {
        return emailServico.enviarCodigoVer(payload);
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<String> verificarCodigo(@RequestBody Map<String, String> payload) {
        return emailServico.verificarCodigo(payload);
    }

}
