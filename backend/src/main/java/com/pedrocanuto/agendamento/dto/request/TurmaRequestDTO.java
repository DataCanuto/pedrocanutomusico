package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record TurmaRequestDTO(

        @NotNull ECategoriaServico categoria,

        /** Obrigatório só quando categoria = AULA_INSTRUMENTO. */
        EInstrumento instrumento,

        @NotNull @FutureOrPresent LocalDate data,

        @NotNull LocalTime hora,

        /** Endereço completo de onde a turma acontece (estúdio, escola parceira etc.). */
        @NotNull @Valid EnderecoRequestDTO endereco
) {
}
