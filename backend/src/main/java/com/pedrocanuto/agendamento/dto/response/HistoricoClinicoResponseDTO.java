package com.pedrocanuto.agendamento.dto.response;

public record HistoricoClinicoResponseDTO(

        Boolean possuiDiagnostico,
        String diagnosticos,

        Boolean fazUsoMedicamentos,
        String medicamentos,

        Boolean possuiAcompanhamentoMedico,
        String especialidadesMedicas,

        Boolean possuiAcompanhamentoPsicologico,
        String observacoesAcompanhamentoPsicologico,

        Boolean possuiAlergias,
        String alergias
) {
}
