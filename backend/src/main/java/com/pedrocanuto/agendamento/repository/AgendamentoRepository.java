package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /** Usado para derivar aulasRestantes de uma Matricula: contratadas - este count. */
    long countByMatriculaIdAndStatusNot(Long matriculaId, EStatusAgendamento status);

    /** Usado para inferir dia da semana/horário/valor da última aula de uma Matricula - ver AgendamentoService#confirmarRecorrencia. */
    Optional<Agendamento> findFirstByMatriculaIdAndStatusNotOrderByDataDescHoraDesc(Long matriculaId, EStatusAgendamento status);

    /** Usado para os contadores agregados no response de Aluno (agendadas/confirmadas/finalizadas). */
    long countByAlunoIdAndStatus(Long alunoId, EStatusAgendamento status);

    List<Agendamento> findByClienteId(Long clienteId);

    /** Usado para derivar a "categoria atual" do cliente na listagem admin (Q_categoria) - o agendamento mais recente vence. */
    Optional<Agendamento> findFirstByClienteIdOrderByDataHoraAgendamentoDesc(Long clienteId);

    /**
     * Usado por AgendamentoService#listar (agenda do admin). O filtro TurmaIsNull exclui
     * Agendamento legado (turma_id preenchido, de antes da refatoração em V6__matricula_turma_e_turma_ocorrencia.sql)
     * - hoje a Turma é representada na agenda por uma única TurmaOcorrencia, então reexibir aquelas
     * linhas antigas duplicava o compromisso uma vez por aluno matriculado na época.
     */
    List<Agendamento> findByDataAndTurmaIsNull(LocalDate data);

    List<Agendamento> findByCategoriaAndTurmaIsNull(ECategoriaServico categoria);

    List<Agendamento> findByDataAndCategoriaAndTurmaIsNull(LocalDate data, ECategoriaServico categoria);

    List<Agendamento> findByTurmaIsNull();

    Optional<Agendamento> findByCodigoPublico(String codigoPublico);

    /** Usado para checar conflito de horário (com folga de duração) na agenda do professor - ver AgendamentoService#validarDisponibilidade. */
    List<Agendamento> findByDataAndStatusNot(LocalDate data, EStatusAgendamento status);
}
