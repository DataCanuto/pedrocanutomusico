package com.pedrocanuto.agendamento.dto.response;

import java.time.LocalTime;

/**
 * Só o necessário para o cliente calcular, ainda no formulário, quais horários colidiriam com a
 * duração do serviço que ele está tentando marcar (ver AgendamentoService#validarDisponibilidade)
 * - sem nome/telefone/categoria, já que este endpoint é público (fluxo de agendamento, antes de
 * qualquer autenticação) e não deve vazar dado de outro cliente.
 */
public record HorarioOcupadoResponseDTO(LocalTime hora, int duracaoMinutos) {
}
