package br.furb.orbe.revisao;

import lombok.Data;

@Data
public class RevisaoDTO {
    private Long id;
    private String titulo;
    private String emailAutor;
    private String emailAluno;
    private String nomeArquivo;
    private String criadoEm;
    private String linkDownload;

    public RevisaoDTO(RevisaoModelo modelo) {
        this.id = modelo.getId();
        this.titulo = modelo.getTitulo();
        this.emailAutor = modelo.getEmailAutor();
        this.emailAluno = modelo.getEmailAluno();
        this.nomeArquivo = modelo.getNomeArquivo();
        this.criadoEm = modelo.getCriadoEm().toString();
        this.linkDownload = "/revisoes/" + modelo.getId() + "/download";
    }
}
