package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/** Nova data/hora para mover um compromisso já marcado - ver AgendamentoService#reagendar / TurmaOcorrenciaService#reagendar. */
public record ReagendarRequestDTO(

        @NotNull LocalDate data,

        @NotNull LocalTime hora
) {
}
