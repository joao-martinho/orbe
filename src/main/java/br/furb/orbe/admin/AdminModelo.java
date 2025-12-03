package br.furb.orbe.admin;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "admin")
public class AdminModelo {
    
    private static final PasswordEncoder ENCODER = new BCryptPasswordEncoder();

    @Id
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank
    private String senha;

    @PrePersist
    public void prePersist() {
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
