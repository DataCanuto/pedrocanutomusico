package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Cliente;
import com.pedrocanuto.agendamento.dto.request.ClienteRequestDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteListItemResponseDTO;
import com.pedrocanuto.agendamento.dto.response.ClienteResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {EnderecoMapper.class, AlunoMapper.class}, imports = EnderecoFormatter.class)
public interface ClienteMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "alunos", ignore = true)
    Cliente toEntity(ClienteRequestDTO dto);

    ClienteResponseDTO toResponseDTO(Cliente entity);

    @Mapping(target = "enderecoResumo", expression = "java(EnderecoFormatter.resumoPrimeiroEndereco(entity.getEnderecos()))")
    ClienteListItemResponseDTO toListItemResponseDTO(Cliente entity);
}
