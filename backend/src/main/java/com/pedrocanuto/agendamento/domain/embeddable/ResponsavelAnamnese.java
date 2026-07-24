package com.pedrocanuto.agendamento.domain.embeddable;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Responsável legal registrado na anamnese (paciente menor de idade) - independe do Cliente/responsável financeiro do Aluno. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ResponsavelAnamnese {

    private String nome;
    private String parentesco;
    private String telefone;
    private String email;
}
