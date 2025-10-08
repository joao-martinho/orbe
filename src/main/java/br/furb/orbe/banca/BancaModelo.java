package br.furb.orbe.banca;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    private String emailAluno;

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
    private String emailProfessor1;

    @Email
    private String emailProfessor2;

    @Email
    private String emailProfessor3;

    private boolean marcada;

    private LocalDate data;

    private LocalTime hora;

    private Float nota1;

    private Float nota2;

    private Float nota3;

    private Float mediaFinal;

}
