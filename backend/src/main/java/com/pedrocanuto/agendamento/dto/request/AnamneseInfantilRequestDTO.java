package com.pedrocanuto.agendamento.dto.request;

/** Preenchido só quando o paciente é criança - ausente (null) caso contrário. */
public record AnamneseInfantilRequestDTO(

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
