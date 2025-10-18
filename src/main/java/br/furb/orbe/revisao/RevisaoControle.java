package br.furb.orbe.revisao;

import java.io.IOException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/revisoes")
public class RevisaoControle {

    private final RevisaoServico revisaoServico;

    @GetMapping
    public ResponseEntity<List<RevisaoDTO>> listarTodas() {
        return revisaoServico.listarTodas();
    }

    @GetMapping("/professor/{email}")
    public ResponseEntity<List<RevisaoDTO>> listarPorProfessor(@PathVariable String email) {
        return revisaoServico.listarPorProfessor(email);
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<List<RevisaoDTO>> listarPorAluno(@PathVariable String email) {
        return revisaoServico.listarPorAluno(email);
    }

    @PostMapping("/professor/{email}")
    public ResponseEntity<RevisaoModelo> cadastrar(@PathVariable String email, @RequestBody RevisaoUploadDTO dto) throws IOException {
        return revisaoServico.cadastrar(email, dto);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws IOException {
        return revisaoServico.download(id);
    }
}
