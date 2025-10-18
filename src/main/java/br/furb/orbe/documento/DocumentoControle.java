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

    @GetMapping("/{email}")
    public ResponseEntity<List<DocumentoDTO>> listarPorAutor(@PathVariable String email) {
        return documentoServico.listarPorAutor(email);
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<List<DocumentoDTO>> listarPorAluno(@PathVariable String email) {
        return documentoServico.listarPorAluno(email);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws IOException {
        return documentoServico.download(id);
    }

    @PostMapping
    public ResponseEntity<DocumentoModelo> cadastrar(@RequestBody DocumentoUploadDTO dto) throws IOException {
        return documentoServico.cadastrar(dto);
    }

}
