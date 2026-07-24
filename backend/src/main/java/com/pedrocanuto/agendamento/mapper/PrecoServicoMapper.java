package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.PrecoServico;
import com.pedrocanuto.agendamento.dto.request.PrecoServicoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.PrecoServicoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PrecoServicoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    PrecoServico toEntity(PrecoServicoRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    void atualizarEntity(PrecoServicoRequestDTO dto, @MappingTarget PrecoServico entity);

    PrecoServicoResponseDTO toResponseDTO(PrecoServico entity);
}
