package com.pedrocanuto.agendamento.dto.response;

/** Listagem global de alunos para o painel do professor (junta dados do responsável e contadores de aula). */
public record AlunoListItemResponseDTO(
        Long id,
        String nome,
        int idade,
        Long idResponsavel,
        String nomeResponsavel,
        String telefoneResponsavel,
        String enderecoResponsavelResumo,
        long aulasAgendadas,
        long aulasConfirmadas,
        long aulasFinalizadas
) {
}
