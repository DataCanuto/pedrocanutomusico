package com.pedrocanuto.agendamento.dto.response;

/** Listagem global de endereços para o painel do professor. */
public record EnderecoListItemResponseDTO(
        Long id,
        String rua,
        String bairro,
        String numero,
        String complemento,
        String cep,
        Long clienteId,
        String clienteNome
) {
}
