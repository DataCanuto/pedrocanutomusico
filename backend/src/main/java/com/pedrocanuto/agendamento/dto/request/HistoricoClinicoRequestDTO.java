package com.pedrocanuto.agendamento.dto.request;

/** Sem validação de obrigatoriedade nos campos clínicos: quem preenche pode não ter todas as respostas na primeira sessão. */
public record HistoricoClinicoRequestDTO(

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
