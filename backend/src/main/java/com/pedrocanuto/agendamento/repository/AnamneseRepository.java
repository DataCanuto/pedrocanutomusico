package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Anamnese;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnamneseRepository extends JpaRepository<Anamnese, Long> {

    Optional<Anamnese> findByAlunoId(Long alunoId);

    boolean existsByAlunoId(Long alunoId);
}
