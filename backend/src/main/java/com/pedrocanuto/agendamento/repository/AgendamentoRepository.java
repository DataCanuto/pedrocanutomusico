package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /** Usado para derivar aulasRestantes de uma Matricula: contratadas - este count. */
    long countByMatriculaIdAndStatusNot(Long matriculaId, EStatusAgendamento status);

    /** Usado para os contadores agregados no response de Aluno (agendadas/confirmadas/finalizadas). */
    long countByAlunoIdAndStatus(Long alunoId, EStatusAgendamento status);

    List<Agendamento> findByClienteId(Long clienteId);

    List<Agendamento> findByData(LocalDate data);

    List<Agendamento> findByCategoria(ECategoriaServico categoria);

    List<Agendamento> findByDataAndCategoria(LocalDate data, ECategoriaServico categoria);

    Optional<Agendamento> findByCodigoPublico(String codigoPublico);

    boolean existsByDataAndHoraAndStatusNot(LocalDate data, LocalTime hora, EStatusAgendamento status);
}
