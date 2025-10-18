package br.furb.orbe.professor;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface ProfessorRepositorio extends JpaRepository<ProfessorModelo, String> {
    
    ProfessorModelo findByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE ProfessorModelo p SET p.codigoVer = NULL " + "WHERE p.criadoEm <= :limite")
    int limparCodigoVer(@Param("limite") LocalDateTime limite);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM professores", nativeQuery = true)
    void truncateTable();
    
}
