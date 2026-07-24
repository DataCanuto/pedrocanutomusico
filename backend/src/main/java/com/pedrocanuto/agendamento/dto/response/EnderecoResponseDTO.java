package com.pedrocanuto.agendamento.dto.response;

public record EnderecoResponseDTO(
        Long id,
        String cep,
        String rua,
        String numero,
        String bairro,
        String cidade,
        String estado,
        String complemento
) {
}
