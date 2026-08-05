package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Retorno da matrícula em Turma - diferente de {@link AgendamentoCriadoResponseDTO} (usado no
 * agendamento individual), não há lista de aulas datadas para devolver: a matrícula em turma não
 * gera Agendamento por aula (ver TurmaService#inscrever), então o cliente precisa saber o PADRÃO
 * recorrente (dia da semana/hora/local da turma), não datas específicas.
 */
public record InscricaoTurmaResponseDTO(
        Long matriculaId,
        String turmaCodigo,
        ECategoriaServico categoria,
        EInstrumento instrumento,
        DayOfWeek diaSemana,
        LocalTime hora,
        String local,
        ETipoContratacao tipoContratacao,
        BigDecimal valorTotal
) {
}
