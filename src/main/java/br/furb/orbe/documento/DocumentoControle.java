package br.furb.orbe.documento;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/documentos")
public class DocumentoControle {

    private final DocumentoServico documentoServico;

    @GetMapping
    public ResponseEntity<List<DocumentoDTO>> listarTodas() {
        return documentoServico.listarTodas();
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<List<DocumentoDTO>> listarPorAluno(@PathVariable String email) {
        return documentoServico.listarPorAluno(email);
    }

    @PostMapping
    public ResponseEntity<DocumentoModelo> cadastrar(@PathVariable String email, @RequestBody DocumentoUploadDTO dto) throws IOException {
        return documentoServico.cadastrar(email, dto);
    }

}
