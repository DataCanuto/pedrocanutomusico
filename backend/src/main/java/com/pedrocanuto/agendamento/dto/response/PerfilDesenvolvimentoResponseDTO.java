package com.pedrocanuto.agendamento.dto.response;

public record PerfilDesenvolvimentoResponseDTO(

        String desenvolvimento,
        String aspectosEmocionais,
        String aspectosCognitivos,
        String aspectosMotores,
        String comunicacao,
        String socializacao,
        String rotina,
        String sono,
        String alimentacao
) {
}
