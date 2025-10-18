package br.furb.orbe.entrega;

import java.io.IOException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/entregas")
public class EntregaControle {

    private final EntregaServico entregaServico;

    @GetMapping
    public ResponseEntity<List<EntregaDTO>> listarTodas() {
        return entregaServico.listarTodas();
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<List<EntregaDTO>> listarPorAluno(@PathVariable String email) {
        return entregaServico.listarPorAluno(email);
    }

    @GetMapping("/professor/{email}")
    public ResponseEntity<List<EntregaDTO>> listarPorProfessor(@PathVariable String email) {
        return entregaServico.listarPorProfessor(email);
    }

    @PostMapping("/aluno/{email}")
    public ResponseEntity<EntregaModelo> cadastrarAluno(@PathVariable String email, @RequestBody EntregaUploadDTO dto) throws IOException {
        return entregaServico.cadastrarAluno(email, dto);
    }

    @PostMapping("/professor/{email}")
    public ResponseEntity<EntregaModelo> cadastrarProfessor(@PathVariable String email, @RequestBody EntregaUploadDTO dto) throws IOException {
        return entregaServico.cadastrarProfessor(email, dto);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws IOException {
        return entregaServico.download(id);
    }
}
