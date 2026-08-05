package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Anamnese;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AnamneseRepository extends JpaRepository<Anamnese, Long> {

    Optional<Anamnese> findByAlunoId(Long alunoId);

    boolean existsByAlunoId(Long alunoId);

    /** Painel "pacientes de musicoterapia" (Q_verAnamneses) - JOIN FETCH evita N+1 ao montar a listagem inteira. */
    @Query("SELECT a FROM Anamnese a JOIN FETCH a.aluno al JOIN FETCH al.responsavel ORDER BY al.nome ASC")
    List<Anamnese> listarComAlunoEResponsavel();
}
