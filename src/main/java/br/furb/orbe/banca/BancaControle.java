package br.furb.orbe.banca;

import java.io.IOException;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@CrossOrigin("*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/bancas")
public class BancaControle {

    private final BancaServico bancaServico;

    @GetMapping
    public ResponseEntity<Iterable<BancaModelo>> listarBancas() {
        return this.bancaServico.listarBancas();
    }

    @PostMapping
    public ResponseEntity<BancaModelo> cadastrarBanca(@Valid @RequestBody BancaModelo bancaModelo) {
        return this.bancaServico.cadastrarBanca(bancaModelo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BancaModelo> buscarBanca(@PathVariable Long id) {
        return this.bancaServico.buscarBanca(id);
    }

    @GetMapping("/aluno/{email}")
    public ResponseEntity<BancaModelo> buscarPorAluno(@PathVariable String email) {
        return this.bancaServico.buscarPorAluno(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BancaModelo> alterarBancaTotal(@Valid @PathVariable Long id, @RequestBody BancaModelo bancaModelo) {
        return this.bancaServico.alterarBancaTotal(id, bancaModelo);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BancaModelo> alterarBancaParcial(
            @PathVariable Long id,
            @RequestBody BancaModelo bancaModelo) {
        return this.bancaServico.alterarBancaParcial(id, bancaModelo);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BancaModelo> uploadArquivos(
            @PathVariable Long id,
            @RequestPart(required = false) MultipartFile arquivoPreProjeto,
            @RequestPart(required = false) MultipartFile arquivoProjeto,
            @RequestPart(required = false) MultipartFile arquivoParecerAvaliador,
            @RequestPart(required = false) MultipartFile arquivoParecerProfTcc1
    ) {
        ResponseEntity<BancaModelo> optional = bancaServico.buscarBanca(id);
        if (optional.getStatusCode() != HttpStatus.OK) {
            return ResponseEntity.notFound().build();
        }

        BancaModelo banca = new BancaModelo();

        try {
            if (arquivoPreProjeto != null && !arquivoPreProjeto.isEmpty()) {
                banca.setArquivoPreProjeto(Base64.getEncoder().encodeToString(arquivoPreProjeto.getBytes()));
                banca.setNomeArquivoPreProjeto(arquivoPreProjeto.getOriginalFilename());
            }

            if (arquivoProjeto != null && !arquivoProjeto.isEmpty()) {
                banca.setArquivoProjeto(Base64.getEncoder().encodeToString(arquivoProjeto.getBytes()));
                banca.setNomeArquivoProjeto(arquivoProjeto.getOriginalFilename());
            }

            if (arquivoParecerAvaliador != null && !arquivoParecerAvaliador.isEmpty()) {
                banca.setArquivoParecerAvaliador(Base64.getEncoder().encodeToString(arquivoParecerAvaliador.getBytes()));
                banca.setNomeArquivoParecerAvaliador(arquivoParecerAvaliador.getOriginalFilename());
            }

            if (arquivoParecerProfTcc1 != null && !arquivoParecerProfTcc1.isEmpty()) {
                banca.setArquivoParecerProfTcc1(Base64.getEncoder().encodeToString(arquivoParecerProfTcc1.getBytes()));
                banca.setNomeArquivoParecerProfTcc1(arquivoParecerProfTcc1.getOriginalFilename());
            }

            return this.bancaServico.alterarBancaParcial(id, banca);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerBanca(@PathVariable Long id) {
        return this.bancaServico.removerBanca(id);
    }

    @DeleteMapping
    public void deletarTodos() {
        bancaServico.removerTodos();
    }
}
