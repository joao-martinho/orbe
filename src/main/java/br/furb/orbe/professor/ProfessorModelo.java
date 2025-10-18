package br.furb.orbe.professor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import jakarta.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@Setter
@Entity
@Table(name = "professores")
public class ProfessorModelo {

    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder();

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank
    private String nome;

    private String telefone;

    private List<String> orientandosProvisorios;
    private List<String> orientandos;
    private List<String> coorientandosProvisorios;
    private List<String> coorientandos;

    private String senha;
    private String codigoVer;
    private LocalDateTime criadoEm;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "professor_papeis",
        joinColumns = @JoinColumn(name = "professor_email")
    )
    @Column(name = "papel")
    @Enumerated(EnumType.STRING)
    private Set<PapelProfessor> papeis;

    @PrePersist
    public void prePersist() {
        criadoEm = LocalDateTime.now();
        if (senha != null && !senha.startsWith("$2a$")) {
            senha = ENCODER.encode(senha);
        }
    }

    public void setSenhaEmTexto(String senhaEmTexto) {
        this.senha = ENCODER.encode(senhaEmTexto);
    }

    public boolean conferirSenha(String senhaEmTexto) {
        return ENCODER.matches(senhaEmTexto, this.senha);
    }
}
