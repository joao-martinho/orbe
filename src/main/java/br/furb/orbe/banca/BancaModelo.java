package br.furb.orbe.banca;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bancas")
public class BancaModelo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    private String emailAluno1;

    @Email
    private String emailAluno2;

    @NotBlank
    @Email
    private String emailOrientador;

    @Email
    private String emailCoorientador;

    @NotBlank
    private String curso;

    @NotBlank
    private String titulo;

    @NotBlank
    private String resumo;

    @Email
    private String emailAvaliador;

    @Email
    @NotBlank
    private String emailProfTcc1;

    private String nomeArquivoPreProjeto;

    @Lob
    private String arquivoPreProjeto;

    private String nomeArquivoProjeto;

    @Lob
    private String arquivoProjeto;

    private boolean marcada;

    private LocalDate data;

    private LocalTime hora;

    private Float notaAvaliadorPreProjeto;

    private Float notaProfTcc1PreProjeto;

    private Float notaDefesaQualificacao;

    private Float notaAvaliadorProjeto;

    private Float notaProfTcc1Projeto;

    private String nomeArquivoParecerAvaliador;

    @Lob
    private String arquivoParecerAvaliador;

    private String nomeArquivoParecerProfTcc1;

    @Lob
    private String arquivoParecerProfTcc1;

    private Float mediaFinal;

    private String status;

}
