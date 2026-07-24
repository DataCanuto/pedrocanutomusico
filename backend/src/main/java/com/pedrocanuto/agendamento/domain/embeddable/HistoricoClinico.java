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
public class HistoricoClinico {

    private Boolean possuiDiagnostico;

    @Column(length = 1000)
    private String diagnosticos;

    private Boolean fazUsoMedicamentos;

    @Column(length = 1000)
    private String medicamentos;

    private Boolean possuiAcompanhamentoMedico;

    @Column(length = 1000)
    private String especialidadesMedicas;

    private Boolean possuiAcompanhamentoPsicologico;

    @Column(length = 1000)
    private String observacoesAcompanhamentoPsicologico;

    private Boolean possuiAlergias;

    @Column(length = 1000)
    private String alergias;
}
