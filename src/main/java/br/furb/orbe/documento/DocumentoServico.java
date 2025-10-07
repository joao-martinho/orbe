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

import br.furb.orbe.aluno.AlunoModelo;
import br.furb.orbe.aluno.AlunoRepositorio;
import br.furb.orbe.notificacao.NotificacaoModelo;
import br.furb.orbe.notificacao.NotificacaoServico;
import br.furb.orbe.professor.PapelProfessor;
import br.furb.orbe.professor.ProfessorModelo;
import br.furb.orbe.professor.ProfessorRepositorio;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentoServico {
    private final NotificacaoServico notificacaoServico;
    private final DocumentoRepositorio documentoRepositorio;
    private final AlunoRepositorio alunoRepositorio;
    private final ProfessorRepositorio professorRepositorio;
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

        ProfessorModelo autor = professorRepositorio.findByEmail(dto.getEmailAutor());
        AlunoModelo alunoModelo = alunoRepositorio.findByEmail(salvo.getEmailAluno());
        ProfessorModelo orientador = professorRepositorio.findByEmail(alunoModelo.getOrientador());
        List<ProfessorModelo> professorModelos = professorRepositorio.findAll();
        ProfessorModelo profTcc1 = new ProfessorModelo();

        for (ProfessorModelo p: professorModelos) {
            if (p.getPapeis().contains(PapelProfessor.PROF_TCC1)) {
                profTcc1 = p;
                break;
            }
        }

        NotificacaoModelo notificacaoModelo = new NotificacaoModelo();

        if (profTcc1.getEmail().equals(orientador.getEmail())) {
            notificacaoModelo.setEmailDestinatario(profTcc1.getEmail());
            notificacaoModelo.setTitulo("Documento enviado");
            notificacaoModelo.setConteudo(
                "O documento \"" + dto.getTitulo() + "\" foi enviado com sucesso."
            );

            notificacaoServico.cadastrarMensagem(notificacaoModelo);
        }
        else if (autor.getEmail().equals(profTcc1.getEmail())) {
            notificacaoModelo.setEmailDestinatario(orientador.getEmail());
            notificacaoModelo.setTitulo("Documento recebido");
            notificacaoModelo.setConteudo(
                "Você recebeu um novo documento: \"" + dto.getTitulo() + "\", referente ao aluno " + alunoModelo.getNome() + "."
            );

            notificacaoServico.cadastrarMensagem(notificacaoModelo);

            notificacaoModelo.setEmailDestinatario(profTcc1.getEmail());
            notificacaoModelo.setTitulo("Documento enviado");
            notificacaoModelo.setConteudo(
                "O documento \"" + dto.getTitulo() + "\" foi enviado com sucesso."
            );

            notificacaoServico.cadastrarMensagem(notificacaoModelo);
            
        }
        else if (autor.getEmail().equals(orientador.getEmail())) {
            notificacaoModelo.setEmailDestinatario(orientador.getEmail());
            notificacaoModelo.setTitulo("Documento enviado");
            notificacaoModelo.setConteudo(
                "O documento \"" + dto.getTitulo() + "\" foi enviado com sucesso."
            );

            notificacaoServico.cadastrarMensagem(notificacaoModelo);

            notificacaoModelo.setEmailDestinatario(profTcc1.getEmail());
            notificacaoModelo.setTitulo("Documento recebido");
            notificacaoModelo.setConteudo(
                "Você recebeu um novo documento: \"" + dto.getTitulo() + "\", do professor " + orientador.getNome() + 
                ", referente ao aluno " + alunoModelo.getNome() + "."
            );

            notificacaoServico.cadastrarMensagem(notificacaoModelo);
        }
        
        return ResponseEntity.status(201).body(salvo);

    }

    public ResponseEntity<byte[]> download(Long id) throws IOException {
        DocumentoModelo Documento = new DocumentoModelo();

        Path arquivo = diretorio.resolve(Documento.getNomeArquivo());
        byte[] conteudo = Files.readAllBytes(arquivo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + Documento.getNomeArquivo() + "\"")
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