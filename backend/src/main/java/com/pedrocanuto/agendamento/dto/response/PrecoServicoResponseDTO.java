package com.pedrocanuto.agendamento.dto.response;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PrecoServicoResponseDTO(
        Long id,
        ECategoriaServico categoria,
        EModalidadeServico modalidade,
        ETipoContratacao tipoContratacao,
        ETipoEvento tipoEvento,
        String nome,
        String descricao,
        String publicoAlvo,
        String equipe,
        String materiais,
        BigDecimal valor,
        Integer duracaoPadraoMinutos,
        LocalDateTime atualizadoEm
) {
}
