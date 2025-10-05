package br.furb.orbe.documento;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentoRepositorio extends JpaRepository<DocumentoModelo, Long> {

    List<DocumentoModelo> findByEmailAutor(String emailAutor);
    List<DocumentoModelo> findByEmailAluno(String emailAluno);

}