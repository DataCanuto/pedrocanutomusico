package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.Matricula;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    List<Matricula> findByClienteId(Long clienteId);

    /**
     * Toma um lock pessimista de escrita na matrícula para evitar que duas requisições
     * concorrentes agendem contra o mesmo saldo de aulas restantes (ver AgendamentoService).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Matricula> findWithLockById(Long id);
}
