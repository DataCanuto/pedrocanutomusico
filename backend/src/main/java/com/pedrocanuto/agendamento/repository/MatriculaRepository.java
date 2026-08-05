package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByClienteId(Long clienteId);

    /**
     * Toma um lock pessimista de escrita na matrícula para evitar que duas requisições
     * concorrentes agendem contra o mesmo saldo de aulas restantes (ver AgendamentoService).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Matricula> findWithLockById(Long id);

    /**
     * Base do roster "alunos por turma" (ver TurmaService#listarComAlunos) - o vínculo aluno<->turma
     * vive aqui (Matricula#turma), não mais implícito via Agendamento (matrícula de turma não gera
     * mais Agendamento por aula). Sem filtro de status: o roster mostra ativos E inativos (aluno
     * que saiu, ver EStatusMatricula), com o status por linha no DTO.
     */
    @Query("SELECT m FROM Matricula m " +
            "JOIN FETCH m.turma " +
            "JOIN FETCH m.aluno al " +
            "JOIN FETCH al.responsavel c " +
            "LEFT JOIN FETCH c.enderecos " +
            "WHERE m.turma IS NOT NULL")
    List<Matricula> listarComTurmaEAluno();

    /** Roster de uma única turma (ver TurmaOcorrenciaService) - versão filtrada de {@link #listarComTurmaEAluno()}. */
    @Query("SELECT m FROM Matricula m " +
            "JOIN FETCH m.aluno al " +
            "JOIN FETCH al.responsavel c " +
            "LEFT JOIN FETCH c.enderecos " +
            "WHERE m.turma.id = :turmaId AND m.status = :status")
    List<Matricula> listarPorTurmaEStatus(@Param("turmaId") Long turmaId, @Param("status") EStatusMatricula status);
}
