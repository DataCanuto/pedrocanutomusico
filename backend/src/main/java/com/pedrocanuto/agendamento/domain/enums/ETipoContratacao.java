package com.pedrocanuto.agendamento.domain.enums;

/**
 * Tamanho de pacote (metadado de quantidade só). O preço NÃO é calculado a partir daqui -
 * cada combinação categoria+modalidade+tipoContratacao tem seu próprio valor fixo em
 * PrecoServico (ver prices.txt: não segue uma fórmula de desconto uniforme, e nem toda
 * categoria oferece todos os tamanhos - Instrumento não tem PACOTE_2/PACOTE_3, por exemplo).
 */
public enum ETipoContratacao {

    AVULSO(1),
    PACOTE_2(2),
    PACOTE_3(3),
    PACOTE_4(4),
    PACOTE_12(12);

    private final int quantidadeAulas;

    ETipoContratacao(int quantidadeAulas) {
        this.quantidadeAulas = quantidadeAulas;
    }

    public int getQuantidadeAulas() {
        return quantidadeAulas;
    }
}
