package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TurmaRepository extends JpaRepository<Turma, Long> {

    Optional<Turma> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    /**
     * Turmas que ocupam um dia da semana - usado para checar disponibilidade (ver
     * AgendamentoService#validarDisponibilidade): a turma ocupa o horário assim que é criada
     * (status ATIVA), independentemente de já ter aluno matriculado.
     */
    List<Turma> findByDiaSemanaAndStatus(DayOfWeek diaSemana, EStatusTurma status);
}
