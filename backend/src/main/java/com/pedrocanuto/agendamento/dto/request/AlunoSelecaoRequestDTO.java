package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/**
 * paraMim = true quando o próprio Cliente que está agendando é quem vai receber o serviço
 * (ex.: "Pedro faz aula de violão"). O AlunoService encontra/reaproveita o Aluno marcado
 * ehProprioResponsavel=true do Cliente nesse caso, em vez de criar um novo a cada agendamento.
 * dadosAluno é sempre exigido (mesmo com paraMim=true) porque a data de nascimento é quem
 * decide a duração da aula, independente de quem está sendo atendido.
 */
public record AlunoSelecaoRequestDTO(

        @NotNull Boolean paraMim,

        @NotNull @Valid AlunoRequestDTO dadosAluno
) {
}
