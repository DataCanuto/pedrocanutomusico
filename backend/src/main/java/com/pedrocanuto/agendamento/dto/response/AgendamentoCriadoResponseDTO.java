package com.pedrocanuto.agendamento.dto.response;

import java.util.List;

/**
 * Retorno unificado de POST /api/agendamentos - sempre uma lista de agendamentos, mesmo quando é
 * só 1 (EVENTO ou AVULSO), para o cliente não precisar tratar dois contratos de resposta
 * diferentes por categoria/pacote. matriculaId é nulo só para EVENTO (não existe matrícula).
 */
public record AgendamentoCriadoResponseDTO(
        Long matriculaId,
        List<AgendamentoResponseDTO> agendamentos
) {
}
