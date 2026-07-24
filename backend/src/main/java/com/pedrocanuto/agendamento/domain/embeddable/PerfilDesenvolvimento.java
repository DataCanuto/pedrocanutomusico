package com.pedrocanuto.agendamento.domain.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class PerfilDesenvolvimento {

    @Column(length = 1000)
    private String desenvolvimento;

    @Column(length = 1000)
    private String aspectosEmocionais;

    @Column(length = 1000)
    private String aspectosCognitivos;

    @Column(length = 1000)
    private String aspectosMotores;

    @Column(length = 1000)
    private String comunicacao;

    @Column(length = 1000)
    private String socializacao;

    @Column(length = 1000)
    private String rotina;

    @Column(length = 1000)
    private String sono;

    @Column(length = 1000)
    private String alimentacao;
}
