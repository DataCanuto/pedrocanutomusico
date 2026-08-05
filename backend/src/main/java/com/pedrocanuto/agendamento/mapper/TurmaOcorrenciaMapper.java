package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.TurmaOcorrencia;
import com.pedrocanuto.agendamento.dto.response.AlunoDaTurmaResponseDTO;
import com.pedrocanuto.agendamento.dto.response.TurmaOcorrenciaResponseDTO;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TurmaOcorrenciaMapper {

    @Mapping(target = "turmaId", source = "ocorrencia.turma.id")
    @Mapping(target = "turmaCodigo", source = "ocorrencia.turma.codigo")
    @Mapping(target = "categoria", source = "ocorrencia.turma.categoria")
    @Mapping(target = "instrumento", source = "ocorrencia.turma.instrumento")
    @Mapping(target = "hora", source = "ocorrencia.turma.hora")
    @Mapping(target = "local", source = "ocorrencia.turma.local")
    @Mapping(target = "duracaoMinutos", source = "duracaoMinutos")
    @Mapping(target = "alunosAtivos", source = "alunosAtivos")
    TurmaOcorrenciaResponseDTO toResponseDTO(TurmaOcorrencia ocorrencia, Integer duracaoMinutos, List<AlunoDaTurmaResponseDTO> alunosAtivos);
}
