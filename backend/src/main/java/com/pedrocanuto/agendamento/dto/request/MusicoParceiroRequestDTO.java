package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record MusicoParceiroRequestDTO(

        @NotBlank String nome,

        @NotBlank
        @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
        String cpf,

        @NotBlank
        @Pattern(regexp = "\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}", message = "Telefone inválido")
        String telefone,

        @NotNull EInstrumento instrumento
) {
}
