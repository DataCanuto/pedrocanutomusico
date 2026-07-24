package com.pedrocanuto.agendamento.domain.enums;

public enum ECategoriaServico {
    MUSICALIZACAO_INFANTIL,
    MUSICOTERAPIA,
    AULA_INSTRUMENTO,
    EVENTO;

    public boolean isAulaTipo() {
        return this != EVENTO;
    }

    public boolean isEvento() {
        return this == EVENTO;
    }
}
