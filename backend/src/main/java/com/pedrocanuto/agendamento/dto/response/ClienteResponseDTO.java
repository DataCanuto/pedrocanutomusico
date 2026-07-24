package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ESexo;
import java.time.LocalDate;
import java.util.List;

/** Visão de detalhe de um Cliente - endereços completos e alunos vinculados. */
public record ClienteResponseDTO(
        Long id,
        String nome,
        String telefone,
        String email,
        String cpf,
        String cnpj,
        LocalDate dataNascimento,
        ESexo sexo,
        List<EnderecoResponseDTO> enderecos,
        List<AlunoResponseDTO> alunos
) {
}
