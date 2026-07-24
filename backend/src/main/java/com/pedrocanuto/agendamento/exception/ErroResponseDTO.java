package com.pedrocanuto.agendamento.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErroResponseDTO(
        LocalDateTime timestamp,
        int status,
        String erro,
        String message,
        List<String> detalhes
) {
    public static ErroResponseDTO de(int status, String erro, String message) {
        return new ErroResponseDTO(LocalDateTime.now(), status, erro, message, null);
    }

    public static ErroResponseDTO de(int status, String erro, String message, List<String> detalhes) {
        return new ErroResponseDTO(LocalDateTime.now(), status, erro, message, detalhes);
    }
}
