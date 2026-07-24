package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MatriculaResponseDTO(
        Long id,
        Long clienteId,
        Long alunoId,
        String alunoNome,
        ECategoriaServico categoria,
        EModalidadeServico modalidade,
        EInstrumento instrumento,
        ETipoContratacao tipoContratacao,
        BigDecimal valorTotal,
        int aulasContratadas,
        long aulasRestantes,
        EStatusMatricula status,
        LocalDateTime dataContratacao
) {
}
