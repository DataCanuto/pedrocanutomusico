package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {

    /** Usado para derivar aulasRestantes de uma Matricula: contratadas - este count. */
    long countByMatriculaIdAndStatusNot(Long matriculaId, EStatusAgendamento status);

    /** Usado para os contadores agregados no response de Aluno (agendadas/confirmadas/finalizadas). */
    long countByAlunoIdAndStatus(Long alunoId, EStatusAgendamento status);

    List<Agendamento> findByClienteId(Long clienteId);

    /** Usado para derivar a "categoria atual" do cliente na listagem admin (Q_categoria) - o agendamento mais recente vence. */
    Optional<Agendamento> findFirstByClienteIdOrderByDataHoraAgendamentoDesc(Long clienteId);

    List<Agendamento> findByData(LocalDate data);

    List<Agendamento> findByCategoria(ECategoriaServico categoria);

    List<Agendamento> findByDataAndCategoria(LocalDate data, ECategoriaServico categoria);

    Optional<Agendamento> findByCodigoPublico(String codigoPublico);

    /** Usado para checar conflito de horário (com folga de duração) na agenda do professor - ver AgendamentoService#validarDisponibilidade. */
    List<Agendamento> findByDataAndStatusNot(LocalDate data, EStatusAgendamento status);

    /**
     * Base do roster "alunos por turma" (ver TurmaService#listarComAlunos): todo agendamento
     * nascido de uma inscrição em Turma tem turma+aluno+matrícula preenchidos (nunca é EVENTO -
     * ver TurmaService#criar). Um único SELECT com JOIN FETCH em vez de 1 query por turma evita
     * N+1 ao montar a listagem inteira.
     */
    @Query("SELECT DISTINCT a FROM Agendamento a " +
            "JOIN FETCH a.turma " +
            "JOIN FETCH a.aluno al " +
            "JOIN FETCH al.responsavel c " +
            "LEFT JOIN FETCH c.enderecos " +
            "WHERE a.turma IS NOT NULL")
    List<Agendamento> listarComTurmaEAluno();
}
