package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.embeddable.AnamneseInfantil;
import com.pedrocanuto.agendamento.domain.embeddable.HistoricoClinico;
import com.pedrocanuto.agendamento.domain.embeddable.HistoricoMusical;
import com.pedrocanuto.agendamento.domain.embeddable.PerfilDesenvolvimento;
import com.pedrocanuto.agendamento.domain.embeddable.ResponsavelAnamnese;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Anamnese de Musicoterapia: perfil clínico/terapêutico do paciente, 1:1 com {@link Aluno}.
 * Preenchida uma única vez (na primeira sessão) e não repetida a cada agendamento - único ponto
 * de escrita é {@code AgendamentoService.criar}, que só grava quando o aluno ainda não tem uma
 * (ver {@code AnamneseService.criarSeAusente}); edição posterior fica fora de escopo por ora.
 */
@Entity
@Table(name = "anamnese")
@Getter
@Setter
@NoArgsConstructor
public class Anamnese {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false, unique = true)
    private Aluno aluno;

    private Integer idade;
    private String profissao;
    private String escolaridade;
    private String estadoCivil;

    @Column(length = 2000)
    private String motivoEncaminhamento;

    @Column(length = 2000)
    private String queixaPrincipal;

    @Column(length = 2000)
    private String objetivosPaciente;

    @Embedded
    private HistoricoClinico historicoClinico = new HistoricoClinico();

    @Embedded
    private PerfilDesenvolvimento perfilDesenvolvimento = new PerfilDesenvolvimento();

    @Embedded
    private HistoricoMusical historicoMusical = new HistoricoMusical();

    @Column(length = 2000)
    private String objetivosMusicoterapeuticos;

    @Column(length = 2000)
    private String observacoesGerais;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "nome", column = @Column(name = "responsavel_nome")),
            @AttributeOverride(name = "parentesco", column = @Column(name = "responsavel_parentesco")),
            @AttributeOverride(name = "telefone", column = @Column(name = "responsavel_telefone")),
            @AttributeOverride(name = "email", column = @Column(name = "responsavel_email"))
    })
    private ResponsavelAnamnese responsavel = new ResponsavelAnamnese();

    /** Só preenchido quando o paciente é criança. */
    @Embedded
    private AnamneseInfantil anamneseInfantil = new AnamneseInfantil();

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();
}
