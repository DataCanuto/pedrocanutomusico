package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;

/**
 * Visão resumida para listagem de clientes (Q5) - evita carregar endereços/alunos completos
 * quando a tela só precisa mostrar uma linha por cliente.
 */
public record ClienteListItemResponseDTO(
        Long id,
        String nome,
        String telefone,
        String enderecoResumo,
        /** Categoria do agendamento mais recente do cliente - null se ele ainda não tem nenhum. */
        ECategoriaServico categoriaServico
) {
}
