package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.ECategoriaServico;
import com.pedrocanuto.agendamento.domain.enums.EModalidadeServico;
import com.pedrocanuto.agendamento.domain.enums.ETipoContratacao;
import com.pedrocanuto.agendamento.domain.enums.ETipoEvento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Catálogo de preços administrado pelo professor. É a ÚNICA fonte de preço: o cliente nunca
 * envia valor. Editar uma linha aqui não altera Matricula/Agendamento já criados - eles guardam
 * um snapshot do valor no momento da contratação.
 *
 * <p>Para categorias de aula (Musicalização/Musicoterapia/Instrumento), uma linha é identificada
 * por categoria+modalidade+tipoContratacao - cada combinação tem seu próprio {@link #valor} FIXO
 * (não é um preço unitário multiplicado por desconto - a tabela real de negócio não segue uma
 * fórmula uniforme, e nem toda categoria oferece todos os tamanhos de pacote). {@link #duracaoPadraoMinutos}
 * é sempre obrigatório aqui.
 *
 * <p>Para EVENTO não existe esse eixo fixo: o professor cadastra quantos "pacotes" quiser (ex.:
 * "Roda de Música com Banda das Crianças"), cada um com nome/descrição/público-alvo/equipe/materiais
 * próprios - por isso modalidade e tipoContratacao ficam nulos e {@link #nome} vira obrigatório
 * nesse caso. Alguns pacotes de evento são "sob consulta" (sem preço/duração fixos) - por isso
 * {@link #valor} e {@link #duracaoPadraoMinutos} são nuláveis; o professor define o valor depois
 * via AgendamentoService.definirOrcamento quando for esse o caso.
 */
@Entity
@Table(name = "preco_servico")
@Getter
@Setter
@NoArgsConstructor
public class PrecoServico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ECategoriaServico categoria;

    /** Nula somente para categoria = EVENTO (não se aplica modalidade individual/grupo). */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EModalidadeServico modalidade;

    /** Nulo somente para categoria = EVENTO (evento não tem tamanho de pacote, é um pacote em si). */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ETipoContratacao tipoContratacao;

    /** Só para categoria = EVENTO: qual tipo de evento este pacote atende. */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ETipoEvento tipoEvento;

    /** Obrigatório só para categoria = EVENTO (nome do pacote, ex. "Festa Temática"). */
    @Column(length = 255)
    private String nome;

    @Column(length = 2000)
    private String descricao;

    /** Ex.: "1 a 4 anos". Só usado em EVENTO. */
    @Column(length = 255)
    private String publicoAlvo;

    /** Ex.: "Pedro Canuto", "Pedro + músico". Só usado em EVENTO. */
    @Column(length = 255)
    private String equipe;

    /** Ex.: "tapete, instrumentos, som reduzido". Só usado em EVENTO. */
    @Column(length = 1000)
    private String materiais;

    /** Valor fixo desta combinação exata (nunca calculado). Nulo quando o pacote é "sob consulta". */
    @Column(precision = 10, scale = 2)
    private BigDecimal valor;

    /** Nula para categoria = EVENTO quando a duração é sob consulta ou definida pelo cliente. Sempre obrigatória para categorias de aula. */
    private Integer duracaoPadraoMinutos;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();
}
