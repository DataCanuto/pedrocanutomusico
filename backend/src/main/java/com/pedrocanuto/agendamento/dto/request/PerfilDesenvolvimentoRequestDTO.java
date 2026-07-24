package com.pedrocanuto.agendamento.dto.request;

/** Agrupa os campos de texto livre de desenvolvimento/aspectos da anamnese - nenhum é obrigatório. */
public record PerfilDesenvolvimentoRequestDTO(

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
