package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Aluno;
import com.pedrocanuto.agendamento.dto.request.AlunoRequestDTO;
import com.pedrocanuto.agendamento.dto.response.AlunoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlunoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "responsavel", ignore = true)
    @Mapping(target = "ehProprioResponsavel", ignore = true)
    Aluno toEntity(AlunoRequestDTO dto);

    @Mapping(target = "idade", expression = "java(entity.getIdade())")
    AlunoResponseDTO toResponseDTO(Aluno entity);
}
