package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Turma;
import com.pedrocanuto.agendamento.dto.request.TurmaRequestDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TurmaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "codigo", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "criadaEm", ignore = true)
    @Mapping(target = "local", ignore = true)
    Turma toEntity(TurmaRequestDTO dto);

    TurmaResponseDTO toResponseDTO(Turma entity);
}
