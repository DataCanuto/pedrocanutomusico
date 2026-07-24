package com.pedrocanuto.agendamento.domain.enums;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Fluxo de status definido em PROJECT.md. As transições legais ficam centralizadas aqui
 * (em vez de espalhadas pelo service) para que qualquer endpoint de mudança de status
 * passe pela mesma regra.
 */
public enum EStatusAgendamento {

    AGENDADO,
    CONFIRMADO,
    CHECK_IN,
    EM_ANDAMENTO,
    FINALIZADO,
    CANCELADO,
    FALTOU;

    private static final Map<EStatusAgendamento, Set<EStatusAgendamento>> TRANSICOES_LEGAIS = new EnumMap<>(EStatusAgendamento.class);

    static {
        TRANSICOES_LEGAIS.put(AGENDADO, EnumSet.of(CONFIRMADO, CANCELADO, FALTOU));
        TRANSICOES_LEGAIS.put(CONFIRMADO, EnumSet.of(CHECK_IN, CANCELADO, FALTOU));
        TRANSICOES_LEGAIS.put(CHECK_IN, EnumSet.of(EM_ANDAMENTO, CANCELADO));
        TRANSICOES_LEGAIS.put(EM_ANDAMENTO, EnumSet.of(FINALIZADO));
        TRANSICOES_LEGAIS.put(FINALIZADO, EnumSet.noneOf(EStatusAgendamento.class));
        TRANSICOES_LEGAIS.put(CANCELADO, EnumSet.noneOf(EStatusAgendamento.class));
        TRANSICOES_LEGAIS.put(FALTOU, EnumSet.noneOf(EStatusAgendamento.class));
    }

    public boolean podeTransicionarPara(EStatusAgendamento novoStatus) {
        return TRANSICOES_LEGAIS.get(this).contains(novoStatus);
    }

    /** Status que não liberam o crédito de uma Matricula (a aula já foi consumida). */
    public boolean consomeCreditoMatricula() {
        return this != CANCELADO;
    }

    public boolean isTerminal() {
        return TRANSICOES_LEGAIS.get(this).isEmpty();
    }
}
