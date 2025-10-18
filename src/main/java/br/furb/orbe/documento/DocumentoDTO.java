package br.furb.orbe.documento;

import lombok.Data;

@Data
public class DocumentoDTO {
    private Long id;
    private String titulo;
    private String emailAutor;
    private String emailAluno;
    private String nomeArquivo;
    private String criadoEm;
    private String linkDownload;
    private boolean profTcc1;

    public DocumentoDTO(DocumentoModelo modelo) {
        this.id = modelo.getId();
        this.titulo = modelo.getTitulo();
        this.emailAutor = modelo.getEmailAutor();
        this.emailAluno = modelo.getEmailAluno();
        this.nomeArquivo = modelo.getNomeArquivo();
        this.criadoEm = modelo.getCriadoEm().toString();
        this.profTcc1 = modelo.isProfTcc1();
        this.linkDownload = "/documentos/" + modelo.getId() + "/download";
    }
}
