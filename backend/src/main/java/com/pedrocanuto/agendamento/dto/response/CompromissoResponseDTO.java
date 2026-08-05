package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECompromissoTipo;

/**
 * Linha unificada da agenda do professor (ver AgendaAdminService) - um compromisso é OU um
 * Agendamento individual/evento OU uma ocorrência de Turma, nunca os dois; {@code tipo} discrimina
 * qual dos dois campos está preenchido.
 */
public record CompromissoResponseDTO(
        ECompromissoTipo tipo,
        AgendamentoResponseDTO agendamento,
        TurmaOcorrenciaResponseDTO turmaOcorrencia
) {
}
