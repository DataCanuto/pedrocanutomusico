package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record TurmaResponseDTO(
        Long id,
        String codigo,
        ECategoriaServico categoria,
        EInstrumento instrumento,
        DayOfWeek diaSemana,
        LocalTime hora,
        String local,
        EStatusTurma status,
        LocalDateTime criadaEm
) {
}
