package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;

/**
 * Uma linha do roster de uma Turma (ver TurmaComAlunosResponseDTO) - telefone/endereço são do
 * responsável (Cliente), não do aluno. status ATIVA/CANCELADA da Matricula representa
 * ativo/inativo na turma (CANCELADA = "aluno saiu da turma, mas ela continua existindo").
 */
public record AlunoDaTurmaResponseDTO(
        Long id,
        Long matriculaId,
        String nomeAluno,
        int idade,
        String endereco,
        String telefone,
        EStatusMatricula status
) {
}
