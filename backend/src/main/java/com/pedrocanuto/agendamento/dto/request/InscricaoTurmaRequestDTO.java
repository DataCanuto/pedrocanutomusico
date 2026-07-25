package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * Matrícula de um aluno numa Turma já existente - dia da semana/hora/local/categoria vêm da
 * Turma, não do cliente. {@code tipoContratacao} decide quantas aulas o backend vai gerar
 * automaticamente (ver AgendamentoService#criarInscricaoTurma).
 */
public record InscricaoTurmaRequestDTO(

        @NotNull @Valid ClienteRequestDTO cliente,

        @NotNull @Valid AlunoSelecaoRequestDTO aluno,

        @NotNull ETipoContratacao tipoContratacao,

        String observacoes
) {
}
