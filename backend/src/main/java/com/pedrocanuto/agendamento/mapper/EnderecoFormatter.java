package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import java.util.List;

/**
 * Formata o endereço principal (primeiro da lista, ordenado por id) em uma única linha, usado
 * tanto na listagem resumida de clientes (Q5) quanto no response de Agendamento. Fica fora dos
 * mappers MapStruct porque a regra ("pega o primeiro da lista e formata") não é um mapeamento
 * campo-a-campo simples.
 */
public final class EnderecoFormatter {

    private EnderecoFormatter() {
    }

    public static String resumoPrimeiroEndereco(List<Endereco> enderecos) {
        if (enderecos == null || enderecos.isEmpty()) {
            return null;
        }
        return resumo(enderecos.get(0));
    }

    public static String resumo(Endereco endereco) {
        if (endereco == null) {
            return null;
        }
        return "%s, %s - %s, %s/%s".formatted(
                endereco.getRua(),
                endereco.getNumero(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado()
        );
    }

    /** Mesmo formato de {@link #resumo(Endereco)}, usado para o endereço de evento (não persistido como Endereco - ver AgendamentoService). */
    public static String resumo(EnderecoRequestDTO endereco) {
        if (endereco == null) {
            return null;
        }
        return "%s, %s - %s, %s/%s".formatted(
                endereco.rua(),
                endereco.numero(),
                endereco.bairro(),
                endereco.cidade(),
                endereco.estado()
        );
    }
}
