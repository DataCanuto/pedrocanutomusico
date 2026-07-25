package com.pedrocanuto.agendamento.dto.response;

/** Uma linha do roster de uma Turma (ver TurmaComAlunosResponseDTO) - telefone/endereço são do responsável (Cliente), não do aluno. */
public record AlunoDaTurmaResponseDTO(
        Long id,
        String nomeAluno,
        int idade,
        String endereco,
        String telefone
) {
}
