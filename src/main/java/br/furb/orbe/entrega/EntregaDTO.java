package br.furb.orbe.entrega;

import lombok.Data;

@Data
public class EntregaDTO {
    private Long id;
    private String titulo;
    private String emailAutor;
    private String nomeArquivo;
    private String criadoEm;
    private String linkDownload;
    private String emailOrientador;
    private String emailCoorientador;

    public EntregaDTO(EntregaModelo modelo) {
        this.id = modelo.getId();
        this.titulo = modelo.getTitulo();
        this.emailAutor = modelo.getEmailAutor();
        this.nomeArquivo = modelo.getNomeArquivo();
        this.criadoEm = modelo.getCriadoEm().toString();
        this.linkDownload = "/entregas/" + modelo.getId() + "/download";
        this.emailOrientador = modelo.getEmailOrientador();
        this.emailCoorientador = modelo.getEmailCoorientador();
    }
}
