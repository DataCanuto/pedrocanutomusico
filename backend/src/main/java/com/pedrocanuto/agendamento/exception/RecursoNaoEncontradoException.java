package com.pedrocanuto.agendamento.exception;

public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }

    public static RecursoNaoEncontradoException paraId(String entidade, Long id) {
        return new RecursoNaoEncontradoException("%s não encontrado(a) para o id %d".formatted(entidade, id));
    }
}
