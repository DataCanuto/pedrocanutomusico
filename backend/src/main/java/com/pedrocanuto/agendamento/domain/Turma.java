package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import com.pedrocanuto.agendamento.domain.enums.EStatusTurma;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Um horário recorrente de aula em grupo criado pelo professor, com um {@link #codigo} curto
 * que as famílias usam para matricular seus alunos. A Turma fixa categoria/modalidade=GRUPO/
 * diaSemana/hora/local - cada família escolhe seu próprio tamanho de pacote (avulso/2/3/4) ao
 * entrar, e o backend gera automaticamente todas as datas do pacote nesse dia/horário (mesma
 * regra do agendamento individual recorrente - ver GeradorDeDatasRecorrentes), sempre dentro da
 * janela de 31 dias corridos a partir de hoje. Cada família recebe sua própria
 * {@link Matricula}/{@link Agendamento}s (preço de grupo é por aluno, não uma taxa única da
 * turma - ver prices.txt). {@link #codigo} é curto e alfanumérico (pensado para ser falado/
 * digitado por telefone), diferente do {@code codigoPublico} de Agendamento (um UUID, pensado
 * para link/cópia).
 */
@Entity
@Table(name = "turma")
@Getter
@Setter
@NoArgsConstructor
public class Turma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ECategoriaServico categoria;

    /** Obrigatório só quando categoria = AULA_INSTRUMENTO (uma turma de grupo ensina um instrumento por vez). */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EInstrumento instrumento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private DayOfWeek diaSemana;

    @Column(nullable = false)
    private LocalTime hora;

    @Column(nullable = false)
    private String local;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EStatusTurma status = EStatusTurma.ATIVA;

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();
}
