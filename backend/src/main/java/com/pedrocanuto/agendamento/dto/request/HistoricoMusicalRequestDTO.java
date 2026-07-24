package com.pedrocanuto.agendamento.dto.request;

public record HistoricoMusicalRequestDTO(

        Boolean possuiExperienciaMusical,
        String descricaoExperienciaMusical,

        String instrumentosPreferidos,
        String estilosMusicaisPreferidos,
        String musicasSignificativas,

        Boolean possuiHipersensibilidadeSonora,
        String observacoesAuditivas
) {
}
