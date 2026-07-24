package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Matricula;
import com.pedrocanuto.agendamento.dto.response.MatriculaResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MatriculaMapper {

    @Mapping(target = "clienteId", source = "matricula.cliente.id")
    @Mapping(target = "alunoId", source = "matricula.aluno.id")
    @Mapping(target = "alunoNome", source = "matricula.aluno.nome")
    @Mapping(target = "categoria", source = "matricula.precoServico.categoria")
    @Mapping(target = "modalidade", source = "matricula.precoServico.modalidade")
    @Mapping(target = "aulasRestantes", source = "aulasRestantes")
    MatriculaResponseDTO toResponseDTO(Matricula matricula, long aulasRestantes);
}
