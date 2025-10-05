package br.furb.orbe.documento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoUploadDTO {
    private String titulo;
    private String nomeArquivo;
    private String arquivoBase64;
    private String emailAutor;
    private String emailAluno;
    private boolean profTcc1;
}
