package br.furb.orbe.entrega;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EntregaServico {

    private final EntregaRepositorio entregaRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final Path diretorio = Paths.get("uploads/entregas");

    public ResponseEntity<EntregaModelo> cadastrarAluno(String email, EntregaUploadDTO dto) throws IOException {
        AlunoModelo aluno = alunoRepositorio.findByEmail(email);

        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytes = Base64.getDecoder().decode(dto.getArquivoBase64());
        Path destino = diretorio.resolve(dto.getNomeArquivo());
        Files.write(destino, bytes);

        EntregaModelo entrega = new EntregaModelo();
        entrega.setTitulo(dto.getTitulo());
        entrega.setEmailAutor(email);
        entrega.setEmailOrientador(aluno.getOrientador());
        entrega.setEmailCoorientador(aluno.getCoorientador());
        entrega.setNomeArquivo(dto.getNomeArquivo());
        entrega.setArquivoBase64(dto.getArquivoBase64());

        EntregaModelo salvo = entregaRepositorio.save(entrega);

        return ResponseEntity.status(201).body(salvo);
    }

    public ResponseEntity<EntregaModelo> cadastrarProfessor(String email, EntregaUploadDTO dto) throws IOException {

        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytes = Base64.getDecoder().decode(dto.getArquivoBase64());
        Path destino = diretorio.resolve(dto.getNomeArquivo());
        Files.write(destino, bytes);

        EntregaModelo entrega = new EntregaModelo();
        entrega.setTitulo(dto.getTitulo());
        entrega.setEmailAutor(email);
        entrega.setEmailOrientador(null);
        entrega.setEmailCoorientador(null);
        entrega.setNomeArquivo(dto.getNomeArquivo());
        entrega.setArquivoBase64(dto.getArquivoBase64());

        EntregaModelo salvo = entregaRepositorio.save(entrega);

        return ResponseEntity.status(201).body(salvo);
    }

    public ResponseEntity<byte[]> download(Long id) throws IOException {
        EntregaModelo entregaModelo = entregaRepositorio.findById(id).orElse(null);
        if (entregaModelo == null) return ResponseEntity.notFound().build();

        Path arquivo = diretorio.resolve(entregaModelo.getNomeArquivo());
        byte[] conteudo = Files.readAllBytes(arquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + entregaModelo.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(conteudo);
    }

    public ResponseEntity<List<EntregaDTO>> listarPorAluno(String email) {
        List<EntregaDTO> dtos = entregaRepositorio.findByEmailAutor(email).stream()
            .map(EntregaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<List<EntregaDTO>> listarTodas() {
        List<EntregaDTO> dtos = entregaRepositorio.findAll().stream()
            .map(EntregaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<List<EntregaDTO>> listarPorProfessor(String email) {
        List<EntregaDTO> dtos = entregaRepositorio.findByEmailOrientadorOrEmailCoorientador(email, email).stream()
            .map(EntregaDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
