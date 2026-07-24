package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.constraints.Email;

/** Responsável legal do paciente, usado só quando o bloco é preenchido (paciente menor de idade). */
public record ResponsavelRequestDTO(

        String nome,
        String parentesco,
        String telefone,

        @Email String email
) {
}
