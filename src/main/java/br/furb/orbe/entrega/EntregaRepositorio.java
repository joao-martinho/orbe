package br.furb.orbe.entrega;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntregaRepositorio extends JpaRepository<EntregaModelo, Long> {
    
    List<EntregaModelo> findByEmailAutor(String email);
    List<EntregaModelo> findByEmailOrientadorOrEmailCoorientador(String emailOrientador, String emailCoorientador);

}
