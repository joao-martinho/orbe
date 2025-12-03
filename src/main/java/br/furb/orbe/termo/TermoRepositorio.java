package br.furb.orbe.termo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface TermoRepositorio extends JpaRepository<TermoModelo, Long> {

    TermoModelo findByEmailAluno(String email);
    TermoModelo findByEmailParceiro(String email);
    List<TermoModelo> findByEmailOrientador(String email);
    List<TermoModelo> findByEmailCoorientador(String email);

    @Query("SELECT t FROM TermoModelo t WHERE t.emailAluno = ?1 OR t.emailParceiro = ?1")
    TermoModelo findByEmailAlunoOrEmailParceiro(String email);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM termos", nativeQuery = true)
    void truncateTable();

}
