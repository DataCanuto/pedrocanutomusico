package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

/**
 * Para categoria != EVENTO: modalidade e tipoContratacao obrigatórios (juntos identificam a
 * linha - cada combinação tem um valor fixo próprio, sem fórmula); nome/descricao/publicoAlvo/
 * equipe/materiais/tipoEvento são ignorados.
 * Para categoria == EVENTO: modalidade e tipoContratacao devem ser nulos, nome obrigatório (é
 * o "pacote"), valor e duracaoPadraoMinutos são opcionais (pacote "sob consulta" quando ausentes).
 * Validado em PrecoServicoService (mesma regra do CHECK constraint ck_preco_nome_ou_modalidade,
 * mantida em código para dar uma mensagem de erro amigável em vez de estourar exceção de banco).
 */
public record PrecoServicoRequestDTO(

        @NotNull ECategoriaServico categoria,

        EModalidadeServico modalidade,

        ETipoContratacao tipoContratacao,

        ETipoEvento tipoEvento,

        String nome,

        String descricao,

        String publicoAlvo,

        String equipe,

        String materiais,

        @DecimalMin(value = "0.01") BigDecimal valor,

        @Positive Integer duracaoPadraoMinutos
) {
}
