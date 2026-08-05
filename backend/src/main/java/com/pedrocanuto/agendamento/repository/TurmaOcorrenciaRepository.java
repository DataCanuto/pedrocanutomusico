package com.pedrocanuto.agendamento.repository;

import com.pedrocanuto.agendamento.domain.TurmaOcorrencia;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TurmaOcorrenciaRepository extends JpaRepository<TurmaOcorrencia, Long> {

    Optional<TurmaOcorrencia> findByTurmaIdAndData(Long turmaId, LocalDate data);

    /** Usado por AgendaAdminService para não duplicar ocorrências virtuais já materializadas dentro da janela consultada. */
    List<TurmaOcorrencia> findByDataBetween(LocalDate inicio, LocalDate fim);
}
