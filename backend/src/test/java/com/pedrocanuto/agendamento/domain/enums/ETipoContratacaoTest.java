package com.pedrocanuto.agendamento.domain.enums;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * O preço deixou de ser calculado aqui (ver PrecoServicoService - busca direta na tabela,
 * já que prices.txt não segue uma fórmula uniforme). O enum só expõe quantidade de aulas.
 */
class ETipoContratacaoTest {

    @Test
    void quantidadeDeAulasPorTamanhoDePacote() {
        assertThat(ETipoContratacao.AVULSO.getQuantidadeAulas()).isEqualTo(1);
        assertThat(ETipoContratacao.PACOTE_2.getQuantidadeAulas()).isEqualTo(2);
        assertThat(ETipoContratacao.PACOTE_3.getQuantidadeAulas()).isEqualTo(3);
        assertThat(ETipoContratacao.PACOTE_4.getQuantidadeAulas()).isEqualTo(4);
        assertThat(ETipoContratacao.PACOTE_12.getQuantidadeAulas()).isEqualTo(12);
    }
}
