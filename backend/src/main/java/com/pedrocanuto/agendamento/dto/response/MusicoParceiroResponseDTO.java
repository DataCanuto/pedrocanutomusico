package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import java.time.LocalDateTime;

public record MusicoParceiroResponseDTO(
        Long id,
        String nome,
        String cpf,
        String telefone,
        EInstrumento instrumento,
        LocalDateTime criadoEm
) {
}
