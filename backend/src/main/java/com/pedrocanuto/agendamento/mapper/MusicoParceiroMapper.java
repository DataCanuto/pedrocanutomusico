package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.MusicoParceiro;
import com.pedrocanuto.agendamento.dto.request.MusicoParceiroRequestDTO;
import com.pedrocanuto.agendamento.dto.response.MusicoParceiroResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MusicoParceiroMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    MusicoParceiro toEntity(MusicoParceiroRequestDTO dto);

    MusicoParceiroResponseDTO toResponseDTO(MusicoParceiro entity);
}
