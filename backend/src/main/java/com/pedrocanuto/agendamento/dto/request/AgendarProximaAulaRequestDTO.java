package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

/** Agenda mais uma aula contra o saldo restante de uma Matricula já existente. */
public record AgendarProximaAulaRequestDTO(

        @NotNull @FutureOrPresent LocalDate data,

        @NotNull LocalTime hora,

        String observacoes
) {
}
