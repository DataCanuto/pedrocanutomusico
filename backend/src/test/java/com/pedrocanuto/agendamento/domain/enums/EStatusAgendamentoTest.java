package com.pedrocanuto.agendamento.domain.enums;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.EnumSource.Mode.EXCLUDE;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

class EStatusAgendamentoTest {

    @Test
    void fluxoFelizPermiteTodasAsTransicoesEmOrdem() {
        assertThat(EStatusAgendamento.AGENDADO.podeTransicionarPara(EStatusAgendamento.CONFIRMADO)).isTrue();
        assertThat(EStatusAgendamento.CONFIRMADO.podeTransicionarPara(EStatusAgendamento.CHECK_IN)).isTrue();
        assertThat(EStatusAgendamento.CHECK_IN.podeTransicionarPara(EStatusAgendamento.EM_ANDAMENTO)).isTrue();
        assertThat(EStatusAgendamento.EM_ANDAMENTO.podeTransicionarPara(EStatusAgendamento.FINALIZADO)).isTrue();
    }

    @Test
    void naoPermiteVoltarStatusOuPularEtapa() {
        assertThat(EStatusAgendamento.CHECK_IN.podeTransicionarPara(EStatusAgendamento.AGENDADO)).isFalse();
        assertThat(EStatusAgendamento.AGENDADO.podeTransicionarPara(EStatusAgendamento.EM_ANDAMENTO)).isFalse();
        assertThat(EStatusAgendamento.AGENDADO.podeTransicionarPara(EStatusAgendamento.FINALIZADO)).isFalse();
    }

    @Test
    void checkInNaoPermiteMaisMarcarFalta() {
        assertThat(EStatusAgendamento.CHECK_IN.podeTransicionarPara(EStatusAgendamento.FALTOU)).isFalse();
    }

    @ParameterizedTest
    @EnumSource(value = EStatusAgendamento.class, names = {"FINALIZADO", "CANCELADO", "FALTOU"})
    void statusTerminaisNaoPermitemNenhumaTransicao(EStatusAgendamento status) {
        assertThat(status.isTerminal()).isTrue();
    }

    @ParameterizedTest
    @EnumSource(value = EStatusAgendamento.class, names = {"FINALIZADO", "CANCELADO", "FALTOU"}, mode = EXCLUDE)
    void statusNaoTerminaisTemPeloMenosUmaTransicaoLegal(EStatusAgendamento status) {
        assertThat(status.isTerminal()).isFalse();
    }

    @Test
    void apenasCanceladoLiberaCreditoDeMatricula() {
        assertThat(EStatusAgendamento.CANCELADO.consomeCreditoMatricula()).isFalse();
        for (EStatusAgendamento status : EStatusAgendamento.values()) {
            if (status != EStatusAgendamento.CANCELADO) {
                assertThat(status.consomeCreditoMatricula()).isTrue();
            }
        }
    }
}
