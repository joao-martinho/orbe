package br.furb.orbe.revisao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface RevisaoRepositorio extends JpaRepository<RevisaoModelo, Long> {

    List<RevisaoModelo> findByEmailAutor(String emailAutor);
    List<RevisaoModelo> findByEmailAluno(String emailAluno);
    
}
