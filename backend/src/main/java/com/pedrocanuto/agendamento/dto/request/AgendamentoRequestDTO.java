package com.pedrocanuto.agendamento.dto.request;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Requisição pública de agendamento (fluxo do PROJECT.md: serviço -> modalidade -> formulário
 * -> horário -> cria agendamento). Nunca traz preço/duração fixa: ambos são sempre calculados/
 * resolvidos no servidor a partir de PrecoServico + regra de pacote/idade (nunca confiar em
 * dado do cliente) - duracaoMinutosEvento é a única exceção parcial, usado apenas quando o
 * pacote de evento escolhido não tem duração padrão cadastrada (ver AgendamentoService).
 *
 * Campos condicionais por categoria (validados em AgendamentoValidator, não aqui, porque a
 * obrigatoriedade depende do valor de outro campo - Bean Validation puro não expressa isso
 * com legibilidade):
 * - aluno, modalidade, tipoContratacao: obrigatórios quando categoria != EVENTO, proibidos quando == EVENTO.
 * - instrumento: obrigatório apenas quando categoria == AULA_INSTRUMENTO.
 * - tipoEvento, enderecoEvento, eventoPrecoServicoId: obrigatórios apenas quando categoria == EVENTO.
 * - duracaoMinutosEvento: só exigido quando categoria == EVENTO e o pacote escolhido não tem
 *   duração padrão cadastrada (checado em AgendamentoService, que é quem sabe o valor do pacote).
 * - anamnese: opcional, só permitido quando categoria == MUSICOTERAPIA. É gravada apenas na
 *   primeira vez que o aluno agenda (ver AnamneseService.criarSeAusente) - não é obrigatória em
 *   toda reserva nem sobrescreve uma anamnese já existente.
 */
public record AgendamentoRequestDTO(

        @NotNull @Valid ClienteRequestDTO cliente,

        @Valid AlunoSelecaoRequestDTO aluno,

        @NotNull ECategoriaServico categoria,

        EModalidadeServico modalidade,

        ETipoContratacao tipoContratacao,

        EInstrumento instrumento,

        ETipoEvento tipoEvento,

        /** Qual pacote/proposta de evento do catálogo (PrecoServico com categoria=EVENTO) o cliente escolheu. */
        Long eventoPrecoServicoId,

        /** Endereço completo de onde o evento vai acontecer - só para categoria == EVENTO. */
        @Valid EnderecoRequestDTO enderecoEvento,

        Integer duracaoMinutosEvento,

        /** Só para EVENTO: músicas que não podem faltar. */
        List<String> musicasObrigatorias,

        /** Só para MUSICOTERAPIA, opcional - ver javadoc da classe. */
        @Valid AnamneseMusicoterapiaRequestDTO anamnese,

        @NotNull @FutureOrPresent LocalDate data,

        @NotNull LocalTime hora,

        String observacoes
) {
}
