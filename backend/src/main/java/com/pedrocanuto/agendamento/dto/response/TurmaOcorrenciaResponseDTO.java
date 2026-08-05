package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * A aula da Turma numa semana específica, tratada como um compromisso único na agenda do
 * professor (ver TurmaOcorrenciaService/AgendaAdminService). {@code id} é nulo quando a ocorrência
 * ainda é "virtual" (nunca teve o status alterado) - use turmaId+data para agir sobre ela mesmo
 * assim, o backend materializa a linha na primeira transição.
 */
public record TurmaOcorrenciaResponseDTO(
        Long id,
        Long turmaId,
        String turmaCodigo,
        ECategoriaServico categoria,
        EInstrumento instrumento,
        LocalDate data,
        LocalTime hora,
        String local,
        Integer duracaoMinutos,
        EStatusAgendamento status,
        LocalDateTime dataHoraCheckIn,
        LocalDateTime dataHoraFinalizacao,
        List<AlunoDaTurmaResponseDTO> alunosAtivos
) {
}
