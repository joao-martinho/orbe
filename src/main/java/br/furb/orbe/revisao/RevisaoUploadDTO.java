package br.furb.orbe.revisao;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevisaoUploadDTO {
    private String titulo;
    private String nomeArquivo;
    private String arquivoBase64;
    private String emailAluno;
}
