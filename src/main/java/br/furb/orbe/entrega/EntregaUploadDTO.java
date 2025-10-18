package br.furb.orbe.entrega;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntregaUploadDTO {
    private String titulo;
    private String nomeArquivo;
    private String arquivoBase64;
}

