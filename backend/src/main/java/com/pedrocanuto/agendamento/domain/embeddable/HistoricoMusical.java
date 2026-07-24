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
public class HistoricoMusical {

    private Boolean possuiExperienciaMusical;

    @Column(length = 1000)
    private String descricaoExperienciaMusical;

    @Column(length = 500)
    private String instrumentosPreferidos;

    @Column(length = 500)
    private String estilosMusicaisPreferidos;

    @Column(length = 1000)
    private String musicasSignificativas;

    private Boolean possuiHipersensibilidadeSonora;

    @Column(length = 1000)
    private String observacoesAuditivas;
}
