package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Endereco;
import com.pedrocanuto.agendamento.dto.request.EnderecoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.EnderecoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnderecoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    Endereco toEntity(EnderecoRequestDTO dto);

    EnderecoResponseDTO toResponseDTO(Endereco entity);
}
