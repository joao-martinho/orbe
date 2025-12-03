package br.furb.orbe.aluno;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.Setter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@Setter
@Entity
@Table(name = "alunos")
public class AlunoModelo {

    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder();

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @NotBlank
    private String nome;

    private String telefone;

    private String senha;
    
    @NotNull
    private String curso;

    @Email
    private String orientadorProvisorio;

    @Email
    private String parceiro;

    @Email
    private String orientador;
    
    @Email
    private String coorientadorProvisorio;

    @Email
    private String coorientador;

    private String codigoVer;
    
    private LocalDateTime criadoEm;

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
