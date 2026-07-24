package com.pedrocanuto.agendamento.domain.embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Preenchido só quando o paciente é criança - permanece com todos os campos nulos caso contrário. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class AnamneseInfantil {

    @Column(length = 1000)
    private String gestacao;

    @Column(length = 1000)
    private String parto;

    @Column(length = 1000)
    private String desenvolvimentoMotor;

    @Column(length = 1000)
    private String desenvolvimentoLinguagem;

    @Column(length = 1000)
    private String desenvolvimentoSocial;

    @Column(length = 1000)
    private String desenvolvimentoEscolar;

    @Column(length = 1000)
    private String comportamentoCasa;

    @Column(length = 1000)
    private String comportamentoEscola;

    @Column(length = 500)
    private String seletividadeAlimentar;

    private Boolean desfraldeConcluido;
    private Boolean usaFraldas;

    @Column(length = 500)
    private String interessesCrianca;

    @Column(length = 500)
    private String brincadeirasFavoritas;
}
