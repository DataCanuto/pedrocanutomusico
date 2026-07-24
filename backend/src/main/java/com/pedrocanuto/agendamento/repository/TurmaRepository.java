package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Turma;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    Optional<Turma> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}
