package com.pedrocanuto.agendamento.dto.response;

/**
 * Visão resumida para listagem de clientes (Q5) - evita carregar endereços/alunos completos
 * quando a tela só precisa mostrar uma linha por cliente.
 */
public record ClienteListItemResponseDTO(
        Long id,
        String nome,
        String telefone,
        String enderecoResumo
) {
}
