package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Uma visita agendada (uma aula, uma turma ou um evento). {@code categoria} vive direto aqui
 * (não é só derivada de precoServico) para não depender de uma associação opcional para saber o
 * tipo do agendamento. {@code aluno} e {@code matricula} são obrigatórios quando
 * {@code categoria.isAulaTipo()} e proibidos (permanecem nulos) quando é EVENTO - EVENTO não é
 * recorrente, então não tem pacote/matrícula. A única exceção é {@code aluno} em EVENTO com
 * {@code tipoEvento == ANIVERSARIO}, onde ele guarda o aniversariante (sem matrícula, já que
 * segue sem haver pacote de aula). {@code precoServico} é obrigatório em ambos os
 * casos (para EVENTO, referencia o "pacote"/proposta escolhido no catálogo); {@code valorCobrado}
 * é copiado do precoServico na criação, mas fica nulo quando o pacote escolhido é "sob consulta"
 * (sem preço fixo) até o professor definir o orçamento - ver validação em AgendamentoValidator,
 * já que essas regras dependem de outro campo e não viram CHECK simples.
 *
 * <p>{@code codigoPublico} é um identificador não sequencial (diferente do {@code id} interno)
 * para o cliente consultar sua própria aula sem expor a de terceiros por tentativa de id.
 */
@Entity
@Table(name = "agendamento")
@Getter
@Setter
@NoArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36)
    private String codigoPublico = UUID.randomUUID().toString();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricula_id")
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preco_servico_id")
    private PrecoServico precoServico;

    /** Preenchida só quando o agendamento veio de uma inscrição em Turma. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id")
    private Turma turma;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ECategoriaServico categoria;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EInstrumento instrumento;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ETipoEvento tipoEvento;

    /** Local do evento ou da turma (aula individual não usa - acontece no espaço padrão do professor). */
    private String local;

    /** Só para EVENTO: músicas que o cliente pediu para não faltar na apresentação. */
    @ElementCollection
    @CollectionTable(name = "agendamento_musica", joinColumns = @JoinColumn(name = "agendamento_id"))
    @Column(name = "musica", length = 255)
    private List<String> musicasObrigatorias = new ArrayList<>();

    /** Snapshot: preço cobrado. Nulo quando o pacote escolhido é "sob consulta", até o professor definir o orçamento. */
    @Column(precision = 10, scale = 2)
    private BigDecimal valorCobrado;

    @Column(nullable = false)
    private Integer duracaoMinutos;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EStatusAgendamento status = EStatusAgendamento.AGENDADO;

    /** Setada automaticamente quando o status muda para CHECK_IN - necessária para a regra de auto-finalização futura mesmo o status em si sendo transitório. */
    private LocalDateTime dataHoraCheckIn;

    /** Setada automaticamente quando o status muda para FINALIZADO. */
    private LocalDateTime dataHoraFinalizacao;

    @Column(length = 1000)
    private String observacoes;

    @Column(nullable = false)
    private LocalDateTime dataHoraAgendamento = LocalDateTime.now();
}
