package com.pedrocanuto.agendamento.dto.response;

import java.time.LocalDateTime;

public record AnamneseMusicoterapiaResponseDTO(

        Long id,
        Long alunoId,

        Integer idade,
        String profissao,
        String escolaridade,
        String estadoCivil,

        String motivoEncaminhamento,
        String queixaPrincipal,
        String objetivosPaciente,

        HistoricoClinicoResponseDTO historicoClinico,
        PerfilDesenvolvimentoResponseDTO perfilDesenvolvimento,
        HistoricoMusicalResponseDTO historicoMusical,

        String objetivosMusicoterapeuticos,
        String observacoesGerais,

        ResponsavelResponseDTO responsavel,
        AnamneseInfantilResponseDTO anamneseInfantil,

        LocalDateTime criadaEm
) {
}
