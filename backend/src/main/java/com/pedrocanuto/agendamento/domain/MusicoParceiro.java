package com.pedrocanuto.agendamento.domain;

import com.pedrocanuto.agendamento.domain.enums.EInstrumento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Músico parceiro que o professor pode chamar para reforçar eventos/turmas maiores. Cadastro simples, sem vínculo com agendamento ainda. */
@Entity
@Table(name = "musico_parceiro")
@Getter
@Setter
@NoArgsConstructor
public class MusicoParceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EInstrumento instrumento;

    @Column(nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
