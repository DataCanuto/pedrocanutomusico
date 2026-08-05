package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusMatricula;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Representa o "fechamento de um pacote" (tamanho definido por {@link ETipoContratacao} -
 * varia por categoria, ver PrecoServico). Cada aula agendada dentro do pacote vira um
 * {@link Agendamento} vinculado a esta matrícula. Não existe para categoria EVENTO (evento não
 * é recorrente).
 *
 * <p>O saldo de aulas restantes NÃO é armazenado aqui - é derivado em
 * {@code AgendamentoRepository.contarAgendamentosAtivosPorMatricula}, comparado com
 * {@link #aulasContratadas}, para evitar um contador que possa dessincronizar da realidade.
 */
@Entity
@Table(name = "matricula")
@Getter
@Setter
@NoArgsConstructor
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "preco_servico_id", nullable = false)
    private PrecoServico precoServico;

    /** Preenchido só quando a matrícula é de uma Turma (aula em grupo) - null para pacote individual. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id")
    private Turma turma;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ETipoContratacao tipoContratacao;

    /** Snapshot do valor total do pacote no momento da contratação (busca direta em PrecoServico, nunca calculado). */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private Integer aulasContratadas;

    /** Só se aplica quando a categoria do precoServico é AULA_INSTRUMENTO - o pacote todo é do mesmo instrumento. */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EInstrumento instrumento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EStatusMatricula status = EStatusMatricula.ATIVA;

    @Column(nullable = false)
    private LocalDateTime dataContratacao = LocalDateTime.now();
}
