package br.furb.orbe.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepositorio extends JpaRepository<AdminModelo, String> {
 
    AdminModelo findByEmail(String email);

}
