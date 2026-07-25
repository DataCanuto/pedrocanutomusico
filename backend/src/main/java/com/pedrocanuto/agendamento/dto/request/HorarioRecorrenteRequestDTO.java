package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Um dia da semana + horário recorrente escolhido pelo cliente para fechar um pacote
 * (PACOTE_4/PACOTE_12). O backend usa isto para gerar automaticamente todas as datas do pacote -
 * ver {@code GeradorDeDatasRecorrentes}.
 */
public record HorarioRecorrenteRequestDTO(

        @NotNull DayOfWeek diaSemana,

        @NotNull LocalTime hora
) {
}
