package br.furb.orbe.termo;

import java.time.LocalDateTime;

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
@Table(name = "termos")
public class TermoModelo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    @Email
    private String emailAluno;

    private String telefoneAluno;

    private String nomeAluno;

    private String cursoAluno;

    @NotBlank
    @Email
    private String emailOrientador;

    @Email
    private String emailCoorientador;

    @Email
    private String emailParceiro;

    private String nomeParceiro;

    @Lob
    private String perfilCoorientador;

    @NotBlank
    private String ano;

    @NotBlank
    private String semestre;

    @NotBlank
    @Lob
    private String resumo;

    private LocalDateTime criadoEm;

    private String statusOrientador;

    private String statusCoorientador;

    private String statusProfessorTcc1;

    private String statusFinal;

    @Lob
    private String comentario;
    
}
