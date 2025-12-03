package br.furb.orbe.documento;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.*;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentoServico {
    private final DocumentoRepositorio documentoRepositorio;
    private final Path diretorio = Paths.get("uploads/documentos");

    public ResponseEntity<DocumentoModelo> cadastrar(DocumentoUploadDTO dto) throws IOException {
        if (!Files.exists(diretorio)) Files.createDirectories(diretorio);

        byte[] bytes = Base64.getDecoder().decode(dto.getArquivoBase64());
        Path destino = diretorio.resolve(dto.getNomeArquivo());
        Files.write(destino, bytes);

        DocumentoModelo Documento = new DocumentoModelo();
        Documento.setTitulo(dto.getTitulo());
        Documento.setEmailAutor(dto.getEmailAutor());
        Documento.setEmailAluno(dto.getEmailAluno());
        Documento.setNomeArquivo(dto.getNomeArquivo());
        Documento.setArquivoBase64(dto.getArquivoBase64());
        Documento.setProfTcc1(dto.isProfTcc1());

        DocumentoModelo salvo = documentoRepositorio.save(Documento);
        
        return ResponseEntity.status(201).body(salvo);
    }

    public ResponseEntity<byte[]> download(Long id) throws IOException {
        DocumentoModelo documento = documentoRepositorio.findById(id)
            .orElseThrow(() -> new RuntimeException("Documento não encontrado."));

        Path arquivo = diretorio.resolve(documento.getNomeArquivo());
        byte[] conteudo = Files.readAllBytes(arquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documento.getNomeArquivo() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(conteudo);
    }


    public ResponseEntity<List<DocumentoDTO>> listarTodas() {
        List<DocumentoDTO> dtos = documentoRepositorio.findAll().stream()
            .map(DocumentoDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<List<DocumentoDTO>> listarPorAutor(String email) {
        List<DocumentoDTO> dtos = documentoRepositorio.findByEmailAutor(email).stream()
            .map(DocumentoDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    public ResponseEntity<List<DocumentoDTO>> listarPorAluno(String email) {
        List<DocumentoDTO> dtos = documentoRepositorio.findByEmailAluno(email).stream()
            .map(DocumentoDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}