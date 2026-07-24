package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.ESexo;
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
import java.time.Period;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Quem efetivamente recebe o serviço. Pode ser o próprio {@link Cliente} (aula individual
 * de um adulto, ex. "Pedro faz aula de violão") ou um dependente dele (ex. "Maria matriculou
 * Sofia e Lara"). Quando é o próprio cliente, {@code ehProprioResponsavel} fica true e os
 * dados de nome/nascimento são copiados uma única vez no cadastro (sem sincronização
 * automática posterior).
 */
@Entity
@Table(name = "aluno")
@Getter
@Setter
@NoArgsConstructor
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ESexo sexo;

    @Column(length = 1000)
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsavel_id", nullable = false)
    private Cliente responsavel;

    @Column(nullable = false)
    private boolean ehProprioResponsavel = false;

    public int getIdade() {
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }
}
