package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.EStatusAgendamento;
import jakarta.persistence.Column;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Uma ocorrência semanal específica de uma {@link Turma} (ex.: "a aula de violão da quarta-feira
 * dia 12/08"), tratada como um compromisso único na agenda do professor - reaproveita
 * {@link EStatusAgendamento} para o mesmo ciclo confirmar/check-in/iniciar/finalizar (sem
 * "marcar falta", que não faz sentido para a turma inteira).
 *
 * <p>Só é persistida quando o professor de fato interage com ela (primeira transição de status,
 * ver {@code TurmaOcorrenciaService#buscarOuMaterializar}) - antes disso, a ocorrência é
 * "virtual": computada a partir de {@code turma.diaSemana} batendo com a data e
 * {@code turma.status == ATIVA} (mesmo espírito de {@code AgendamentoService#turmasNoDiaDaSemana}
 * e do saldo de aulas de {@link Matricula}, que também nunca é armazenado). Turma não tem data de
 * término, então gerar todas as ocorrências futuras antecipadamente não se aplica aqui.
 */
@Entity
@Table(name = "turma_ocorrencia")
@Getter
@Setter
@NoArgsConstructor
public class TurmaOcorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turma_id", nullable = false)
    private Turma turma;

    @Column(nullable = false)
    private LocalDate data;

    /**
     * Preenchida só quando esta ocorrência foi reagendada (ver TurmaOcorrenciaService#reagendar):
     * a data natural (turma.diaSemana) que ela ocupava antes de mover para {@link #data}. Usada só
     * para a agenda não gerar uma ocorrência virtual fantasma para o slot semanal que ficou vago -
     * ver AgendaAdminService#listarOcorrenciasDeTurma. Nunca é sobrescrita num segundo
     * reagendamento - sempre guarda a primeira/verdadeira data natural.
     */
    private LocalDate dataOriginal;

    /**
     * Sobrescreve {@code turma.hora} só quando esta ocorrência foi reagendada para um horário
     * diferente do recorrente da Turma - nulo (o normal) significa "usa o horário da turma" (ver
     * TurmaOcorrenciaMapper).
     */
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EStatusAgendamento status = EStatusAgendamento.AGENDADO;

    private LocalDateTime dataHoraCheckIn;

    private LocalDateTime dataHoraFinalizacao;

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();
}
