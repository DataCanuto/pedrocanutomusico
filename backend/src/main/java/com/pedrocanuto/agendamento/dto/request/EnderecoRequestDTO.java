package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record EnderecoRequestDTO(

        @NotBlank
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP deve estar no formato 00000-000")
        String cep,

        @NotBlank String rua,
        @NotBlank String numero,
        @NotBlank String bairro,
        @NotBlank String cidade,

        @NotBlank
        @Pattern(regexp = "[A-Za-z]{2}", message = "Estado deve ser a sigla com 2 letras")
        String estado,

        String complemento
) {
}
