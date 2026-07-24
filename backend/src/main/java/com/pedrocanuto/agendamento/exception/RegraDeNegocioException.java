package com.pedrocanuto.agendamento.exception;

/** Violação de uma regra de negócio (ex.: transição de status ilegal, saldo de pacote esgotado). */
public class RegraDeNegocioException extends RuntimeException {

    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}
