package com.pedrocanuto.agendamento.dto.response;

public record HistoricoMusicalResponseDTO(

        Boolean possuiExperienciaMusical,
        String descricaoExperienciaMusical,

        String instrumentosPreferidos,
        String estilosMusicaisPreferidos,
        String musicasSignificativas,

        Boolean possuiHipersensibilidadeSonora,
        String observacoesAuditivas
) {
}
