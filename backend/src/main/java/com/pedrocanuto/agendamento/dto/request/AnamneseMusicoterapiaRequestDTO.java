package com.pedrocanuto.agendamento.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Representa a anamnese completa coletada no agendamento de Musicoterapia. Será usada dentro do
 * request de agendamento dessa categoria (peça separada, fora do escopo deste DTO).
 *
 * responsavel e anamneseInfantil ficam nulos quando não se aplicam (paciente adulto não tem
 * anamneseInfantil; paciente maior de idade normalmente não precisa de responsavel) - quem decide
 * quando cada bloco é obrigatório é a camada de negócio, não este DTO.
 */
public record AnamneseMusicoterapiaRequestDTO(

        @PositiveOrZero Integer idade,
        String profissao,
        String escolaridade,
        String estadoCivil,

        String motivoEncaminhamento,
        String queixaPrincipal,
        String objetivosPaciente,

        @Valid HistoricoClinicoRequestDTO historicoClinico,
        @Valid PerfilDesenvolvimentoRequestDTO perfilDesenvolvimento,
        @Valid HistoricoMusicalRequestDTO historicoMusical,

        String objetivosMusicoterapeuticos,
        String observacoesGerais,

        @Valid ResponsavelRequestDTO responsavel,
        @Valid AnamneseInfantilRequestDTO anamneseInfantil
) {
}
