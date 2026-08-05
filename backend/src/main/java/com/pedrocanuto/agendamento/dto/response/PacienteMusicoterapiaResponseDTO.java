package com.pedrocanuto.agendamento.dto.response;

/**
 * Um paciente de Musicoterapia (aluno com anamnese registrada) para o painel do professor (Q_verAnamneses).
 * nomeAluno/idadeAtual/nomeResponsavel/telefoneResponsavel vêm de {@code Aluno}/{@code Cliente}
 * (sempre confiáveis), diferente de {@code anamnese.responsavel} (preenchido na entrevista, pode
 * divergir ou estar vazio).
 */
public record PacienteMusicoterapiaResponseDTO(
        Long alunoId,
        String nomeAluno,
        int idadeAtual,
        String nomeResponsavel,
        String telefoneResponsavel,
        AnamneseMusicoterapiaResponseDTO anamnese
) {
}
