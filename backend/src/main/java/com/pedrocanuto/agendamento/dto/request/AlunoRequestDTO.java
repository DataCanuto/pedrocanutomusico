package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.ESexo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import java.time.LocalDate;

public record AlunoRequestDTO(

        @NotBlank String nome,

        @NotNull @Past LocalDate dataNascimento,

        ESexo sexo,

        String observacoes
) {
}
