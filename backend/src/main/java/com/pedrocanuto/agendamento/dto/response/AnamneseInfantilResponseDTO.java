package com.pedrocanuto.agendamento.dto.response;

/** Nulo quando o paciente não é criança. */
public record AnamneseInfantilResponseDTO(

        String gestacao,
        String parto,
        String desenvolvimentoMotor,
        String desenvolvimentoLinguagem,
        String desenvolvimentoSocial,
        String desenvolvimentoEscolar,
        String comportamentoCasa,
        String comportamentoEscola,
        String seletividadeAlimentar,
        Boolean desfraldeConcluido,
        Boolean usaFraldas,
        String interessesCrianca,
        String brincadeirasFavoritas
) {
}
