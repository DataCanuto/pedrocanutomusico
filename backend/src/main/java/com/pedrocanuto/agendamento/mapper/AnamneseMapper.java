package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Anamnese;
import com.pedrocanuto.agendamento.domain.embeddable.AnamneseInfantil;
import com.pedrocanuto.agendamento.domain.embeddable.HistoricoClinico;
import com.pedrocanuto.agendamento.domain.embeddable.HistoricoMusical;
import com.pedrocanuto.agendamento.domain.embeddable.PerfilDesenvolvimento;
import com.pedrocanuto.agendamento.domain.embeddable.ResponsavelAnamnese;
import com.pedrocanuto.agendamento.dto.request.AnamneseInfantilRequestDTO;
import com.pedrocanuto.agendamento.dto.request.AnamneseMusicoterapiaRequestDTO;
import com.pedrocanuto.agendamento.dto.request.HistoricoClinicoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.HistoricoMusicalRequestDTO;
import com.pedrocanuto.agendamento.dto.request.PerfilDesenvolvimentoRequestDTO;
import com.pedrocanuto.agendamento.dto.request.ResponsavelRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AnamneseInfantilResponseDTO;
import com.pedrocanuto.agendamento.dto.response.AnamneseMusicoterapiaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.HistoricoClinicoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.HistoricoMusicalResponseDTO;
import com.pedrocanuto.agendamento.dto.response.PerfilDesenvolvimentoResponseDTO;
import com.pedrocanuto.agendamento.dto.response.ResponsavelResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Os métodos de sub-bloco (HistoricoClinico, PerfilDesenvolvimento, HistoricoMusical,
 * ResponsavelAnamnese, AnamneseInfantil) não são referenciados diretamente pelos métodos
 * principais - o MapStruct os resolve sozinho por nome/tipo de campo (mesmo padrão do
 * ClienteMapper com EnderecoMapper).
 */
@Mapper(componentModel = "spring")
public interface AnamneseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "aluno", ignore = true)
    @Mapping(target = "criadaEm", ignore = true)
    Anamnese toEntity(AnamneseMusicoterapiaRequestDTO dto);

    HistoricoClinico toEntity(HistoricoClinicoRequestDTO dto);

    PerfilDesenvolvimento toEntity(PerfilDesenvolvimentoRequestDTO dto);

    HistoricoMusical toEntity(HistoricoMusicalRequestDTO dto);

    ResponsavelAnamnese toEntity(ResponsavelRequestDTO dto);

    AnamneseInfantil toEntity(AnamneseInfantilRequestDTO dto);

    @Mapping(target = "alunoId", source = "aluno.id")
    AnamneseMusicoterapiaResponseDTO toResponseDTO(Anamnese entity);

    HistoricoClinicoResponseDTO toResponseDTO(HistoricoClinico entity);

    PerfilDesenvolvimentoResponseDTO toResponseDTO(PerfilDesenvolvimento entity);

    HistoricoMusicalResponseDTO toResponseDTO(HistoricoMusical entity);

    ResponsavelResponseDTO toResponseDTO(ResponsavelAnamnese entity);

    AnamneseInfantilResponseDTO toResponseDTO(AnamneseInfantil entity);
}
