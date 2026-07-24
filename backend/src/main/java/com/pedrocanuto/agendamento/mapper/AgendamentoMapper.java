package com.pedrocanuto.agendamento.mapper;

import com.pedrocanuto.agendamento.domain.Agendamento;
import com.pedrocanuto.agendamento.dto.response.AgendamentoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = EnderecoFormatter.class)
public interface AgendamentoMapper {

    @Mapping(target = "clienteId", source = "cliente.id")
    @Mapping(target = "clienteNome", source = "cliente.nome")
    @Mapping(target = "clienteTelefone", source = "cliente.telefone")
    @Mapping(target = "enderecoResumo", expression = "java(EnderecoFormatter.resumoPrimeiroEndereco(entity.getCliente().getEnderecos()))")
    @Mapping(target = "alunoId", source = "aluno.id")
    @Mapping(target = "alunoNome", source = "aluno.nome")
    @Mapping(target = "matriculaId", source = "matricula.id")
    @Mapping(target = "turmaId", source = "turma.id")
    @Mapping(target = "modalidade", source = "precoServico.modalidade")
    @Mapping(target = "pacoteEventoNome", source = "precoServico.nome")
    AgendamentoResponseDTO toResponseDTO(Agendamento entity);
}
