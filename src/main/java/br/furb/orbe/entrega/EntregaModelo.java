package br.furb.orbe.entrega;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "entregas")
public class EntregaModelo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    @Email
    private String emailAutor;

    @Email
    private String emailOrientador;

    @Email
    private String emailCoorientador;

    @NotBlank
    private String nomeArquivo;

    @NotNull
    @Lob
    private String arquivoBase64;

    @NotNull
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) criadoEm = LocalDateTime.now();
    }
}
