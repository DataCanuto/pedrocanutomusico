package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.ESexo;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Conta/contato: quem se cadastra no site, é responsável financeiro e recebe contato via
 * WhatsApp. Não é necessariamente quem recebe o serviço - ver {@link Aluno}.
 */
@Entity
@Table(name = "cliente")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String telefone;

    private String email;

    @Column(length = 11)
    private String cpf;

    @Column(length = 14)
    private String cnpj;

    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ESexo sexo;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<Endereco> enderecos = new ArrayList<>();

    @OneToMany(mappedBy = "responsavel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Aluno> alunos = new ArrayList<>();
}
