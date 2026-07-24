package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ESexo;
import java.time.LocalDate;

public record AlunoResponseDTO(
        Long id,
        String nome,
        LocalDate dataNascimento,
        int idade,
        ESexo sexo,
        String observacoes,
        boolean ehProprioResponsavel
) {
}
